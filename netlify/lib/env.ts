import { HEDERA_NETWORKS, type HederaNetwork } from "../../shared/api";

/**
 * Server-only configuration. These variables must never use the VITE_ prefix:
 * Vite inlines every VITE_* variable into the public JavaScript bundle.
 */
export interface ServerEnv {
    network: HederaNetwork;
    accountId?: string;
    privateKey?: string;
    keyType: "ecdsa" | "ed25519" | "der";
    enableTransfer: boolean;
    anthropicConfigured: boolean;
    claudeModel: string;
    mcpServers: McpServerConfig[];
}

export interface McpServerConfig {
    /** Short id used to namespace the server's tools, e.g. "trace". */
    id: string;
    /** Streamable HTTP endpoint of the MCP server. */
    url: string;
    headers?: Record<string, string>;
}

export class ConfigError extends Error {}

const readFlag = (name: string) => process.env[name]?.trim().toLowerCase() === "true";

const parseMcpServers = (raw: string | undefined): McpServerConfig[] => {
    if (!raw?.trim()) {
        return [];
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new ConfigError("MCP_SERVERS must be a JSON array");
    }

    if (!Array.isArray(parsed)) {
        throw new ConfigError("MCP_SERVERS must be a JSON array");
    }

    return parsed.map((entry, index) => {
        const { id, url, headers } = (entry ?? {}) as Partial<McpServerConfig>;
        if (typeof id !== "string" || !/^[a-z0-9-]{1,20}$/i.test(id) || typeof url !== "string") {
            throw new ConfigError(`MCP_SERVERS[${index}] needs an "id" (letters, digits, dashes) and a "url"`);
        }
        return { id, url, headers };
    });
};

export const getServerEnv = (): ServerEnv => {
    const network = (process.env.HEDERA_NETWORK?.trim().toLowerCase() || "testnet") as HederaNetwork;

    if (!HEDERA_NETWORKS.includes(network)) {
        throw new ConfigError(`HEDERA_NETWORK must be one of ${HEDERA_NETWORKS.join(", ")}`);
    }

    if (network === "mainnet" && !readFlag("HEDERA_ALLOW_MAINNET")) {
        throw new ConfigError("Mainnet is disabled. Set HEDERA_ALLOW_MAINNET=true to sign real transactions.");
    }

    const keyType = (process.env.HEDERA_KEY_TYPE?.trim().toLowerCase() || "ecdsa") as ServerEnv["keyType"];
    if (!["ecdsa", "ed25519", "der"].includes(keyType)) {
        throw new ConfigError("HEDERA_KEY_TYPE must be ecdsa, ed25519 or der");
    }

    return {
        network,
        accountId: process.env.HEDERA_ACCOUNT_ID?.trim() || undefined,
        privateKey: process.env.HEDERA_PRIVATE_KEY?.trim() || undefined,
        keyType,
        enableTransfer: readFlag("HEDERA_ENABLE_TRANSFER"),
        anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
        claudeModel: process.env.CLAUDE_MODEL?.trim() || "claude-opus-5-5",
        mcpServers: parseMcpServers(process.env.MCP_SERVERS),
    };
};
