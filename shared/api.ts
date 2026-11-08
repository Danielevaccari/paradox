// Types shared by the browser app (src/) and the Netlify Functions (netlify/).
// Keep this file free of runtime dependencies.

export type HederaNetwork = "testnet" | "mainnet" | "previewnet";

export const HEDERA_NETWORKS: readonly HederaNetwork[] = ["testnet", "mainnet", "previewnet"];

export interface ServerConfig {
    /** Network the server signs transactions on. */
    network: HederaNetwork;
    /** Operator account that pays for and signs transactions, or null when not configured. */
    accountId: string | null;
    /** Operator public key (raw hex), used to tell which topics the server can administer. */
    publicKey: string | null;
    features: {
        /** Topic create / submit / update / delete. */
        writes: boolean;
        /** HBAR transfers from the operator account. */
        transfer: boolean;
        /** Claude chatbot. */
        chat: boolean;
    };
}

export interface CreateTopicRequest {
    memo: string;
    /** Use the operator key as admin key, so the topic can be updated and deleted. */
    adminKey: boolean;
    /** Use the operator key as submit key, so only the operator can post messages. */
    submitKey: boolean;
}

export interface CreateTopicResponse {
    topicId: string;
}

export interface SubmitMessageRequest {
    topicId: string;
    message: string;
}

export interface SubmitMessageResponse {
    sequenceNumber: number;
}

export interface RenewTopicRequest {
    topicId: string;
    days: number;
}

export interface TopicIdRequest {
    topicId: string;
}

export interface TransferRequest {
    to: string;
    amountHbar: number;
}

export interface TransferResponse {
    transactionId: string;
}

export interface StatusResponse {
    status: string;
}

export interface ApiError {
    error: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
}

/** A chatbot action that costs HBAR. It only runs after the user accepts it in the UI. */
export interface PendingApproval {
    /** Tool-use id from Claude, used to match the card in the chat. */
    id: string;
    /** Namespaced tool name, e.g. "hedera__create_topic_tool". */
    tool: string;
    /** Human readable summary, e.g. "Create topic “Coffee batch”". */
    label: string;
    /** Typical fee in HBAR, shown in the prompt. Null when unknown (e.g. a third-party tool). */
    feeHbar: number | null;
    /** Raw tool input, sent back unchanged to /api/chat/execute when accepted. */
    input: Record<string, unknown>;
}

export interface ExecuteToolRequest {
    tool: string;
    input: Record<string, unknown>;
}

export interface ExecuteToolResponse {
    /** Plain-text outcome from the Hedera Agent Kit tool. */
    summary: string;
}

/** Streamed as newline-delimited JSON from POST /api/chat. */
export type ChatEvent =
    | { type: "text"; text: string }
    | { type: "tool"; id: string; name: string; status: "start" | "ok" | "error" }
    | { type: "approval"; approval: PendingApproval }
    | { type: "error"; message: string }
    | { type: "done" };

/** Typical fees in HBAR for the paid actions, shown before the user accepts. Measured on testnet. */
export const TYPICAL_FEE_HBAR = {
    createTopic: 0.5,
    submitMessage: 0.02,
    renewTopic: 0.01,
    deleteTopic: 0.1,
    transfer: 0.005,
} as const;

export const LIMITS = {
    memoMaxLength: 100,
    /** Hedera splits messages into 1024-byte chunks; 20 chunks is the network maximum. */
    messageMaxBytes: 20 * 1024,
    transferMaxHbar: 100,
    chatMaxMessages: 30,
    chatMaxMessageLength: 4000,
} as const;
