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
    TopicDeleteTransaction,
    TopicUpdateTransaction,
    TopicInfo,
} from "@hashgraph/sdk";
import { TopicMessage, Topic, HederaNetwork, NetworkConfig } from "./types";
import { LocalStorageHelper } from "../LocalStorage/localStorageHelper";

const NETWORK_CONFIGS: Record<HederaNetwork, () => NetworkConfig> = {
    mainnet: () => ({
        network: Client.forMainnet(),
        accountId: import.meta.env.VITE_MAINNET_MY_ACCOUNT_ID,
        privateKey: import.meta.env.VITE_MAINNET_MY_PRIVATE_KEY,
    }),
    testnet: () => ({
        network: Client.forTestnet(),
        accountId: import.meta.env.VITE_TESTNET_MY_ACCOUNT_ID,
        privateKey: import.meta.env.VITE_TESTNET_MY_PRIVATE_KEY,
    }),
    previewnet: () => ({
        network: Client.forPreviewnet(),
        accountId: import.meta.env.VITE_PREVIEWNET_MY_ACCOUNT_ID,
        privateKey: import.meta.env.VITE_PREVIEWNET_MY_PRIVATE_KEY,
    }),
    local: () => ({
        network: Client.forNetwork({ "127.0.0.1:50211": new AccountId(3) }),
        accountId: import.meta.env.VITE_LOCAL_MY_ACCOUNT_ID,
        privateKey: import.meta.env.VITE_LOCAL_MY_PRIVATE_KEY,
    }),
};

export class Hedera {
    private static accountId?: string;
    private static privateKey?: PrivateKey;

    private static currentNetwork: HederaNetwork = LocalStorageHelper.getHederaNetwork() || "testnet";
    private static client: Client | null = Hedera.initializeClient();

    private static maxTopicMessageTxFee = 0.001; // HBAR
    private static maxTopicMessageChunks = 10;

    private static initializeClient(): Client | null {
        try {
            const config = NETWORK_CONFIGS[this.currentNetwork]?.();
            if (!config?.accountId || !config?.privateKey) {
                console.error("Missing Hedera credentials in config.");
                return null;
            }

            this.accountId = config.accountId;

            let privateKey;
            try {
                privateKey = PrivateKey.fromStringECDSA(config.privateKey);
            } catch (err) {
                console.error("Invalid private key format.", err);
                return null;
            }

            this.privateKey = privateKey;
            const client = config.network.setOperator(this.accountId, this.privateKey);
            client.setDefaultMaxTransactionFee(new Hbar(1));
            client.setDefaultMaxQueryPayment(new Hbar(1));

            return client;
        } catch (error) {
            console.error("Failed to initialize Hedera client.", error);
            return null;
        }
    }

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

    static getNetwork(): HederaNetwork {
        return this.currentNetwork;
    }

    private static updateClient() {
        if (!this.accountId || !this.privateKey) {
            throw new Error("AccountId and PrivateKey must be set before updating the client.");
        }

        const client = Client.forTestnet().setOperator(this.accountId, this.privateKey);
        client.setDefaultMaxTransactionFee(new Hbar(1));
        client.setDefaultMaxQueryPayment(new Hbar(1));
        this.client = client;
    }

    static getNetworkName(): "mainnet" | "testnet" | "local" | "unknown" {
        const network = this.client?.network;

        if (typeof network === "object") {
            const urls = Object.keys(network);
            if (urls.some((url) => url.includes("testnet"))) {
                return "testnet";
            }
            if (urls.some((url) => url.includes("mainnet"))) {
                return "mainnet";
            }
            if (urls.some((url) => url.includes("localhost"))) {
                return "local";
            }
        }

        return "unknown";
    }

    static ensureClient() {
        if (!this.client) {
            throw new Error("Hedera client is not initialized.");
        }
        return this.client;
    }

    static async sendTransaction(toAccountId: AccountId | string, amount: Hbar | number) {
        if (!this.accountId) {
            throw new Error("accountId is not set");
        }

        const client = this.ensureClient();
        const tx = new TransferTransaction().addHbarTransfer(this.accountId, -amount).addHbarTransfer(toAccountId, amount);
        const signedTx = await tx.execute(client);
        return signedTx.transactionId;
    }

    static async createTopic(topicMemo?: string) {
        const client = this.ensureClient();
        const topic = await new TopicCreateTransaction({ topicMemo }).execute(client);
        const receipt = await topic.getReceipt(client);
        return receipt.topicId ?? undefined;
    }

    static async createAdminTopic(topicMemo?: string) {
        if (!this.privateKey) {
            throw new Error("privateKey is not set");
        }

        const client = this.ensureClient();
        const topic = await new TopicCreateTransaction({
            topicMemo,
            adminKey: this.privateKey.publicKey,
        }).execute(client);
        const receipt = await topic.getReceipt(client);
        return receipt.topicId ?? undefined;
    }

    static async createPrivateTopic(topicMemo?: string) {
        if (!this.privateKey) {
            throw new Error("privateKey is not set");
        }

        const client = this.ensureClient();
        const topic = await new TopicCreateTransaction({
            topicMemo,
            submitKey: this.privateKey.publicKey,
        }).execute(client);
        const receipt = await topic.getReceipt(client);
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
        newExpirationTime?: Date | number | string;
    }) {
        if (!this.privateKey) {
            throw new Error("privateKey is not set");
        }

        const client = this.ensureClient();
        let tx = new TopicUpdateTransaction().setTopicId(topicId);

        if (newMemo) {
            tx = tx.setTopicMemo(newMemo);
        }
        if (newAutoRenewAccountId) {
            tx = tx.setAutoRenewAccountId(AccountId.fromString(newAutoRenewAccountId.toString()));
        }
        if (newExpirationTime) {
            tx = tx.setExpirationTime(Timestamp.fromDate(newExpirationTime));
        }

        const signedTx = await tx.freezeWith(client).sign(this.privateKey);
        const response = await signedTx.execute(client);
        const receipt = await response.getReceipt(client);
        return receipt.status.toString();
    }

    static async deleteTopicById(topicId: TopicId | string) {
        const client = this.ensureClient();
        const currentTopicId = typeof topicId === "string" ? TopicId.fromString(topicId) : topicId;
        const response = await new TopicDeleteTransaction({ topicId: currentTopicId }).execute(client);
        return await response.getReceipt(client);
    }

    static async createTopicMessage(topicId: TopicId | string, message: string) {
        const client = this.ensureClient();
        const currentTopicId = typeof topicId === "string" ? TopicId.fromString(topicId) : topicId;

        const tx = new TopicMessageSubmitTransaction({ topicId: currentTopicId, message })
            .setMaxTransactionFee(this.maxTopicMessageTxFee)
            .setMaxChunks(this.maxTopicMessageChunks);

        const response = await tx.execute(client);
        return await response.getReceipt(client);
    }

    static async createPrivateSubmitTopic(topicMemo?: string) {
        if (!this.privateKey) {
            throw new Error("privateKey is not set");
        }

        const client = this.ensureClient();
        const topic = await new TopicCreateTransaction({
            topicMemo,
            submitKey: this.privateKey.publicKey,
        }).execute(client);

        const receipt = await topic.getReceipt(client);
        return receipt.topicId ?? undefined;
    }

    static async createPrivateTopicMessage(topicId: TopicId, message: string, privateKey: PrivateKey) {
        const client = this.ensureClient();
        const tx = new TopicMessageSubmitTransaction({ topicId, message });
        const signedTx = await tx.freeze().sign(privateKey);
        const response = await signedTx.execute(client);
        return await response.getReceipt(client);
    }

    static async subscribeTopic(topicId: TopicId) {
        const client = this.ensureClient();
        return new TopicMessageQuery()
            .setTopicId(topicId)
            .setStartTime(0)
            .subscribe(client, null, (m) => console.log(m));
    }

    static async queryAccountBalance() {
        if (!this.accountId) {
            throw new Error("accountId is not set");
        }

        const client = this.ensureClient();
        const balance = await new AccountBalanceQuery().setAccountId(this.accountId).getCost(client);
        return balance.toTinybars();
    }

    static async getTopicInfo(topicId: TopicId) {
        return await new TopicInfoQuery().setTopicId(topicId).execute(this.ensureClient());
    }

    static async getAccountInfo(accountId: AccountId) {
        return await new AccountInfoQuery().setAccountId(accountId).execute(this.ensureClient());
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

    static tinybarToHbar(tinybar: number) {
        return (tinybar / 1e8).toFixed(6);
    }

    static transformHederaTopicInfoToGenericTopic(hederaTopic: TopicInfo): Topic {
        return {
            deleted: false,
            memo: hederaTopic.topicMemo,
            topicId: hederaTopic.topicId.toString(),
            adminKey: { _type: "ProtobufEncoded", key: "" },
            sequenceNumber: hederaTopic.sequenceNumber?.toString(),
            expirationTime: hederaTopic.expirationTime?.toString() ?? "",
            autoRenewAccount: hederaTopic.autoRenewAccountId?.toString(),
            autoRenewPeriod: Number(hederaTopic.autoRenewPeriod?.toString()),
            submitKey: {
                _type: "ProtobufEncoded",
                key: hederaTopic.submitKey?._toProtobufKey().RSA_3072?.toString() ?? "",
            },
        };
    }

    static getMaxTopicMessageTxFee(): number {
        return this.maxTopicMessageTxFee;
    }

    static setMaxTopicMessageTxFee(fee: number) {
        this.maxTopicMessageTxFee = fee;
    }

    static getMaxTopicMessageChunks(): number {
        return this.maxTopicMessageChunks;
    }

    static setMaxTopicMessageChunks(chunks: number) {
        this.maxTopicMessageChunks = chunks;
    }
}
