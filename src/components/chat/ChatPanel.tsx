import {
    AutoAwesomeRounded,
    CheckCircleRounded,
    CloseRounded,
    ErrorOutlineRounded,
    RestartAltRounded,
    SendRounded,
    StopRounded,
} from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { LIMITS, type ChatMessage } from "../../../shared/api";
import { streamChat } from "../../api/serverApi";
import { useApp } from "../../app/appContext";
import { errorMessage } from "../../utils/format";

type ToolCall = { id: string; name: string; status: "start" | "ok" | "error" };
type Turn = { role: "user" | "assistant"; content: string; tools: ToolCall[]; error?: string };

const SUGGESTIONS = [
    "Create a topic with the memo “Hello from Paradox”",
    "What is the HBAR balance of the app account?",
    "Show the latest messages of topic 0.0.",
];

/** "hedera__create_topic_tool" -> "create topic" */
const toolLabel = (name: string) =>
    name
        .replace(/^[^_]+__/, "")
        .replace(/_(query_)?tool$/, "")
        .replace(/_/g, " ");

type Props = { onClose: () => void };

export const ChatPanel = ({ onClose }: Props) => {
    const { serverConfig } = useApp();
    const [turns, setTurns] = useState<Turn[]>([]);
    const [input, setInput] = useState("");
    const [abort, setAbort] = useState<AbortController | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const busy = abort !== null;

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [turns]);

    const updateLast = (update: (turn: Turn) => Turn) => setTurns((prev) => [...prev.slice(0, -1), update(prev[prev.length - 1])]);

    const send = async (text: string) => {
        const content = text.trim();
        if (!content || busy) {
            return;
        }

        // Only plain text goes back to the server; tool details stay in this UI.
        const history: ChatMessage[] = [...turns, { role: "user" as const, content, tools: [] }]
            .filter((turn) => turn.content.trim() && !turn.error)
            .map(({ role, content: c }) => ({ role, content: c.slice(0, LIMITS.chatMaxMessageLength) }))
            .slice(-LIMITS.chatMaxMessages);
        while (history.length > 0 && history[0].role !== "user") {
            history.shift();
        }

        setTurns((prev) => [...prev, { role: "user", content, tools: [] }, { role: "assistant", content: "", tools: [] }]);
        setInput("");

        const controller = new AbortController();
        setAbort(controller);
        try {
            for await (const event of streamChat(history, controller.signal)) {
                if (event.type === "text") {
                    updateLast((turn) => ({ ...turn, content: turn.content + event.text }));
                } else if (event.type === "tool") {
                    updateLast((turn) => ({
                        ...turn,
                        tools: turn.tools.some((t) => t.id === event.id)
                            ? turn.tools.map((t) => (t.id === event.id ? { ...t, status: event.status } : t))
                            : [...turn.tools, { id: event.id, name: event.name, status: event.status }],
                    }));
                } else if (event.type === "error") {
                    updateLast((turn) => ({ ...turn, error: event.message }));
                }
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                updateLast((turn) => ({ ...turn, error: errorMessage(error) }));
            }
        } finally {
            setAbort(null);
            updateLast((turn) => ({ ...turn, content: turn.content.trim() }));
            inputRef.current?.focus();
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Stack direction="row" spacing={1} sx={{ px: 2, py: 1.5, alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
                <AutoAwesomeRounded color="primary" />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h3">Paradox assistant</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="p">
                        Claude with Hedera tools · {serverConfig?.network}
                    </Typography>
                </Box>
                <Tooltip title="New conversation">
                    <span>
                        <IconButton onClick={() => setTurns([])} disabled={busy || turns.length === 0} aria-label="New conversation">
                            <RestartAltRounded />
                        </IconButton>
                    </span>
                </Tooltip>
                <IconButton onClick={onClose} aria-label="Close assistant">
                    <CloseRounded />
                </IconButton>
            </Stack>

            <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2, bgcolor: "background.default" }}>
                {turns.length === 0 ? (
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Ask me to create topics, submit messages or read what is on a topic. I sign with the app&apos;s{" "}
                            {serverConfig?.network} account.
                        </Typography>
                        <Stack spacing={1}>
                            {SUGGESTIONS.map((suggestion) => (
                                <Chip
                                    key={suggestion}
                                    label={suggestion}
                                    variant="outlined"
                                    onClick={() => {
                                        if (suggestion.endsWith("0.0.")) {
                                            setInput(suggestion);
                                            inputRef.current?.focus();
                                        } else {
                                            void send(suggestion);
                                        }
                                    }}
                                    sx={{
                                        justifyContent: "flex-start",
                                        height: "auto",
                                        py: 0.75,
                                        "& .MuiChip-label": { whiteSpace: "normal" },
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {turns.map((turn, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: turn.role === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                {turn.tools.length > 0 && (
                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5, mb: 0.75 }}>
                                        {turn.tools.map((tool) => (
                                            <Chip
                                                key={tool.id}
                                                size="small"
                                                variant="outlined"
                                                color={tool.status === "error" ? "error" : tool.status === "ok" ? "success" : "default"}
                                                icon={
                                                    tool.status === "start" ? (
                                                        <CircularProgress size={12} />
                                                    ) : tool.status === "ok" ? (
                                                        <CheckCircleRounded />
                                                    ) : (
                                                        <ErrorOutlineRounded />
                                                    )
                                                }
                                                label={toolLabel(tool.name)}
                                            />
                                        ))}
                                    </Stack>
                                )}
                                {(turn.content ||
                                    (turn.role === "assistant" && busy && index === turns.length - 1 && turn.tools.length === 0)) && (
                                    <Box
                                        sx={{
                                            maxWidth: "88%",
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 2.5,
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                            fontSize: 14,
                                            lineHeight: 1.5,
                                            ...(turn.role === "user"
                                                ? { bgcolor: "primary.main", color: "primary.contrastText", borderBottomRightRadius: 6 }
                                                : {
                                                      bgcolor: "background.paper",
                                                      border: 1,
                                                      borderColor: "divider",
                                                      borderBottomLeftRadius: 6,
                                                  }),
                                        }}
                                    >
                                        {turn.content || <CircularProgress size={14} />}
                                    </Box>
                                )}
                                {turn.error && (
                                    <Alert severity="error" sx={{ mt: 0.75, py: 0, maxWidth: "88%" }}>
                                        {turn.error}
                                    </Alert>
                                )}
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            <Box
                component="form"
                onSubmit={(event) => {
                    event.preventDefault();
                    void send(input);
                }}
                sx={{ p: 1.5, borderTop: 1, borderColor: "divider", display: "flex", gap: 1, alignItems: "flex-end" }}
            >
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    maxRows={5}
                    placeholder="Ask about Hedera topics…"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void send(input);
                        }
                    }}
                    slotProps={{ htmlInput: { maxLength: LIMITS.chatMaxMessageLength, "aria-label": "Message" } }}
                />
                {busy ? (
                    <Tooltip title="Stop">
                        <IconButton color="primary" onClick={() => abort?.abort()} aria-label="Stop">
                            <StopRounded />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <IconButton type="submit" color="primary" disabled={!input.trim()} aria-label="Send">
                        <SendRounded />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
};
