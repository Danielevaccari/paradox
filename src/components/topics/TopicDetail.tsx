import {
    AddRounded,
    ArrowBackRounded,
    BookmarkAddOutlined,
    BookmarkRemoveOutlined,
    CloseRounded,
    ContentCopyRounded,
    DeleteOutlineRounded,
    MoreVertRounded,
    OpenInNewRounded,
    UpdateRounded,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Chip,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { TYPICAL_FEE_HBAR } from "../../../shared/api";
import { getTopicMessages, getTopicSummary, waitFor } from "../../api/mirrorNode";
import { serverApi } from "../../api/serverApi";
import { useApp } from "../../app/appContext";
import { usePaidAction } from "../../app/paidActionContext";
import { formatDate, formatRelative, formatTimestamp } from "../../utils/format";
import { notify } from "../../utils/notify";
import { useAsyncData } from "../../utils/useAsyncData";
import { WriteButton } from "../common/WriteButton";
import { ComposeMessageDialog } from "./ComposeMessageDialog";
import { TopicMessages } from "./TopicMessages";
import { isOperatorKey } from "./topicKeys";

const REFRESH_MS = 10_000;

const Fact = ({ label, children, title }: { label: string; children: ReactNode; title?: string }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" component="div">
            {label}
        </Typography>
        <Tooltip title={title ?? ""}>
            <Typography variant="body1" noWrap sx={{ fontWeight: 600 }}>
                {children}
            </Typography>
        </Tooltip>
    </Box>
);

type Props = {
    topicId: string;
    /** Whether the topic is in the user's saved list. */
    saved: boolean;
    /** Phones show the detail full screen with a back arrow instead of a close button. */
    fullScreen: boolean;
    onSave: () => void;
    onRemove: () => void;
    onClose: () => void;
    /** Called after a change so the list can refresh its counts. */
    onChanged: () => void;
};

/** Everything about one topic at a glance, with its messages below. Reads only use the free mirror node. */
export const TopicDetail = ({ topicId, saved, fullScreen, onSave, onRemove, onClose, onChanged }: Props) => {
    const { network, serverConfig, canWrite } = useApp();
    const confirmPaid = usePaidAction();
    const [composeOpen, setComposeOpen] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const key = `${network}:${topicId}`;
    const summary = useAsyncData(key, (signal) => getTopicSummary(network, topicId, signal));
    const messages = useAsyncData(key, (signal) => getTopicMessages(network, topicId, 100, signal));
    const reloadSummary = summary.reload;
    const reloadMessages = messages.reload;

    const reloadAll = () => {
        reloadSummary();
        reloadMessages();
    };

    // Live updates: refresh every 10 s while the tab is visible (free mirror node reads).
    useEffect(() => {
        const timer = setInterval(() => {
            if (!document.hidden) {
                reloadSummary();
                reloadMessages();
            }
        }, REFRESH_MS);
        return () => clearInterval(timer);
    }, [reloadSummary, reloadMessages]);

    const topic = summary.data?.topic;
    const newest = messages.data?.[0];
    const messageCount = newest?.sequenceNumber ?? summary.data?.messageCount;
    const lastMessageAt = newest?.consensusTimestamp ?? summary.data?.lastMessageAt ?? null;

    const isAdmin = canWrite && Boolean(topic) && !topic?.deleted && isOperatorKey(topic?.admin_key, serverConfig?.publicKey);
    const blockedBySubmitKey = Boolean(topic?.submit_key) && !isOperatorKey(topic?.submit_key, serverConfig?.publicKey);

    const copyId = () =>
        navigator.clipboard.writeText(topicId).then(
            () => notify.info(`Copied ${topicId}`),
            () => notify.warning("Could not copy"),
        );

    const afterChange = () => {
        setTimeout(() => {
            reloadAll();
            onChanged();
        }, 3000);
    };

    const renew = () =>
        confirmPaid({
            title: `Renew topic ${topicId}`,
            description: "Sets the topic to expire 90 days from now.",
            feeHbar: TYPICAL_FEE_HBAR.renewTopic,
            run: async () => {
                await serverApi.renewTopic({ topicId, days: 90 });
                notify.success("Topic renewed for 90 days");
            },
        }).then((ok) => ok && afterChange());

    const remove = () =>
        confirmPaid({
            title: `Delete topic ${topicId}`,
            description: "No one can submit messages to it afterwards. This cannot be undone.",
            feeHbar: TYPICAL_FEE_HBAR.deleteTopic,
            destructive: true,
            confirmLabel: "Delete topic",
            run: async () => {
                await serverApi.deleteTopic({ topicId });
                notify.success(`Topic ${topicId} deleted`);
            },
        }).then((ok) => ok && afterChange());

    const onSent = async (sequenceNumber: number) => {
        setComposeOpen(false);
        setWaiting(true);
        // The mirror node lags consensus by a few seconds.
        await waitFor(async () => (await getTopicMessages(network, topicId, 3)).some((m) => m.sequenceNumber >= sequenceNumber));
        setWaiting(false);
        reloadAll();
        onChanged();
    };

    return (
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 1.5, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                    {fullScreen && (
                        <IconButton onClick={onClose} aria-label="Back to topics" size="medium" sx={{ ml: -1, mt: -0.5 }}>
                            <ArrowBackRounded />
                        </IconButton>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h2" sx={{ wordBreak: "break-word" }}>
                            {summary.error ? "Topic not available" : topic ? topic.memo || "Unnamed topic" : "Loading…"}
                        </Typography>
                        <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", color: "text.secondary" }}>
                            <Typography variant="body2" className="mono">
                                {topicId}
                            </Typography>
                            <Tooltip title="Copy topic id">
                                <IconButton onClick={copyId} aria-label="Copy topic id">
                                    <ContentCopyRounded sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Open on HashScan">
                                <IconButton
                                    component="a"
                                    href={`https://hashscan.io/${network}/topic/${topicId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Open on HashScan"
                                >
                                    <OpenInNewRounded sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <Tooltip title="More">
                        <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)} aria-label="More actions">
                            <MoreVertRounded />
                        </IconButton>
                    </Tooltip>
                    {!fullScreen && (
                        <IconButton onClick={onClose} aria-label="Close topic">
                            <CloseRounded />
                        </IconButton>
                    )}
                    <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
                        <MenuItem
                            dense
                            onClick={() => {
                                setMenuAnchor(null);
                                if (saved) {
                                    onRemove();
                                } else {
                                    onSave();
                                }
                            }}
                        >
                            <ListItemIcon>
                                {saved ? <BookmarkRemoveOutlined fontSize="small" /> : <BookmarkAddOutlined fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText>{saved ? "Remove from my list" : "Save to my list"}</ListItemText>
                        </MenuItem>
                    </Menu>
                </Stack>

                {summary.error && (
                    <Alert severity="error" sx={{ mt: 1.5 }}>
                        {summary.error}
                    </Alert>
                )}

                {topic && (
                    <>
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 0.75 }}>
                            <Chip size="small" variant="outlined" label={topic.submit_key ? "Private" : "Public"} />
                            <Chip size="small" variant="outlined" label={topic.admin_key ? "Has admin key" : "No admin key"} />
                            {isAdmin && <Chip size="small" color="primary" variant="outlined" label="Yours" />}
                            {topic.deleted && <Chip size="small" color="error" label="Deleted" />}
                        </Stack>

                        <Box
                            sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.5, mt: 1.5 }}
                        >
                            <Fact label="Messages" title="Latest sequence number">
                                {messageCount ?? "…"}
                            </Fact>
                            <Fact label="Last message" title={formatTimestamp(lastMessageAt, true)}>
                                {lastMessageAt ? formatRelative(lastMessageAt) : "None yet"}
                            </Fact>
                            <Fact label="Created" title={formatTimestamp(topic.created_timestamp, true)}>
                                {formatDate(topic.created_timestamp)}
                            </Fact>
                            <Fact label="Auto-renew" title={topic.auto_renew_account ?? undefined}>
                                {topic.auto_renew_period ? `${Math.round(topic.auto_renew_period / 86400)} days` : "—"}
                            </Fact>
                        </Box>
                    </>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}>
                    <WriteButton
                        variant="contained"
                        size="small"
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
                        New message
                    </WriteButton>
                    {isAdmin && (
                        <>
                            <Button variant="outlined" size="small" startIcon={<UpdateRounded />} onClick={renew}>
                                Renew
                            </Button>
                            <Button variant="outlined" size="small" color="error" startIcon={<DeleteOutlineRounded />} onClick={remove}>
                                Delete
                            </Button>
                        </>
                    )}
                </Stack>
            </Box>

            <TopicMessages
                messages={messages.data}
                loading={messages.loading}
                error={messages.error}
                waiting={waiting}
                onReload={reloadAll}
            />

            <ComposeMessageDialog open={composeOpen} topicId={topicId} onClose={() => setComposeOpen(false)} onSent={onSent} />
        </Box>
    );
};
