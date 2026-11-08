import type { Context } from "@netlify/functions";
import { PrecheckStatusError, ReceiptStatusError } from "@hiero-ledger/sdk";
import { ConfigError } from "./env";
import { RateLimitError } from "./rateLimit";

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
    }
}

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
    });

/** Rejects requests sent from another site's page (the browser always sets Origin on cross-site POSTs). */
export const assertSameOrigin = (req: Request) => {
    const origin = req.headers.get("origin");
    if (!origin) {
        return;
    }

    const allowed = new Set([new URL(req.url).host]);
    for (const extra of [process.env.URL, process.env.DEPLOY_PRIME_URL]) {
        if (extra) {
            allowed.add(new URL(extra).host);
        }
    }

    let host: string;
    try {
        host = new URL(origin).host;
    } catch {
        throw new HttpError(403, "Invalid origin");
    }

    if (!allowed.has(host)) {
        throw new HttpError(403, "Cross-origin requests are not allowed");
    }
};

export const readJsonBody = async (req: Request, maxBytes: number): Promise<unknown> => {
    const length = Number(req.headers.get("content-length") ?? 0);
    if (length > maxBytes) {
        throw new HttpError(413, "Request body too large");
    }

    const text = await req.text();
    if (new TextEncoder().encode(text).length > maxBytes) {
        throw new HttpError(413, "Request body too large");
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new HttpError(400, "Body must be JSON");
    }
};

export const clientIp = (req: Request, context?: Pick<Context, "ip">) =>
    context?.ip || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

/** Maps known errors to HTTP responses and hides everything else behind a generic message. */
export const errorResponse = (error: unknown) => {
    if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
    }
    if (error instanceof RateLimitError) {
        return json({ error: error.message }, 429, { "retry-after": String(error.retryAfterSeconds) });
    }
    if (error instanceof ConfigError) {
        return json({ error: error.message }, 503);
    }
    if (error instanceof ReceiptStatusError || error instanceof PrecheckStatusError) {
        return json({ error: `Hedera rejected the transaction: ${error.status.toString()}` }, 422);
    }

    console.error(error);
    return json({ error: "Something went wrong. Please try again." }, 500);
};
