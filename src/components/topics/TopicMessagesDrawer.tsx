import { AddRounded, CloseRounded, RefreshRounded, RemoveRounded, ChatBubbleOutlineRounded } from "@mui/icons-material";
import {
    Alert,
    Box,
    Chip,
    Drawer,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { getTopicMessages, waitFor, type Topic } from "../../api/mirrorNode";
import { useApp } from "../../app/appContext";
import { preferences } from "../../app/preferences";
import { formatTimestamp, prettyJson } from "../../utils/format";
import { useAsyncData } from "../../utils/useAsyncData";
import { EmptyState } from "../common/EmptyState";
import { WriteButton } from "../common/WriteButton";
import { ComposeMessageDialog } from "./ComposeMessageDialog";
import { isOperatorKey } from "./topicKeys";

type Props = {
    topicId: string | null;
    topic?: Topic;
    onClose: () => void;
};

export const TopicMessagesDrawer = ({ topicId, topic, onClose }: Props) => (
    <Drawer
        anchor="right"
        open={topicId !== null}
        onClose={onClose}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 560, lg: 680 } } } }}
    >
        {topicId && <TopicMessages key={topicId} topicId={topicId} topic={topic} onClose={onClose} />}
    </Drawer>
);

const TopicMessages = ({ topicId, topic, onClose }: Props & { topicId: string }) => {
    const { network, serverConfig } = useApp();
    const [format, setFormat] = useState<"pretty" | "raw">("pretty");
    const [fontSize, setFontSize] = useState(() => preferences.getMessageFontSize());
    const [composeOpen, setComposeOpen] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const {
        data: messages,
        error,
        loading,
        reload,
    } = useAsyncData(`${network}:${topicId}`, (signal) => getTopicMessages(network, topicId, 100, signal));

    const changeFontSize = (delta: number) => {
        const next = Math.min(24, Math.max(10, fontSize + delta));
        setFontSize(next);
        preferences.setMessageFontSize(next);
    };

    const onSent = async (sequenceNumber: number) => {
        setComposeOpen(false);
        setWaiting(true);
        // The mirror node lags consensus by a few seconds.
        await waitFor(async () => {
            const latest = await getTopicMessages(network, topicId, 5);
            return latest.some((m) => m.sequenceNumber >= sequenceNumber);
        });
        setWaiting(false);
        reload();
    };

    const blockedBySubmitKey = Boolean(topic?.submit_key) && !isOperatorKey(topic?.submit_key, serverConfig?.publicKey);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1, pb: 1, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="overline" color="text.secondary">
                            Topic messages
                        </Typography>
                        <Typography variant="h2" className="mono">
                            {topicId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {topic?.memo || "Unnamed topic"}
                        </Typography>
                    </Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={reload} aria-label="Refresh messages">
                            <RefreshRounded fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} aria-label="Close messages">
                        <CloseRounded />
                    </IconButton>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                    <WriteButton
                        variant="contained"
                        startIcon={<AddRounded />}
                        blockedReason={
                            topic?.deleted
                                ? "This topic is deleted"
                                : blockedBySubmitKey
                                  ? "This topic needs a submit key this app does not have"
                                  : null
                        }
                        onClick={() => setComposeOpen(true)}
                    >
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                            New message
                        </Box>
                        <Box component="span" sx={{ display: { sm: "none" } }}>
                            New
                        </Box>
                    </WriteButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <ToggleButtonGroup size="small" exclusive value={format} onChange={(_e, value) => value && setFormat(value)}>
                        <ToggleButton value="pretty">Pretty</ToggleButton>
                        <ToggleButton value="raw">Raw</ToggleButton>
                    </ToggleButtonGroup>
                    <Tooltip title="Smaller text">
                        <IconButton size="small" onClick={() => changeFontSize(-1)} aria-label="Smaller text">
                            <RemoveRounded fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Larger text">
                        <IconButton size="small" onClick={() => changeFontSize(1)} aria-label="Larger text">
                            <AddRounded fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <Box sx={{ height: 2, flexShrink: 0 }}>{(loading || waiting) && <LinearProgress sx={{ height: 2 }} />}</Box>

            <Box sx={{ flexGrow: 1, overflowY: "auto", px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.5 }, bgcolor: "background.default" }}>
                {waiting && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Waiting for the mirror node to index your message…
                    </Alert>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {messages && messages.length === 0 && (
                    <EmptyState
                        icon={<ChatBubbleOutlineRounded />}
                        title="No messages yet"
                        description="Messages submitted to this topic will show up here."
                    />
                )}
                <Stack spacing={1}>
                    {messages?.map((message) => (
                        <Paper key={message.sequenceNumber} variant="outlined" sx={{ overflow: "hidden" }}>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    px: 1,
                                    py: 0.5,
                                    alignItems: "center",
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    color: "text.secondary",
                                }}
                            >
                                <Chip size="small" label={`#${message.sequenceNumber}`} />
                                {message.chunks > 1 && (
                                    <Tooltip title="Sent in several chunks">
                                        <Chip size="small" variant="outlined" label={`${message.chunks} chunks`} />
                                    </Tooltip>
                                )}
                                <Typography variant="caption" sx={{ flexGrow: 1 }}>
                                    {formatTimestamp(message.consensusTimestamp, true)}
                                </Typography>
                                <Tooltip title="Payer account">
                                    <Typography variant="caption" className="mono">
                                        {message.payerAccountId}
                                    </Typography>
                                </Tooltip>
                            </Stack>
                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    px: 1.25,
                                    py: 1,
                                    fontSize,
                                    lineHeight: 1.5,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    maxHeight: 480,
                                    overflow: "auto",
                                }}
                            >
                                {format === "pretty" ? prettyJson(message.text) : message.text}
                            </Box>
                        </Paper>
                    ))}
                </Stack>
                {messages && messages.length >= 100 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2 }}>
                        Showing the latest 100 messages
                    </Typography>
                )}
            </Box>

            <ComposeMessageDialog open={composeOpen} topicId={topicId} onClose={() => setComposeOpen(false)} onSent={onSent} />
        </Box>
    );
};
