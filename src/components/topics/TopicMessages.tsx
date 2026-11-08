import { ContentCopyRounded, RefreshRounded, SearchRounded } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    IconButton,
    InputAdornment,
    LinearProgress,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import type { TopicMessage } from "../../api/mirrorNode";
import { formatRelative, formatTimestamp, prettyJson } from "../../utils/format";
import { notify } from "../../utils/notify";

const COLLAPSED_HEIGHT = 200;
const LONG_MESSAGE = 500;

const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(
        () => notify.info("Copied"),
        () => notify.warning("Could not copy"),
    );
};

const MessageItem = ({ message, pretty }: { message: TopicMessage; pretty: boolean }) => {
    const [expanded, setExpanded] = useState(false);
    const text = pretty ? prettyJson(message.text) : message.text;
    const long = text.length > LONG_MESSAGE || text.split("\n").length > 10;

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75, color: "text.secondary" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    #{message.sequenceNumber}
                </Typography>
                <Tooltip title={formatTimestamp(message.consensusTimestamp, true)}>
                    <Typography variant="caption">{formatRelative(message.consensusTimestamp)}</Typography>
                </Tooltip>
                {message.chunks > 1 && <Typography variant="caption">· {message.chunks} chunks</Typography>}
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Sent by">
                    <Typography variant="caption">{message.payerAccountId}</Typography>
                </Tooltip>
                <Tooltip title="Copy message">
                    <IconButton onClick={() => copy(message.text)} aria-label="Copy message">
                        <ContentCopyRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Box
                component="pre"
                sx={{
                    m: 0,
                    fontSize: 13,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: expanded ? "none" : COLLAPSED_HEIGHT,
                    overflow: "hidden",
                }}
            >
                {text}
            </Box>
            {long && (
                <Button size="small" onClick={() => setExpanded(!expanded)} sx={{ mt: 0.5, ml: -1 }}>
                    {expanded ? "Show less" : "Show all"}
                </Button>
            )}
        </Box>
    );
};

type Props = {
    messages: TopicMessage[] | undefined;
    loading: boolean;
    error: string | undefined;
    waiting: boolean;
    onReload: () => void;
};

/** Message list with search and Pretty/Raw, newest first. The list scrolls; the toolbar stays put. */
export const TopicMessages = ({ messages, loading, error, waiting, onReload }: Props) => {
    const [search, setSearch] = useState("");
    const [pretty, setPretty] = useState(true);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        return term
            ? (messages ?? []).filter((m) => m.text.toLowerCase().includes(term) || String(m.sequenceNumber) === term)
            : (messages ?? []);
    }, [messages, search]);

    return (
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Stack
                direction="row"
                spacing={1}
                sx={{ px: { xs: 1.5, sm: 2 }, py: 1, alignItems: "center", borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
            >
                <TextField
                    placeholder="Search messages"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{ flex: 1, minWidth: 0, maxWidth: { sm: 320 } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded fontSize="small" />
                                </InputAdornment>
                            ),
                        },
                        htmlInput: { "aria-label": "Search messages" },
                    }}
                />
                <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={pretty ? "pretty" : "raw"}
                    onChange={(_e, value) => value && setPretty(value === "pretty")}
                >
                    <ToggleButton value="pretty">Pretty</ToggleButton>
                    <ToggleButton value="raw">Raw</ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title="Refresh (updates every 10 s)">
                    <IconButton onClick={onReload} aria-label="Refresh messages">
                        <RefreshRounded fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Box sx={{ height: 2, flexShrink: 0 }}>{(waiting || (loading && !messages)) && <LinearProgress sx={{ height: 2 }} />}</Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {waiting && (
                    <Alert severity="info" sx={{ m: 1.5 }}>
                        Waiting for the mirror node to show your message…
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ m: 1.5 }}>
                        {error}
                    </Alert>
                )}
                {messages && messages.length === 0 && (
                    <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
                        No messages yet.
                    </Typography>
                )}
                {messages && messages.length > 0 && visible.length === 0 && (
                    <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
                        No message matches “{search}”.
                    </Typography>
                )}
                {visible.map((message) => (
                    <MessageItem key={message.sequenceNumber} message={message} pretty={pretty} />
                ))}
                {messages && messages.length >= 100 && !search && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", p: 2 }}>
                        Showing the latest 100 messages
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
