import { TopicId } from "@hashgraph/sdk";
import { Notifier } from "../Notifications/notifications";
import { DataStructure, Message, Topic } from "./types";

export class HederaMirrorNode {
    // Static variable to hold the base URL for the mirror node
    private static readonly BASE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

    // Fetch raw messages from the Mirror Node API for a specific topic
    private static async fetchRawMessagesFromMirrorNode(topicId: TopicId | string) {
        const url = `${this.BASE_URL}/topics/${topicId.toString()}/messages`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.statusText}`);
        }

        const data: DataStructure = await response.json();
        return data.messages;
    }

    // Assemble chunked messages into complete ones from base64 encoded parts
    static assembleChunkedMessages(messages: Array<Message>): Message[] {
        let temp = "";
        const completed: Message[] = [];

        for (const message of messages) {
            if (message.chunk_info.number === 1) {
                temp = "";
            }

            temp += this.decodeBase64ToString(message.message);

            if (message.chunk_info.number === message.chunk_info.total) {
                completed.push({ ...message, message: btoa(temp) });
            }
        }

        return completed;
    }

    // Fetch and assemble topic messages from the Mirror Node by Topic ID
    static async mirrorNodeGetTopicMessagesByTopicId(topicId: TopicId | string) {
        const raw = await this.fetchRawMessagesFromMirrorNode(topicId);
        return this.assembleChunkedMessages(raw);
    }

    // Decode base64 string to regular string
    static base64ToString(message: string) {
        return Buffer.from(message, "base64").toString("utf-8");
    }

    // Decode base64 string (browser-friendly version)
    static decodeBase64ToString(base64String: string): string {
        return atob(base64String);
    }

    // Fetch topic info by Topic ID
    static async getTopicInfoById(topicId: TopicId | string): Promise<Topic> {
        const url = `${this.BASE_URL}/topics/${topicId.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            Notifier.showError(response);
        }

        const topic: Topic = await response.json();
        return topic;
    }

    // Fetch account transactions from the Mirror Node API
    static async getAccountTransactions(accountId: string, limit = 100, order: "asc" | "desc" = "desc") {
        const url = `${this.BASE_URL}/transactions?account.id=${accountId}&limit=${limit}&order=${order}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                Notifier.showError(response);
            }

            const data = await response.json();
            return data.transactions;
        } catch (error) {
            Notifier.showError(error);
        }
    }
}
