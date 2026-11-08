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

/** Streamed as newline-delimited JSON from POST /api/chat. */
export type ChatEvent =
    | { type: "text"; text: string }
    | { type: "tool"; id: string; name: string; status: "start" | "ok" | "error" }
    | { type: "error"; message: string }
    | { type: "done" };

export const LIMITS = {
    memoMaxLength: 100,
    /** Hedera splits messages into 1024-byte chunks; 20 chunks is the network maximum. */
    messageMaxBytes: 20 * 1024,
    transferMaxHbar: 100,
    chatMaxMessages: 30,
    chatMaxMessageLength: 4000,
} as const;
