import type {
    ChatEvent,
    ChatMessage,
    CreateTopicRequest,
    CreateTopicResponse,
    ExecuteToolRequest,
    ExecuteToolResponse,
    RenewTopicRequest,
    ServerConfig,
    StatusResponse,
    SubmitMessageRequest,
    SubmitMessageResponse,
    TopicIdRequest,
    TransferRequest,
    TransferResponse,
} from "../../shared/api";

/** Client for the Paradox Netlify Functions. All signing happens there; the browser holds no keys. */

const readError = async (response: Response) => {
    try {
        const body = (await response.json()) as { error?: string };
        if (body.error) {
            return body.error;
        }
    } catch {
        // Not JSON, fall through.
    }
    return `Request failed (${response.status})`;
};

const post = async <TResponse>(path: string, body: unknown): Promise<TResponse> => {
    const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(await readError(response));
    }
    return (await response.json()) as TResponse;
};

export const fetchServerConfig = async (signal?: AbortSignal): Promise<ServerConfig> => {
    const response = await fetch("/api/config", { signal });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(response.ok ? "Backend is not running" : await readError(response));
    }
    return (await response.json()) as ServerConfig;
};

export const serverApi = {
    createTopic: (body: CreateTopicRequest) => post<CreateTopicResponse>("/api/hedera/create-topic", body),
    submitMessage: (body: SubmitMessageRequest) => post<SubmitMessageResponse>("/api/hedera/submit-message", body),
    renewTopic: (body: RenewTopicRequest) => post<StatusResponse>("/api/hedera/renew-topic", body),
    deleteTopic: (body: TopicIdRequest) => post<StatusResponse>("/api/hedera/delete-topic", body),
    transfer: (body: TransferRequest) => post<TransferResponse>("/api/hedera/transfer", body),
    /** Runs a chatbot action after the user accepted it in the chat. */
    executeTool: (body: ExecuteToolRequest) => post<ExecuteToolResponse>("/api/chat/execute", body),
};

/** Streams chat events (NDJSON) from the server-side Claude agent. */
export async function* streamChat(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<ChatEvent> {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages }),
        signal,
    });

    if (!response.ok || !response.body) {
        throw new Error(await readError(response));
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
            if (line.trim()) {
                yield JSON.parse(line) as ChatEvent;
            }
        }
    }
    if (buffer.trim()) {
        yield JSON.parse(buffer) as ChatEvent;
    }
}
