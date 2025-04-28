type MessageChunkInfo = {
    initial_transaction_id: unknown;
    number: number;
    total: number;
};

type Message = {
    chunk_info: MessageChunkInfo;
    consensus_timestamp: string;
    message: string;
    payer_account_id: string;
    running_hash: string;
    running_hash_version: number;
    sequence_number: number;
    topic_id: string;
};

type Links = {
    next: null | string;
};

type DataStructure = {
    messages: Array<Message>;
    links: Links;
};

type Transaction = {
    batch_key: null;
    bytes: null;
    charged_tx_fee: number;
    consensus_timestamp: string;
    entity_id: string | null;
    max_custom_fees: Array<unknown>;
    max_fee: string;
    memo_base64: string;
    name: string;
    nft_transfers: Array<unknown>;
    node: string;
    nonce: number;
    parent_consensus_timestamp: string | null;
    result: string;
    scheduled: boolean;
    staking_reward_transfers: Array<unknown>;
    token_transfers: Array<unknown>;
    transaction_hash: string;
    transaction_id: string;
    transfers: {
        account: string;
        amount: number;
        is_approval: boolean;
    }[];
    valid_duration_seconds: string;
    valid_start_timestamp: string;
};

type Topic = {
    admin_key: {
        _type: "ProtobufEncoded";
        key: string;
    };
    auto_renew_account: string;
    auto_renew_period: number;
    created_timestamp: string;
    custom_fees: {
        created_timestamp: string;
        fixed_fees: {
            amount: number;
            collector_account_id: string;
            denominating_token_id: string;
        }[];
    };
    deleted: boolean;
    fee_exempt_key_list: Array<{
        _type: "ProtobufEncoded";
        key: string;
    }>;
    fee_schedule_key: {
        _type: "ProtobufEncoded";
        key: string;
    };
    memo: string;
    submit_key: {
        _type: "ProtobufEncoded";
        key: string;
    };
    timestamp: {
        from: string;
        to: string;
    };
    topic_id: string;
};

export type { MessageChunkInfo, Links, Message, DataStructure, Transaction, Topic };
