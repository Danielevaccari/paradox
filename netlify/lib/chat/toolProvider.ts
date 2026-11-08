import type Anthropic from "@anthropic-ai/sdk";

/**
 * A source of tools for the chatbot. The chat loop only talks to this interface, so new sources
 * (another MCP server, a local plugin) can be added without touching the loop.
 */
export interface ToolProvider {
    /** Short, unique prefix for this provider's tools, e.g. "hedera" or "trace". */
    readonly id: string;
    /** Tool definitions with provider-local names (no prefix). */
    listTools(): Promise<Anthropic.Beta.BetaTool[]>;
    /** Runs a tool by its provider-local name and returns text for the model. Throw to report a failure. */
    callTool(name: string, input: unknown): Promise<string>;
    close?(): Promise<void>;
}

const SEPARATOR = "__";

/** Merges several providers into one namespaced tool list (`<provider>__<tool>`). */
export class ToolRegistry {
    private constructor(
        private readonly providers: ToolProvider[],
        readonly tools: Anthropic.Beta.BetaTool[],
    ) {}

    static async create(providers: ToolProvider[]) {
        const lists = await Promise.allSettled(providers.map((provider) => provider.listTools()));
        const active: ToolProvider[] = [];
        const tools: Anthropic.Beta.BetaTool[] = [];

        lists.forEach((result, index) => {
            const provider = providers[index];
            if (result.status === "rejected") {
                // One unreachable MCP server should not take the whole chatbot down.
                console.error(`Tool provider "${provider.id}" is unavailable`, result.reason);
                return;
            }
            active.push(provider);
            for (const tool of result.value) {
                tools.push({ ...tool, name: `${provider.id}${SEPARATOR}${tool.name}`.slice(0, 128) });
            }
        });

        return new ToolRegistry(active, tools);
    }

    async call(qualifiedName: string, input: unknown) {
        const separatorIndex = qualifiedName.indexOf(SEPARATOR);
        const providerId = qualifiedName.slice(0, separatorIndex);
        const name = qualifiedName.slice(separatorIndex + SEPARATOR.length);
        const provider = this.providers.find((p) => p.id === providerId);

        if (separatorIndex < 0 || !provider) {
            throw new Error(`Unknown tool ${qualifiedName}`);
        }
        return provider.callTool(name, input);
    }

    async close() {
        await Promise.allSettled(this.providers.map((provider) => provider.close?.()));
    }
}
