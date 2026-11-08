import type { Config, Context } from "@netlify/functions";
import { z } from "zod";
import { LIMITS } from "../../shared/api";
import { getServerEnv } from "../lib/env";
import { assertSameOrigin, clientIp, errorResponse, HttpError, json, readJsonBody } from "../lib/http";
import { createTopic, deleteTopic, renewTopic, submitTopicMessage, transferHbar } from "../lib/hedera";
import { rateLimit } from "../lib/rateLimit";

const entityId = z
    .string()
    .trim()
    .regex(/^\d+\.\d+\.\d+$/, "Use an id like 0.0.12345");

const schemas = {
    "create-topic": z.object({
        memo: z.string().trim().min(1).max(LIMITS.memoMaxLength),
        adminKey: z.boolean(),
        submitKey: z.boolean(),
    }),
    "submit-message": z.object({
        topicId: entityId,
        message: z
            .string()
            .min(1)
            .refine((value) => new TextEncoder().encode(value).length <= LIMITS.messageMaxBytes, "Message is too large"),
    }),
    "renew-topic": z.object({ topicId: entityId, days: z.number().int().min(1).max(92) }),
    "delete-topic": z.object({ topicId: entityId }),
    transfer: z.object({ to: entityId, amountHbar: z.number().positive().max(LIMITS.transferMaxHbar) }),
};

type Action = keyof typeof schemas;

const parse = <A extends Action>(action: A, body: unknown): z.infer<(typeof schemas)[A]> => {
    const result = schemas[action].safeParse(body);
    if (!result.success) {
        throw new HttpError(400, result.error.issues.map((issue) => issue.message).join("; "));
    }
    return result.data as z.infer<(typeof schemas)[A]>;
};

export default async (req: Request, context: Context) => {
    try {
        assertSameOrigin(req);
        rateLimit(`hedera:${clientIp(req, context)}`, 20, 60_000);

        const action = context.params.action as Action;
        if (!(action in schemas)) {
            throw new HttpError(404, "Unknown action");
        }

        const body = await readJsonBody(req, LIMITS.messageMaxBytes * 2);

        switch (action) {
            case "create-topic": {
                const { memo, adminKey, submitKey } = parse(action, body);
                return json({ topicId: await createTopic(memo, adminKey, submitKey) });
            }
            case "submit-message": {
                const { topicId, message } = parse(action, body);
                return json({ sequenceNumber: await submitTopicMessage(topicId, message) });
            }
            case "renew-topic": {
                const { topicId, days } = parse(action, body);
                return json({ status: await renewTopic(topicId, days) });
            }
            case "delete-topic": {
                const { topicId } = parse(action, body);
                return json({ status: await deleteTopic(topicId) });
            }
            case "transfer": {
                if (!getServerEnv().enableTransfer) {
                    throw new HttpError(403, "HBAR transfers are disabled on this server.");
                }
                const { to, amountHbar } = parse(action, body);
                return json({ transactionId: await transferHbar(to, amountHbar) });
            }
        }
    } catch (error) {
        return errorResponse(error);
    }
};

export const config: Config = {
    path: "/api/hedera/:action",
    method: "POST",
};
