import Anthropic from "@anthropic-ai/sdk";
import type { ChatEvent, ChatMessage, HederaNetwork } from "../../../shared/api";
import type { ToolRegistry } from "./toolProvider";

const MAX_ITERATIONS = 8;
const MAX_TOOL_RESULT_CHARS = 12_000;

const systemPrompt = (network: HederaNetwork, accountId: string) =>
    [
        "You are the assistant inside Paradox, a web app for the Hedera Consensus Service (HCS).",
        `You act on Hedera ${network} through the operator account ${accountId}, which pays for and signs every transaction.`,
        "Use the tools to create topics, submit topic messages, read topic info and messages, and check HBAR balances.",
        "Hedera ids look like 0.0.12345. Ask for a topic id when the user has not given one; never invent ids.",
        "Before creating a topic or submitting a message, make sure you know the memo or message text the user wants.",
        "After a write, report the resulting topic id or sequence number. New messages can take a few seconds to show up in queries.",
        "Keep answers short and use plain text; the chat window is narrow.",
    ].join("\n");

export interface RunChatOptions {
    messages: ChatMessage[];
    registry: ToolRegistry;
    model: string;
    network: HederaNetwork;
    accountId: string;
    emit: (event: ChatEvent) => void;
    signal?: AbortSignal;
}

const truncate = (text: string) => (text.length > MAX_TOOL_RESULT_CHARS ? `${text.slice(0, MAX_TOOL_RESULT_CHARS)}\n…(truncated)` : text);

/** Manual tool loop: stream a turn, run the requested tools, feed results back, repeat. */
export const runChat = async ({ messages, registry, model, network, accountId, emit, signal }: RunChatOptions) => {
    const client = new Anthropic();
    const history: Anthropic.Beta.BetaMessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));
    let jsonRetries = 0;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const stream = client.beta.messages.stream(
            {
                model,
                max_tokens: 16000,
                betas: ["server-side-fallback-2026-07-01"],
                fallbacks: "default",
                output_config: { effort: "medium" },
                system: [{ type: "text", text: systemPrompt(network, accountId), cache_control: { type: "ephemeral" } }],
                tools: registry.tools,
                messages: history,
            },
            { signal },
        );

        stream.on("text", (text) => emit({ type: "text", text }));

        let message: Anthropic.Beta.BetaMessage;
        try {
            message = await stream.finalMessage();
            jsonRetries = 0;
        } catch (error) {
            // With eager input streaming, unparseable tool JSON rejects finalMessage(); retry that turn.
            if (error instanceof Anthropic.APIError || signal?.aborted || jsonRetries++ >= 2) {
                throw error;
            }
            continue;
        }

        if (message.stop_reason === "refusal") {
            emit({ type: "error", message: "Claude declined this request." });
            return;
        }
        if (message.stop_reason === "pause_turn") {
            history.push({ role: "assistant", content: message.content });
            continue;
        }

        const toolUses = message.content.filter((block): block is Anthropic.Beta.BetaToolUseBlock => block.type === "tool_use");
        if (message.stop_reason !== "tool_use" || toolUses.length === 0) {
            return;
        }

        history.push({ role: "assistant", content: message.content });

        // Run the tools of one turn concurrently and return all results in a single user message.
        const results = await Promise.all(
            toolUses.map(async (toolUse): Promise<Anthropic.Beta.BetaToolResultBlockParam> => {
                emit({ type: "tool", id: toolUse.id, name: toolUse.name, status: "start" });
                try {
                    const output = await registry.call(toolUse.name, toolUse.input);
                    emit({ type: "tool", id: toolUse.id, name: toolUse.name, status: "ok" });
                    return { type: "tool_result", tool_use_id: toolUse.id, content: truncate(output) };
                } catch (error) {
                    emit({ type: "tool", id: toolUse.id, name: toolUse.name, status: "error" });
                    const reason = error instanceof Error ? error.message : String(error);
                    return { type: "tool_result", tool_use_id: toolUse.id, is_error: true, content: truncate(reason) };
                }
            }),
        );

        history.push({ role: "user", content: results });
        emit({ type: "text", text: "\n\n" });
    }

    emit({ type: "error", message: "Stopped after too many tool calls. Try a more specific request." });
};
