import {
    AutoAwesomeRounded,
    CheckCircleRounded,
    CloseRounded,
    ErrorOutlineRounded,
    RestartAltRounded,
    SendRounded,
    StopRounded,
} from "@mui/icons-material";
import { Alert, Box, Button, Chip, CircularProgress, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { LIMITS, type ChatMessage, type PendingApproval } from "../../../shared/api";
import { serverApi, streamChat } from "../../api/serverApi";
import { useApp } from "../../app/appContext";
import { errorMessage } from "../../utils/format";
import { formatFee } from "../../utils/format";
import { FeeSummary } from "../common/FeeSummary";

type ToolCall = { id: string; name: string; status: "start" | "ok" | "error" };
type ApprovalStatus = "pending" | "running" | "done" | "rejected" | "error";
type ApprovalItem = { approval: PendingApproval; status: ApprovalStatus; result?: string };
type Turn = {
    role: "user" | "assistant";
    content: string;
    tools: ToolCall[];
    approvals: ApprovalItem[];
    error?: string;
    /** Automatic follow-up (the outcome of an approval): sent to Claude but not shown. */
    hidden?: boolean;
};

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const outcomeLine = ({ approval, status, result }: ApprovalItem) =>
    status === "done"
        ? `Approved and executed: ${approval.label}. Result: ${result}`
        : status === "rejected"
          ? `The user rejected: ${approval.label}. It was not executed.`
          : `Approved, but it failed: ${approval.label}. Error: ${result}`;

const ApprovalCard = ({
    item,
    network,
    account,
    onDecide,
}: {
    item: ApprovalItem;
    network: string;
    account: string;
    onDecide: (accept: boolean) => void;
}) => {
    const { approval, status, result } = item;
    const waiting = status === "pending" || status === "running";

    return (
        <Box sx={{ border: 1, borderColor: waiting ? "primary.main" : "divider", borderRadius: 1, p: 1.5, maxWidth: "94%", width: 320 }}>
            <Typography variant="overline" color="text.secondary">
                {waiting ? "Costs HBAR · accept to run" : "Paid action"}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: "break-word" }}>
                {approval.label}
            </Typography>
            <FeeSummary
                facts={[
                    { label: "Network", value: <span style={{ textTransform: "capitalize" }}>{network}</span> },
                    { label: "Paid from", value: account },
                    { label: "Typical fee", value: formatFee(approval.feeHbar) },
                ]}
            />
            {waiting ? (
                <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                    <Button onClick={() => onDecide(false)} disabled={status === "running"}>
                        Reject
                    </Button>
                    <Button variant="contained" onClick={() => onDecide(true)} disabled={status === "running"}>
                        {status === "running" ? "Running…" : "Accept and run"}
                    </Button>
                </Stack>
            ) : (
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                        alignItems: "flex-start",
                        color: status === "done" ? "success.main" : status === "rejected" ? "text.secondary" : "error.main",
                    }}
                >
                    {status === "done" ? <CheckCircleRounded fontSize="small" /> : <ErrorOutlineRounded fontSize="small" />}
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {status === "done" ? "Done" : status === "rejected" ? "Rejected" : "Failed"}
                        {status === "error" && result ? `: ${result}` : ""}
                    </Typography>
                </Stack>
            )}
        </Box>
    );
};

type Props = { onClose: () => void };

export const ChatPanel = ({ onClose }: Props) => {
    const { serverConfig } = useApp();
    const [turns, setTurnsState] = useState<Turn[]>([]);
    const turnsRef = useRef<Turn[]>([]);
    const [input, setInput] = useState("");
    const [abort, setAbort] = useState<AbortController | null>(null);
    const busyRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const busy = abort !== null;
    const network = serverConfig?.network ?? "testnet";
    const account = serverConfig?.accountId ?? "app account";

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [turns]);

    /** All turn changes go through here so decisions can read the latest state synchronously. */
    const setTurns = (update: (previous: Turn[]) => Turn[]) => {
        turnsRef.current = update(turnsRef.current);
        setTurnsState(turnsRef.current);
    };
    const updateTurn = (index: number, update: (turn: Turn) => Turn) =>
        setTurns((prev) => prev.map((turn, i) => (i === index ? update(turn) : turn)));
    const updateLast = (update: (turn: Turn) => Turn) => updateTurn(turnsRef.current.length - 1, update);

    const send = async (text: string, hidden = false) => {
        const content = text.trim();
        if (!content || busyRef.current) {
            return;
        }

        // Only plain text goes back to the server; tool details stay in this UI.
        const history: ChatMessage[] = [...turnsRef.current, { role: "user" as const, content, tools: [], approvals: [] }]
            .filter((turn) => turn.content.trim() && !turn.error)
            .map(({ role, content: c }) => ({ role, content: c.slice(0, LIMITS.chatMaxMessageLength) }))
            .slice(-LIMITS.chatMaxMessages);
        while (history.length > 0 && history[0].role !== "user") {
            history.shift();
        }

        setTurns((prev) => [
            ...prev,
            { role: "user", content, tools: [], approvals: [], hidden },
            { role: "assistant", content: "", tools: [], approvals: [] },
        ]);
        setInput("");

        const controller = new AbortController();
        busyRef.current = true;
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
                } else if (event.type === "approval") {
                    updateLast((turn) => ({ ...turn, approvals: [...turn.approvals, { approval: event.approval, status: "pending" }] }));
                } else if (event.type === "error") {
                    updateLast((turn) => ({ ...turn, error: event.message }));
                }
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                updateLast((turn) => ({ ...turn, error: errorMessage(error) }));
            }
        } finally {
            busyRef.current = false;
            setAbort(null);
            updateLast((turn) => ({ ...turn, content: turn.content.trim() }));
            inputRef.current?.focus();
        }
    };

    /** The user accepted or rejected a paid action. Only an accept runs anything, then Claude hears the outcome. */
    const decide = async (turnIndex: number, approvalId: string, accept: boolean) => {
        const patch = (change: Partial<ApprovalItem>) =>
            updateTurn(turnIndex, (turn) => ({
                ...turn,
                approvals: turn.approvals.map((item) => (item.approval.id === approvalId ? { ...item, ...change } : item)),
            }));

        const item = turnsRef.current[turnIndex]?.approvals.find((a) => a.approval.id === approvalId);
        if (!item || item.status !== "pending") {
            return;
        }

        if (!accept) {
            patch({ status: "rejected" });
        } else {
            patch({ status: "running" });
            try {
                const { summary } = await serverApi.executeTool({ tool: item.approval.tool, input: item.approval.input });
                patch({ status: "done", result: summary });
            } catch (error) {
                patch({ status: "error", result: errorMessage(error) });
            }
        }

        // Once every action of this turn is decided, tell Claude what happened (not shown in the chat).
        const approvals = turnsRef.current[turnIndex]?.approvals ?? [];
        if (approvals.every((a) => a.status !== "pending" && a.status !== "running")) {
            while (busyRef.current) {
                await sleep(200);
            }
            await send(approvals.map(outcomeLine).join("\n"), true);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Stack direction="row" spacing={1} sx={{ px: 2, py: 1.5, alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
                <AutoAwesomeRounded color="primary" />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h3">Paradox assistant</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="p">
                        Claude with Hedera tools · {network}
                    </Typography>
                </Box>
                <Tooltip title="New conversation">
                    <span>
                        <IconButton onClick={() => setTurns(() => [])} disabled={busy || turns.length === 0} aria-label="New conversation">
                            <RestartAltRounded />
                        </IconButton>
                    </span>
                </Tooltip>
                <IconButton onClick={onClose} aria-label="Close assistant">
                    <CloseRounded />
                </IconButton>
            </Stack>

            <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2 }}>
                {turns.length === 0 ? (
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Ask me to create topics, submit messages or read what is on a topic.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Reading is free. Anything that costs HBAR asks you to accept first.
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
                        {turns.map((turn, index) =>
                            turn.hidden ? null : (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.75,
                                        alignItems: turn.role === "user" ? "flex-end" : "flex-start",
                                    }}
                                >
                                    {turn.tools.length > 0 && (
                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
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
                                        (turn.role === "assistant" &&
                                            busy &&
                                            index === turns.length - 1 &&
                                            turn.tools.length === 0 &&
                                            turn.approvals.length === 0)) && (
                                        <Box
                                            sx={{
                                                maxWidth: "92%",
                                                px: 1.5,
                                                py: 1,
                                                borderRadius: 1,
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                                fontSize: 14,
                                                lineHeight: 1.5,
                                                ...(turn.role === "user"
                                                    ? { bgcolor: "primary.main", color: "primary.contrastText" }
                                                    : { bgcolor: "action.hover" }),
                                            }}
                                        >
                                            {turn.content || <CircularProgress size={14} />}
                                        </Box>
                                    )}
                                    {turn.approvals.map((item) => (
                                        <ApprovalCard
                                            key={item.approval.id}
                                            item={item}
                                            network={network}
                                            account={account}
                                            onDecide={(accept) => void decide(index, item.approval.id, accept)}
                                        />
                                    ))}
                                    {turn.error && (
                                        <Alert severity="error" sx={{ py: 0, maxWidth: "92%" }}>
                                            {turn.error}
                                        </Alert>
                                    )}
                                </Box>
                            ),
                        )}
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
