import type Anthropic from "@anthropic-ai/sdk";
import { AgentMode, HederaAgentAPI, ToolDiscovery, type Configuration, type Tool } from "@hashgraph/hedera-agent-kit";
import {
    coreAccountQueryPlugin,
    coreConsensusPlugin,
    coreConsensusQueryPlugin,
    CREATE_TOPIC_TOOL,
    GET_HBAR_BALANCE_QUERY_TOOL,
    GET_TOPIC_INFO_QUERY_TOOL,
    GET_TOPIC_MESSAGES_QUERY_TOOL,
    SUBMIT_TOPIC_MESSAGE_TOOL,
} from "@hashgraph/hedera-agent-kit/plugins";
import { z } from "zod";
import type { Operator } from "../hedera";
import { isPaidHederaTool, PAID_HEDERA_TOOLS } from "./paidTools";
import type { ToolProvider } from "./toolProvider";

/**
 * Exposes a curated subset of the official Hedera Agent Kit tools: create topics, submit topic
 * messages, read topics and check balances. Destructive tools (delete topic, transfers) are left out.
 */
const ENABLED_TOOLS = [
    CREATE_TOPIC_TOOL,
    SUBMIT_TOPIC_MESSAGE_TOOL,
    GET_TOPIC_MESSAGES_QUERY_TOOL,
    GET_TOPIC_INFO_QUERY_TOOL,
    GET_HBAR_BALANCE_QUERY_TOOL,
];

const toInputSchema = (tool: Tool): Anthropic.Beta.BetaTool.InputSchema => {
    const { $schema: _ignored, ...schema } = z.toJSONSchema(tool.parameters, { io: "input", unrepresentable: "any" }) as Record<
        string,
        unknown
    >;
    return { ...schema, type: "object" } as Anthropic.Beta.BetaTool.InputSchema;
};

export class HederaAgentKitProvider implements ToolProvider {
    readonly id = "hedera";
    private readonly api: HederaAgentAPI;
    private readonly tools: Tool[];

    constructor(operator: Operator) {
        const configuration: Configuration = {
            plugins: [coreConsensusPlugin, coreConsensusQueryPlugin, coreAccountQueryPlugin],
            tools: ENABLED_TOOLS,
            context: { mode: AgentMode.AUTONOMOUS, accountId: operator.accountId.toString() },
        };

        this.tools = ToolDiscovery.createFromConfiguration(configuration).getAllTools(configuration.context ?? {}, configuration);
        this.api = new HederaAgentAPI(operator.client, configuration.context, this.tools);
    }

    async listTools(): Promise<Anthropic.Beta.BetaTool[]> {
        return this.tools.map((tool) => ({
            name: tool.method,
            description: tool.description,
            input_schema: toInputSchema(tool),
            eager_input_streaming: true,
        }));
    }

    approval(name: string, input: Record<string, unknown>) {
        return isPaidHederaTool(name) ? PAID_HEDERA_TOOLS[name].describe(input) : null;
    }

    async callTool(name: string, input: unknown) {
        const tool = this.tools.find((t) => t.method === name);
        if (!tool) {
            throw new Error(`Unknown Hedera tool ${name}`);
        }

        // Eagerly streamed tool input is not validated by the API, so validate it here.
        const parsed = tool.parameters.safeParse(input);
        if (!parsed.success) {
            throw new Error(`Invalid input: ${parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ")}`);
        }

        return this.api.run(name, parsed.data);
    }
}
