import type Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { McpServerConfig } from "../env";
import type { ToolProvider } from "./toolProvider";

/**
 * Connects to a remote MCP server over Streamable HTTP and exposes its tools to the chatbot.
 * Configured through the MCP_SERVERS env var, e.g. Daniele's C# traceability server:
 * MCP_SERVERS=[{"id":"trace","url":"https://example.com/mcp","headers":{"Authorization":"Bearer ..."}}]
 */
export class McpToolProvider implements ToolProvider {
    readonly id: string;
    private client: Client | null = null;
    /** Tools that declared themselves read-only (MCP annotation `readOnlyHint`). */
    private readonly readOnly = new Set<string>();

    constructor(private readonly server: McpServerConfig) {
        this.id = server.id;
    }

    private async connect() {
        if (!this.client) {
            const client = new Client({ name: "paradox-chat", version: "1.0.0" });
            const transport = new StreamableHTTPClientTransport(new URL(this.server.url), {
                requestInit: { headers: this.server.headers },
            });
            await client.connect(transport);
            this.client = client;
        }
        return this.client;
    }

    async listTools(): Promise<Anthropic.Beta.BetaTool[]> {
        const client = await this.connect();
        const { tools } = await client.listTools();
        for (const tool of tools) {
            if (tool.annotations?.readOnlyHint === true) {
                this.readOnly.add(tool.name);
            }
        }
        return tools.map((tool) => ({
            name: tool.name,
            description: tool.description ?? "",
            input_schema: { ...tool.inputSchema, type: "object" } as Anthropic.Beta.BetaTool.InputSchema,
        }));
    }

    /** Third-party tools are unknown territory: anything not declared read-only needs the user's approval. */
    approval(name: string) {
        return this.readOnly.has(name) ? null : { label: `Run ${this.id} tool “${name}”`, feeHbar: null };
    }

    async callTool(name: string, input: unknown) {
        const client = await this.connect();
        const result = await client.callTool({ name, arguments: (input ?? {}) as Record<string, unknown> });
        const content = Array.isArray(result.content) ? result.content : [];
        const text = content.map((block) => (block.type === "text" ? block.text : JSON.stringify(block))).join("\n");

        if (result.isError) {
            throw new Error(text || "Tool failed");
        }
        return text || JSON.stringify(result.structuredContent ?? {});
    }

    async close() {
        await this.client?.close();
        this.client = null;
    }
}
