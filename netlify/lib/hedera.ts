import {
    AccountId,
    Client,
    Hbar,
    PrivateKey,
    Timestamp,
    TopicCreateTransaction,
    TopicDeleteTransaction,
    TopicId,
    TopicInfoQuery,
    TopicMessageSubmitTransaction,
    TopicUpdateTransaction,
    TransferTransaction,
} from "@hiero-ledger/sdk";
import type { HederaNetwork } from "../../shared/api";
import { ConfigError, getServerEnv } from "./env";
import { HttpError } from "./http";

export interface Operator {
    client: Client;
    network: HederaNetwork;
    accountId: AccountId;
    privateKey: PrivateKey;
}

const MAX_TRANSACTION_FEE = new Hbar(2);
const MAX_MESSAGE_CHUNKS = 20;

const clientForNetwork = (network: HederaNetwork) => {
    switch (network) {
        case "mainnet":
            return Client.forMainnet();
        case "previewnet":
            return Client.forPreviewnet();
        case "testnet":
            return Client.forTestnet();
    }
};

const parsePrivateKey = (value: string, keyType: "ecdsa" | "ed25519" | "der") => {
    try {
        switch (keyType) {
            case "ed25519":
                return PrivateKey.fromStringED25519(value);
            case "der":
                return PrivateKey.fromStringDer(value);
            case "ecdsa":
                return PrivateKey.fromStringECDSA(value);
        }
    } catch {
        // Never include the key (or parts of it) in the error.
        throw new ConfigError("HEDERA_PRIVATE_KEY could not be parsed. Check HEDERA_KEY_TYPE.");
    }
};

let cached: { cacheKey: string; operator: Operator } | null = null;

/** Returns the signing client, or null when the operator account is not configured. */
export const getOperator = (): Operator | null => {
    const env = getServerEnv();
    if (!env.accountId || !env.privateKey) {
        return null;
    }

    const cacheKey = `${env.network}:${env.accountId}:${env.keyType}`;
    if (cached?.cacheKey === cacheKey) {
        return cached.operator;
    }

    let accountId: AccountId;
    try {
        accountId = AccountId.fromString(env.accountId);
    } catch {
        throw new ConfigError("HEDERA_ACCOUNT_ID is not a valid account id");
    }

    const privateKey = parsePrivateKey(env.privateKey, env.keyType);
    const client = clientForNetwork(env.network).setOperator(accountId, privateKey);
    client.setDefaultMaxTransactionFee(MAX_TRANSACTION_FEE);
    client.setDefaultMaxQueryPayment(new Hbar(1));

    const operator = { client, network: env.network, accountId, privateKey };
    cached = { cacheKey, operator };
    return operator;
};

export const requireOperator = () => {
    const operator = getOperator();
    if (!operator) {
        throw new ConfigError("The Hedera account is not configured on the server.");
    }
    return operator;
};

export const createTopic = async (memo: string, useAdminKey: boolean, useSubmitKey: boolean) => {
    const { client, privateKey } = requireOperator();
    const tx = new TopicCreateTransaction().setTopicMemo(memo);

    if (useAdminKey) {
        tx.setAdminKey(privateKey.publicKey);
    }
    if (useSubmitKey) {
        tx.setSubmitKey(privateKey.publicKey);
    }

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);
    if (!receipt.topicId) {
        throw new Error(`Topic creation returned ${receipt.status.toString()}`);
    }
    return receipt.topicId.toString();
};

export const submitTopicMessage = async (topicId: string, message: string) => {
    const { client } = requireOperator();
    // The operator is the payer, so its signature also satisfies a submit key equal to the operator key.
    const response = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(message)
        .setMaxChunks(MAX_MESSAGE_CHUNKS)
        .execute(client);
    const receipt = await response.getReceipt(client);
    return Number(receipt.topicSequenceNumber?.toString() ?? 0);
};

/** Hedera only accepts expiration times up to ~92 days (8,000,001 s) ahead. */
const MAX_EXPIRATION_DAYS = 92;

/** Renews a topic so it expires `days` from now (not from its current expiration, which Hedera would reject). */
export const renewTopic = async (topicId: string, days: number) => {
    const { client, privateKey } = requireOperator();
    const id = TopicId.fromString(topicId);
    const info = await new TopicInfoQuery().setTopicId(id).execute(client);
    const target = new Date(Date.now() + Math.min(days, MAX_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000);
    const current = info.expirationTime?.toDate();

    if (current && current.getTime() >= target.getTime() - 60 * 60 * 1000) {
        throw new HttpError(409, `Topic already expires on ${current.toISOString().slice(0, 10)}, the furthest Hedera allows.`);
    }

    const tx = await new TopicUpdateTransaction()
        .setTopicId(id)
        .setExpirationTime(Timestamp.fromDate(target))
        .freezeWith(client)
        .sign(privateKey);
    const receipt = await (await tx.execute(client)).getReceipt(client);
    return receipt.status.toString();
};

export const deleteTopic = async (topicId: string) => {
    const { client } = requireOperator();
    const response = await new TopicDeleteTransaction().setTopicId(TopicId.fromString(topicId)).execute(client);
    const receipt = await response.getReceipt(client);
    return receipt.status.toString();
};

export const transferHbar = async (to: string, amountHbar: number) => {
    const { client, accountId } = requireOperator();
    const amount = new Hbar(amountHbar);
    const response = await new TransferTransaction()
        .addHbarTransfer(accountId, amount.negated())
        .addHbarTransfer(AccountId.fromString(to), amount)
        .execute(client);
    await response.getReceipt(client);
    return response.transactionId.toString();
};
