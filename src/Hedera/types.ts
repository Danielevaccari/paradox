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

export type { MessageChunkInfo, Links, Message, DataStructure };
