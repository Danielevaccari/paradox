import {
    Client,
    TransferTransaction,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    Hbar,
    AccountId,
    AccountBalanceQuery,
    TopicMessageQuery,
    TopicId,
    TopicInfoQuery,
    AccountInfoQuery,
    Timestamp,
    PrivateKey,
    Mnemonic,
    TopicDeleteTransaction,
    TopicUpdateTransaction,
} from "@hashgraph/sdk";
import { DataStructure, Message } from "./types";
import { Notifier } from "../Notifications/notifications";

export class Hedera {
    private static accountId = import.meta.env.VITE_MY_ACCOUNT_ID ?? "";
    private static privateKey = PrivateKey.fromStringECDSA(import.meta.env.VITE_MY_PRIVATE_KEY ?? "");

    private static client: Client = (() => {
        if (!this.accountId || !this.privateKey) {
            throw new Error("MY_ACCOUNT_ID and MY_PRIVATE_KEY env vars must be set");
        }

        const client = Client.forTestnet().setOperator(this.accountId, this.privateKey);

        client.setDefaultMaxTransactionFee(new Hbar(1));
        client.setDefaultMaxQueryPayment(new Hbar(1));

        return client;
    })();

    static setAccountId(newAccountId: string) {
        this.accountId = newAccountId;
        this.updateClient();
    }

    static setPrivateKey(newPrivateKey: string) {
        this.privateKey = PrivateKey.fromStringECDSA(newPrivateKey);
        this.updateClient();
    }

    static getAccountId() {
        return this.accountId;
    }

    static getPrivateKey() {
        return this.privateKey;
    }

    private static updateClient() {
        if (!this.accountId || !this.privateKey) {
            throw new Error("AccountId and PrivateKey must be set before updating the client.");
        }

        this.client = Client.forTestnet().setOperator(this.accountId, this.privateKey);

        this.client.setDefaultMaxTransactionFee(new Hbar(1));
        this.client.setDefaultMaxQueryPayment(new Hbar(1));
    }

    static getNetworkName(): "mainnet" | "testnet" | "local" | "unknown" {
        const network = this.client.network;

        if (typeof network === "object") {
            const urls = Object.keys(network);

            if (urls.some((url) => typeof url === "string" && url.includes("testnet"))) {
                return "testnet";
            }

            if (urls.some((url) => typeof url === "string" && url.includes("mainnet"))) {
                return "mainnet";
            }

            if (urls.some((url) => typeof url === "string" && url.includes("localhost"))) {
                return "local";
            }
        }

        return "unknown";
    }

    static async sendTransaction(toAccountId: AccountId | string, amount: Hbar | number) {
        const tx = new TransferTransaction().addHbarTransfer(this.accountId, -amount).addHbarTransfer(toAccountId, amount);

        const signedTx = await tx.execute(this.client);
        return signedTx.transactionId;
    }

    static async createTopic(topicMemo?: string) {
        const topic = await new TopicCreateTransaction({ topicMemo }).execute(this.client);
        const receipt = await topic.getReceipt(this.client);
        return receipt.topicId ?? undefined;
    }

    static async createAdminTopic(topicMemo?: string) {
        const topic = await new TopicCreateTransaction({ topicMemo, adminKey: this.privateKey.publicKey }).execute(this.client);
        const receipt = await topic.getReceipt(this.client);
        return receipt.topicId ?? undefined;
    }

    static async createPrivateTopic(topicMemo?: string) {
        const topic = await new TopicCreateTransaction({ topicMemo, submitKey: this.privateKey.publicKey }).execute(this.client);
        const receipt = await topic.getReceipt(this.client);
        return receipt.topicId ?? undefined;
    }

    static async updateTopic({
        topicId,
        newMemo,
        newAutoRenewAccountId,
        newExpirationTime,
    }: {
        topicId: TopicId;
        newMemo?: string;
        newAutoRenewAccountId?: AccountId | string;
        newExpirationTime?: Date | number | string; // Can be a Date object, timestamp, or ISO string
    }) {
        let tx = new TopicUpdateTransaction().setTopicId(topicId);

        if (newMemo) {
            tx = tx.setTopicMemo(newMemo);
        }
        if (newAutoRenewAccountId) {
            tx = tx.setAutoRenewAccountId(AccountId.fromString(newAutoRenewAccountId.toString()));
        }
        if (newExpirationTime) {
            const timestamp = Timestamp.fromDate(newExpirationTime);
            tx = tx.setExpirationTime(timestamp);
        }

        const frozenTx = tx.freezeWith(this.client);

        const signedTx = await frozenTx.sign(this.privateKey);
        const response = await signedTx.execute(this.client);
        const receipt = await response.getReceipt(this.client);

        return receipt.status.toString();
    }

    static async deleteTopicById(topicId: TopicId) {
        const response = await new TopicDeleteTransaction({ topicId }).execute(this.client);
        return await response.getReceipt(this.client);
    }

    static async createTopicMessage(topicId: TopicId, message: string) {
        const tx = new TopicMessageSubmitTransaction({ topicId, message });
        const response = await tx.execute(this.client);
        return await response.getReceipt(this.client);
    }

    static async createPrivateSubmitTopic(topicMemo?: string) {
        const topic = await new TopicCreateTransaction({
            topicMemo,
            submitKey: this.privateKey.publicKey,
        }).execute(this.client);

        const receipt = await topic.getReceipt(this.client);
        return receipt.topicId ?? undefined;
    }

    static async createPrivateTopicMessage(topicId: TopicId, message: string, privateKey: PrivateKey) {
        const tx = new TopicMessageSubmitTransaction({ topicId, message });
        const signedTx = await tx.freeze().sign(privateKey);
        const response = await signedTx.execute(this.client);
        return await response.getReceipt(this.client);
    }

    static async subscribeTopic(topicId: TopicId) {
        return new TopicMessageQuery()
            .setTopicId(topicId)
            .setStartTime(0)
            .subscribe(this.client, null, (m) => console.log(m));
    }

    static async queryAccountBalance() {
        const balance = await new AccountBalanceQuery().setAccountId(this.accountId).getCost(this.client);
        return balance.toTinybars();
    }

    static async getTopicInfo(topicId: TopicId) {
        return await new TopicInfoQuery().setTopicId(topicId).execute(this.client);
    }

    static async getAccountInfo(accountId: AccountId) {
        return await new AccountInfoQuery().setAccountId(accountId).execute(this.client);
    }

    static async getAccountTransactions(accountId: AccountId | string, limit = 100, order: "asc" | "desc" = "desc") {
        const id = typeof accountId === "string" ? accountId : accountId.toString();
        const url = `https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id=${id}&limit=${limit}&order=${order}`;

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

    static createConsensusTimeStamp(date: string | number | Date) {
        return Timestamp.fromDate(date);
    }

    static base64ToString(message: string) {
        return Buffer.from(message, "base64").toString("utf-8");
    }

    static decodeBase64ToString(base64String: string): string {
        return atob(base64String);
    }

    static async derivePrivateKeyFromMnemonic(mnemonicWords: string) {
        try {
            // Create a Mnemonic object from the 24-word phrase
            const mnemonic = await Mnemonic.fromString(mnemonicWords);

            // Derive the private key using Hedera's default derivation path
            const privateKey = await mnemonic.toStandardEd25519PrivateKey();

            // Output the private key in DER format (compatible with Hedera API)
            const privateKeyDer = privateKey.toStringDer();
            const privateKeyRaw = privateKey.toStringRaw();
            const publicKey = privateKey.publicKey.toStringDer();

            console.log("Private Key (DER):", privateKeyDer);
            console.log("Private Key (Raw):", privateKeyRaw);
            console.log("Public Key (DER):", publicKey);

            return privateKey;
        } catch (error) {
            console.error("Error deriving private key:", error);
            throw error;
        }
    }

    private static async fetchRawMessagesFromMirrorNode(topicId: TopicId | string) {
        const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId.toString()}/messages`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.statusText}`);
        }

        const data: DataStructure = await response.json();
        return data.messages;
    }

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

    static async mirrorNodeGetTopicMessagesByTopicId(topicId: TopicId | string) {
        const raw = await this.fetchRawMessagesFromMirrorNode(topicId);
        return this.assembleChunkedMessages(raw);
    }

    static tinybarToHbar(tinybar: number) {
        return (tinybar / 1e8).toFixed(6); // 1 HBAR = 10^8 tinybars
    }
}
