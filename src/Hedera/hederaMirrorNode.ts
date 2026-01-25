import { TopicId } from "@hashgraph/sdk";
import { Notifier } from "../Notifications/notifications";
import { DataStructure, TopicMessage, MirrorNodeTopic, Topic, Transaction } from "./types";
import { LocalStorageHelper } from "../LocalStorage/localStorageHelper";
import { TransactionType } from "./enumerations";

export class HederaMirrorNode {
    // Get base URL based on the selected network
    private static get BASE_URL(): string {
        const network = LocalStorageHelper.getHederaNetwork();

        switch (network) {
            case "mainnet":
                return "https://mainnet-public.mirrornode.hedera.com";
            case "previewnet":
                return "https://previewnet.mirrornode.hedera.com";
            case "local":
                return "http://localhost:5551";
            case "testnet":
            default:
                return "https://testnet.mirrornode.hedera.com";
        }
    }

    // Fetch raw messages from the Mirror Node API for a specific topic
    private static async fetchRawMessagesFromMirrorNode(topicId: TopicId | string, limit: number = 100) {
        const url = `${this.BASE_URL}/api/v1/topics/${topicId.toString()}/messages?limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.statusText}`);
        }

        const data: DataStructure = await response.json();
        return data.messages;
    }

    // Assemble chunked messages into complete ones from base64 encoded parts
    static assembleChunkedMessages(messages: Array<TopicMessage>): TopicMessage[] {
        let temp = "";
        const completed: TopicMessage[] = [];

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
    static async getTopicInfoById(topicId: TopicId | string) {
        const url = `${this.BASE_URL}/api/v1/topics/${topicId.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            Notifier.showError(response);
        }

        const mirrorNodeTopic: MirrorNodeTopic = await response.json();

        return this.transformMirrorNodeTopicToGenericTopic(mirrorNodeTopic);
    }

    // Fetch account transactions from the Mirror Node API
    static async getAccountTransactions(accountId: string, limit = 100, order: "asc" | "desc" = "desc") {
        const url = `${this.BASE_URL}/api/v1/transactions?account.id=${accountId}&limit=${limit}&order=${order}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                Notifier.showError(response);
            }

            return (await response.json()) as { links: { next: string }; transactions: Array<Transaction> };
        } catch (error) {
            Notifier.showError(error);
        }
    }

    // This function fetches the next set of transactions using the provided URL from API response
    static async getNextAccountTransactions(nextURL: string) {
        const url = `${this.BASE_URL}${nextURL}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                Notifier.showError(response);
            }

            return (await response.json()) as { link: { next: string }; transactions: Array<Transaction> };
        } catch (error) {
            Notifier.showError(error);
        }
    }

    // Fetch account transactions from the Mirror Node API recursively
    static async getAccountTransactionsRecursively(
        accountId: string,
        transactionType?: TransactionType,
        limit = 100,
        order: "asc" | "desc" = "desc",
    ) {
        const allTransactions: Transaction[] = [];
        let nextUrl: string | null = `${this.BASE_URL}/api/v1/transactions?account.id=${accountId}&limit=${limit}&order=${order}${
            transactionType ? `&transactiontype=${transactionType}` : ""
        }`;

        while (nextUrl) {
            try {
                const response = await fetch(nextUrl);

                if (!response.ok) {
                    Notifier.showError(response);
                    break;
                }

                const data = (await response.json()) as { links: { next: string | null }; transactions: Array<Transaction> };

                allTransactions.push(...data.transactions);
                nextUrl = data.links.next ? `${this.BASE_URL}${data.links.next}` : null;
            } catch (error) {
                Notifier.showError(error);
                break;
            }
        }

        return allTransactions;
    }

    static transformMirrorNodeTopicToGenericTopic(mirrorNodeTopic: MirrorNodeTopic): Topic {
        return {
            memo: mirrorNodeTopic.memo,
            deleted: mirrorNodeTopic.deleted,
            topicId: mirrorNodeTopic.topic_id,
            adminKey: mirrorNodeTopic.admin_key,
            submitKey: mirrorNodeTopic.submit_key,
            expirationTime: mirrorNodeTopic.timestamp.to, // Assuming 'to' as the expiration
            feeScheduleKey: mirrorNodeTopic.fee_schedule_key,
            autoRenewPeriod: mirrorNodeTopic.auto_renew_period,
            autoRenewAccount: mirrorNodeTopic.auto_renew_account,
            created_timestamp: mirrorNodeTopic.created_timestamp,
            feeExemptKeyList: mirrorNodeTopic.fee_exempt_key_list,
        };
    }
}
