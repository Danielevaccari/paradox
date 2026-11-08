import { CREATE_TOPIC_TOOL, SUBMIT_TOPIC_MESSAGE_TOOL } from "@hashgraph/hedera-agent-kit/plugins";
import { TYPICAL_FEE_HBAR } from "../../../shared/api";

/**
 * Tools that cost HBAR. The chatbot never runs these by itself: the loop hands them to the user as
 * an approval card, and they only execute through /api/chat/execute after the user accepts.
 * Everything else the chatbot does is a free mirror node read.
 */

const text = (value: unknown, fallback: string) => (typeof value === "string" && value.trim() ? value.trim() : fallback);

interface PaidTool {
    describe: (input: Record<string, unknown>) => { label: string; feeHbar: number };
}

export const PAID_HEDERA_TOOLS: Record<string, PaidTool> = {
    [CREATE_TOPIC_TOOL]: {
        describe: (input) => ({
            label: `Create topic “${text(input.topicMemo, "Unnamed topic")}”`,
            feeHbar: TYPICAL_FEE_HBAR.createTopic,
        }),
    },
    [SUBMIT_TOPIC_MESSAGE_TOOL]: {
        describe: (input) => ({
            label: `Submit a message to topic ${text(input.topicId, "?")}`,
            feeHbar: TYPICAL_FEE_HBAR.submitMessage,
        }),
    },
};

export const isPaidHederaTool = (name: string) => name in PAID_HEDERA_TOOLS;

export const asInputObject = (input: unknown) => (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
