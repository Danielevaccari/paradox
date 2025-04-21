type MessageChunkInfo = {
	initial_transaction_id: any; // Adjust the type accordingly
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
	next: null | string; // Adjust the type accordingly
};

type DataStructure = {
	messages: Array<Message>;
	links: Links;
};

export type { MessageChunkInfo, Links, Message, DataStructure };
