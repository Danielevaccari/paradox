import type { Config } from "@netlify/functions";
import type { ServerConfig } from "../../shared/api";
import { getServerEnv } from "../lib/env";
import { errorResponse, json } from "../lib/http";
import { getOperator } from "../lib/hedera";

export default async () => {
    try {
        const env = getServerEnv();
        const operator = getOperator();

        const body: ServerConfig = {
            network: env.network,
            accountId: operator?.accountId.toString() ?? null,
            publicKey: operator?.privateKey.publicKey.toStringRaw() ?? null,
            features: {
                writes: Boolean(operator),
                transfer: Boolean(operator) && env.enableTransfer,
                chat: Boolean(operator) && env.anthropicConfigured,
            },
        };

        return json(body);
    } catch (error) {
        return errorResponse(error);
    }
};

export const config: Config = {
    path: "/api/config",
    method: "GET",
};
