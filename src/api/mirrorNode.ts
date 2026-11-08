import type { HederaNetwork } from "../../shared/api";
import { decodeBase64Utf8 } from "../utils/format";

/** Read-only access to the public Hedera mirror node REST API. Needs no keys. */

const BASE_URLS: Record<HederaNetwork, string> = {
    mainnet: "https://mainnet-public.mirrornode.hedera.com",
    testnet: "https://testnet.mirrornode.hedera.com",
    previewnet: "https://previewnet.mirrornode.hedera.com",
};

export interface ProtobufKey {
    _type: string;
    key: string;
}

export interface Topic {
    topic_id: string;
    memo: string;
    deleted: boolean;
    admin_key: ProtobufKey | null;
    submit_key: ProtobufKey | null;
    auto_renew_account: string | null;
    auto_renew_period: number | null;
    created_timestamp: string;
}

export interface RawTopicMessage {
    chunk_info: { number: number; total: number; initial_transaction_id?: unknown } | null;
    consensus_timestamp: string;
    message: string;
    payer_account_id: string;
    sequence_number: number;
    topic_id: string;
}

export interface TopicMessage {
    sequenceNumber: number;
    consensusTimestamp: string;
    payerAccountId: string;
    text: string;
    chunks: number;
}

export interface Transfer {
    account: string;
    amount: number;
    is_approval: boolean;
}

export interface Transaction {
    transaction_id: string;
    consensus_timestamp: string;
    charged_tx_fee: number;
    entity_id: string | null;
    memo_base64: string;
    name: string;
    node: string | null;
    result: string;
    transfers: Transfer[];
}

export interface Account {
    account: string;
    balance: { balance: number; timestamp: string } | null;
    memo: string;
    staked_node_id: number | null;
    staked_account_id: string | null;
    pending_reward: number;
    expiry_timestamp: string | null;
    created_timestamp: string | null;
    evm_address: string | null;
    deleted: boolean;
}

export class MirrorNodeError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
    }
}

const get = async <T>(network: HederaNetwork, pathAndQuery: string, signal?: AbortSignal): Promise<T> => {
    const response = await fetch(`${BASE_URLS[network]}${pathAndQuery}`, { signal });
    if (!response.ok) {
        const message = response.status === 404 ? "Not found on the mirror node" : `Mirror node request failed (${response.status})`;
        throw new MirrorNodeError(response.status, message);
    }
    return (await response.json()) as T;
};

export const getTopic = (network: HederaNetwork, topicId: string, signal?: AbortSignal) =>
    get<Topic>(network, `/api/v1/topics/${topicId}`, signal);

/** Joins chunked messages (in consensus order) into complete messages. */
export const assembleMessages = (ascending: RawTopicMessage[]): TopicMessage[] => {
    const messages: TopicMessage[] = [];
    let pending: RawTopicMessage[] = [];

    for (const raw of ascending) {
        const total = raw.chunk_info?.total ?? 1;
        const number = raw.chunk_info?.number ?? 1;

        if (number === 1) {
            pending = [];
        }
        pending.push(raw);

        if (number === total) {
            const first = pending[0];
            messages.push({
                sequenceNumber: first.sequence_number,
                consensusTimestamp: raw.consensus_timestamp,
                payerAccountId: first.payer_account_id,
                text: decodeBase64Utf8(...pending.map((part) => part.message)),
                chunks: pending.length,
            });
            pending = [];
        }
    }
    return messages;
};

/** Latest messages of a topic, newest first. */
export const getTopicMessages = async (network: HederaNetwork, topicId: string, limit = 100, signal?: AbortSignal) => {
    const data = await get<{ messages: RawTopicMessage[] }>(
        network,
        `/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`,
        signal,
    );
    return assembleMessages([...data.messages].reverse()).reverse();
};

export const getAccount = (network: HederaNetwork, accountId: string, signal?: AbortSignal) =>
    get<Account>(network, `/api/v1/accounts/${accountId}?transactions=false`, signal);

export interface TransactionPage {
    transactions: Transaction[];
    next: string | null;
}

/** One page of an account's transactions, newest first. Pass `next` from the previous page to continue. */
export const getTransactions = async (
    network: HederaNetwork,
    { accountId, type, next }: { accountId: string; type?: string; next?: string | null },
    signal?: AbortSignal,
): Promise<TransactionPage> => {
    const query = next ?? `/api/v1/transactions?account.id=${accountId}&limit=100&order=desc${type ? `&transactiontype=${type}` : ""}`;
    const data = await get<{ transactions: Transaction[]; links: { next: string | null } }>(network, query, signal);
    return { transactions: data.transactions, next: data.links.next };
};

/**
 * True once the mirror node has indexed the creation of `topicId` by `payerAccountId`. Uses a list
 * endpoint (always 200) instead of /topics/{id}, which 404s until indexed and fills the console with errors.
 */
export const isTopicIndexed = async (network: HederaNetwork, topicId: string, payerAccountId: string) => {
    const { transactions } = await getTransactions(network, { accountId: payerAccountId, type: "CONSENSUSCREATETOPIC" });
    return transactions.some((tx) => tx.entity_id === topicId);
};

/** Polls until `check` returns a value, e.g. to wait for a new topic or message to reach the mirror node. */
export const waitFor = async <T>(check: () => Promise<T | null | undefined>, { attempts = 10, intervalMs = 1500 } = {}) => {
    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            const result = await check();
            if (result) {
                return result;
            }
        } catch (error) {
            if (!(error instanceof MirrorNodeError && error.status === 404)) {
                throw error;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return null;
};
