import type { Config, Context } from "@netlify/functions";
import { z } from "zod";
import type { ExecuteToolResponse } from "../../shared/api";
import { HederaAgentKitProvider } from "../lib/chat/hederaAgentKitProvider";
import { isPaidHederaTool } from "../lib/chat/paidTools";
import { assertSameOrigin, clientIp, errorResponse, HttpError, json, readJsonBody } from "../lib/http";
import { requireOperator } from "../lib/hedera";
import { rateLimit } from "../lib/rateLimit";

const schema = z.object({
    tool: z.string().min(1).max(160),
    input: z.record(z.string(), z.unknown()),
});

/**
 * Runs one chatbot action the user has just accepted in the UI (the chat never runs paid tools by
 * itself). Only the Hedera Agent Kit's paid tools are accepted here.
 */
export default async (req: Request, context: Context) => {
    try {
        assertSameOrigin(req);
        rateLimit(`chat-exec:${clientIp(req, context)}`, 10, 60_000);

        const parsed = schema.safeParse(await readJsonBody(req, 100_000));
        if (!parsed.success) {
            throw new HttpError(400, "Invalid request");
        }

        const name = parsed.data.tool.replace(/^hedera__/, "");
        if (!parsed.data.tool.startsWith("hedera__") || !isPaidHederaTool(name)) {
            throw new HttpError(400, "This tool cannot be run from here");
        }

        const provider = new HederaAgentKitProvider(requireOperator());
        const raw = await provider.callTool(name, parsed.data.input);

        let summary = raw;
        try {
            const result = JSON.parse(raw) as { humanMessage?: string };
            summary = result.humanMessage ?? raw;
        } catch {
            // Not JSON: use the text as is.
        }
        const body: ExecuteToolResponse = { summary: summary.slice(0, 2000) };
        return json(body);
    } catch (error) {
        return errorResponse(error);
    }
};

export const config: Config = {
    path: "/api/chat/execute",
    method: "POST",
};
