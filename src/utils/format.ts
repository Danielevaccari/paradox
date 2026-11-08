export const HBAR_SYMBOL = "ℏ";

const ENTITY_ID = /^\d+\.\d+\.\d+$/;

export const isEntityId = (value: string) => ENTITY_ID.test(value.trim());

/** Mirror node timestamps are "seconds.nanoseconds" strings. */
export const consensusToDate = (timestamp: string | null | undefined) =>
    timestamp ? new Date(Number(timestamp.split(".")[0]) * 1000) : null;

const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const dateTimeSecondsFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "medium" });

export const formatTimestamp = (timestamp: string | null | undefined, withSeconds = false) => {
    const date = consensusToDate(timestamp);
    if (!date) {
        return "—";
    }
    return (withSeconds ? dateTimeSecondsFormat : dateTimeFormat).format(date);
};

/** "just now", "5 min ago", "3 h ago", "2 d ago", otherwise the date. */
export const formatRelative = (timestamp: string | null | undefined) => {
    const date = consensusToDate(timestamp);
    if (!date) {
        return "—";
    }
    const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
    if (seconds < 45) {
        return "just now";
    }
    if (seconds < 3600) {
        return `${Math.round(seconds / 60)} min ago`;
    }
    if (seconds < 86400) {
        return `${Math.round(seconds / 3600)} h ago`;
    }
    if (seconds < 86400 * 30) {
        return `${Math.round(seconds / 86400)} d ago`;
    }
    return dateFormat.format(date);
};

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export const formatDate = (timestamp: string | null | undefined) => {
    const date = consensusToDate(timestamp);
    return date ? dateFormat.format(date) : "—";
};

export const formatHbar = (tinybars: number | null | undefined, fractionDigits = 4) => {
    if (tinybars === null || tinybars === undefined) {
        return "—";
    }
    const hbar = tinybars / 1e8;
    return `${hbar.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: fractionDigits })} ${HBAR_SYMBOL}`;
};

export const byteLength = (text: string) => new TextEncoder().encode(text).length;

const base64ToBytes = (base64: string) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

/** Decodes base64 parts as one UTF-8 string (chunked messages may split a multi-byte character). */
export const decodeBase64Utf8 = (...parts: string[]) => {
    const chunks = parts.map(base64ToBytes);
    const merged = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
    }
    return new TextDecoder().decode(merged);
};

/** Pretty-prints JSON, or returns the text unchanged when it is not JSON. */
export const prettyJson = (text: string) => {
    try {
        return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
        return text;
    }
};

export const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unexpected error";

/** "≈ 0.5 ℏ" or "unknown" when there is no estimate. */
export const formatFee = (feeHbar: number | null) => (feeHbar === null ? "unknown" : `≈ ${feeHbar} ${HBAR_SYMBOL}`);
