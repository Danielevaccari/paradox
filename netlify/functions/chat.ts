import Anthropic from "@anthropic-ai/sdk";
import type { Config, Context } from "@netlify/functions";
import { z } from "zod";
import { LIMITS, type ChatEvent } from "../../shared/api";
import { runChat } from "../lib/chat/agent";
import { HederaAgentKitProvider } from "../lib/chat/hederaAgentKitProvider";
import { McpToolProvider } from "../lib/chat/mcpToolProvider";
import { ToolRegistry, type ToolProvider } from "../lib/chat/toolProvider";
import { getServerEnv } from "../lib/env";
import { assertSameOrigin, clientIp, errorResponse, HttpError, readJsonBody } from "../lib/http";
import { requireOperator } from "../lib/hedera";
import { rateLimit } from "../lib/rateLimit";

const requestSchema = z.object({
    messages: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(LIMITS.chatMaxMessageLength) }))
        .min(1)
        .max(LIMITS.chatMaxMessages)
        .refine(
            (messages) => messages[0].role === "user" && messages[messages.length - 1].role === "user",
            "Conversation must start and end with a user message",
        ),
});

const describeError = (error: unknown) => {
    if (error instanceof Anthropic.RateLimitError) {
        return "The AI service is busy. Please try again in a minute.";
    }
    if (error instanceof Anthropic.AuthenticationError) {
        return "The AI service is not configured correctly.";
    }
    if (error instanceof Anthropic.APIError) {
        return `The AI service returned an error (${error.status ?? "network"}).`;
    }
    return "Something went wrong while answering.";
};

export default async (req: Request, context: Context) => {
    let registry: ToolRegistry;
    let messages: z.infer<typeof requestSchema>["messages"];
    let env: ReturnType<typeof getServerEnv>;
    let operator: ReturnType<typeof requireOperator>;

    try {
        assertSameOrigin(req);
        env = getServerEnv();
        if (!env.anthropicConfigured) {
            throw new HttpError(503, "The chatbot is not configured on this server.");
        }
        rateLimit(`chat:${clientIp(req, context)}`, 8, 60_000);

        const parsed = requestSchema.safeParse(await readJsonBody(req, 200_000));
        if (!parsed.success) {
            throw new HttpError(400, parsed.error.issues.map((issue) => issue.message).join("; "));
        }
        messages = parsed.data.messages;
        operator = requireOperator();

        const providers: ToolProvider[] = [
            new HederaAgentKitProvider(operator),
            ...env.mcpServers.map((server) => new McpToolProvider(server)),
        ];
        registry = await ToolRegistry.create(providers);
    } catch (error) {
        return errorResponse(error);
    }

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
        async start(controller) {
            const emit = (event: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
            try {
                await runChat({
                    messages,
                    registry,
                    model: env.claudeModel,
                    network: operator.network,
                    accountId: operator.accountId.toString(),
                    emit,
                    signal: req.signal,
                });
            } catch (error) {
                console.error(error);
                emit({ type: "error", message: describeError(error) });
            } finally {
                emit({ type: "done" });
                await registry.close();
                controller.close();
            }
        },
    });

    return new Response(body, {
        headers: {
            "content-type": "application/x-ndjson; charset=utf-8",
            "cache-control": "no-store",
            "x-content-type-options": "nosniff",
        },
    });
};

export const config: Config = {
    path: "/api/chat",
    method: "POST",
};
