export class RateLimitError extends Error {
    constructor(public readonly retryAfterSeconds: number) {
        super("Too many requests. Please wait a moment and try again.");
    }
}

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

/**
 * Fixed-window limiter kept in function memory. Serverless instances are recycled and can run
 * in parallel, so this is a best-effort brake against casual abuse, not a hard quota.
 * Set a spend limit in the Anthropic Console and keep the Hedera account on testnet for that.
 */
export const rateLimit = (key: string, limit: number, windowMs: number) => {
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        if (buckets.size > 5000) {
            for (const [k, w] of buckets) {
                if (w.resetAt <= now) {
                    buckets.delete(k);
                }
            }
        }
        return;
    }

    if (current.count >= limit) {
        throw new RateLimitError(Math.ceil((current.resetAt - now) / 1000));
    }

    current.count += 1;
};
