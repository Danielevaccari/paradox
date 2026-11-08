import { AddRounded, ForumOutlined, RefreshRounded, SearchRounded } from "@mui/icons-material";
import { Alert, Box, Button, Card, IconButton, InputAdornment, LinearProgress, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { getTopic, isTopicIndexed, waitFor } from "../api/mirrorNode";
import { serverApi } from "../api/serverApi";
import { useApp } from "../app/appContext";
import { preferences } from "../app/preferences";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { WriteButton } from "../components/common/WriteButton";
import { CreateTopicDialog } from "../components/topics/CreateTopicDialog";
import { TopicMessagesDrawer } from "../components/topics/TopicMessagesDrawer";
import { TopicTable, type TopicRow } from "../components/topics/TopicTable";
import { errorMessage, isEntityId } from "../utils/format";
import { notify } from "../utils/notify";
import { useAsyncData } from "../utils/useAsyncData";

export const TopicsView = () => {
    const { network, serverConfig, canWrite } = useApp();
    // Saved ids are read per network; `version` bumps re-read them after changes.
    const [version, setVersion] = useState(0);
    const savedIds = useMemo(() => preferences.getSavedTopicIds(network), [network, version]); // eslint-disable-line react-hooks/exhaustive-deps

    const [lookup, setLookup] = useState("");
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [openTopicId, setOpenTopicId] = useState<string | null>(null);
    const [busyTopicId, setBusyTopicId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [creatingTopicId, setCreatingTopicId] = useState<string | null>(null);

    const { data, loading, reload } = useAsyncData(`${network}:${savedIds.join(",")}`, async (signal): Promise<TopicRow[]> => {
        const results = await Promise.allSettled(savedIds.map((id) => getTopic(network, id, signal)));
        return results.map((result, index) =>
            result.status === "fulfilled"
                ? { id: savedIds[index], topic: result.value }
                : { id: savedIds[index], error: errorMessage(result.reason) },
        );
    });

    const saveIds = (ids: string[]) => {
        preferences.setSavedTopicIds(network, ids);
        setVersion((v) => v + 1);
    };

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase();
        const all: TopicRow[] = data ?? savedIds.map((id) => ({ id }));
        return term ? all.filter((row) => row.id.includes(term) || row.topic?.memo.toLowerCase().includes(term)) : all;
    }, [data, savedIds, search]);

    const addTopic = async () => {
        const id = lookup.trim();
        if (!isEntityId(id)) {
            notify.warning("Use a topic id like 0.0.12345");
            return;
        }
        if (savedIds.includes(id)) {
            setOpenTopicId(id);
            setLookup("");
            return;
        }
        try {
            await getTopic(network, id);
            saveIds([id, ...savedIds]);
            setLookup("");
            notify.success(`Topic ${id} added`);
        } catch (error) {
            notify.error(errorMessage(error) === "Not found on the mirror node" ? `Topic ${id} was not found on ${network}` : error);
        }
    };

    const onCreated = async (topicId: string) => {
        setCreateOpen(false);
        setCreatingTopicId(topicId);
        // Wait until the mirror node knows the topic, then show it.
        const payer = serverConfig?.accountId;
        if (payer) {
            await waitFor(() => isTopicIndexed(network, topicId, payer));
        }
        setCreatingTopicId(null);
        saveIds([topicId, ...preferences.getSavedTopicIds(network)]);
    };

    const runTopicAction = async (topicId: string, action: () => Promise<unknown>, success: string) => {
        setBusyTopicId(topicId);
        try {
            await action();
            notify.success(success);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            reload();
        } catch (error) {
            notify.error(error);
        } finally {
            setBusyTopicId(null);
        }
    };

    const openRow = data?.find((row) => row.id === openTopicId);

    return (
        <>
            <PageHeader
                title="Topics"
                subtitle={
                    <>
                        Hedera Consensus Service topics saved in this browser, on <b style={{ textTransform: "capitalize" }}>{network}</b>.
                    </>
                }
                actions={
                    <WriteButton variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>
                        Create topic
                    </WriteButton>
                }
            />

            <Card>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ p: 2, alignItems: { sm: "center" } }}>
                    <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                        <TextField
                            fullWidth
                            label="Add topic by ID"
                            placeholder="0.0.12345"
                            value={lookup}
                            onChange={(event) => setLookup(event.target.value)}
                            onKeyDown={(event) => event.key === "Enter" && addTopic()}
                            sx={{ maxWidth: { sm: 260 } }}
                        />
                        <Button variant="outlined" onClick={addTopic} disabled={!lookup.trim()}>
                            Add
                        </Button>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <TextField
                            fullWidth
                            placeholder="Search memo or id"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRounded fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ minWidth: { sm: 220 } }}
                        />
                        <Tooltip title="Refresh">
                            <IconButton onClick={reload} aria-label="Refresh topics">
                                <RefreshRounded />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Box sx={{ height: 4 }}>{(loading || creatingTopicId) && <LinearProgress />}</Box>

                {creatingTopicId && (
                    <Alert severity="info" sx={{ mx: 2, mb: 2 }}>
                        Topic <span className="mono">{creatingTopicId}</span> created. Waiting for the mirror node…
                    </Alert>
                )}

                {savedIds.length === 0 && !creatingTopicId ? (
                    <EmptyState
                        icon={<ForumOutlined />}
                        title="No topics yet"
                        description={
                            canWrite
                                ? "Create a topic, or add an existing one by its id to read its messages."
                                : "Add an existing topic by its id to read its messages."
                        }
                        action={
                            <WriteButton variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>
                                Create topic
                            </WriteButton>
                        }
                    />
                ) : rows.length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
                        No topics match “{search}”.
                    </Typography>
                ) : (
                    <TopicTable
                        rows={rows}
                        busyTopicId={busyTopicId}
                        onOpen={(row) => setOpenTopicId(row.id)}
                        onExtend={(id) =>
                            runTopicAction(id, () => serverApi.renewTopic({ topicId: id, days: 90 }), `Topic ${id} now expires in 90 days`)
                        }
                        onDelete={setConfirmDeleteId}
                        onRemove={(id) => saveIds(savedIds.filter((saved) => saved !== id))}
                    />
                )}
            </Card>

            <CreateTopicDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={onCreated} />

            <TopicMessagesDrawer topicId={openTopicId} topic={openRow?.topic} onClose={() => setOpenTopicId(null)} />

            <ConfirmDialog
                open={confirmDeleteId !== null}
                title="Delete topic?"
                confirmLabel="Delete"
                destructive
                busy={busyTopicId !== null}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={async () => {
                    const id = confirmDeleteId;
                    if (id) {
                        await runTopicAction(id, () => serverApi.deleteTopic({ topicId: id }), `Topic ${id} deleted`);
                    }
                    setConfirmDeleteId(null);
                }}
            >
                Topic <span className="mono">{confirmDeleteId}</span> will be deleted on Hedera. No one can submit messages to it
                afterwards. This cannot be undone.
            </ConfirmDialog>
        </>
    );
};
