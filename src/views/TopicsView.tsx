import { AddRounded, RefreshRounded } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, Stack, TextField, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getTopic, getTopicSummary, isTopicIndexed, waitFor } from "../api/mirrorNode";
import { useApp } from "../app/appContext";
import { preferences } from "../app/preferences";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { WriteButton } from "../components/common/WriteButton";
import { CreateTopicDialog } from "../components/topics/CreateTopicDialog";
import { TopicDetail } from "../components/topics/TopicDetail";
import { TopicList, type ListLayout, type TopicRow } from "../components/topics/TopicList";
import { errorMessage, isEntityId } from "../utils/format";
import { notify } from "../utils/notify";
import { useAsyncData } from "../utils/useAsyncData";

export const TopicsView = () => {
    const { topicId: routeTopicId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const desktop = useMediaQuery(theme.breakpoints.up("md"));
    const { network, serverConfig, canWrite } = useApp();

    // Saved ids are read per network; `version` bumps re-read them after changes.
    const [version, setVersion] = useState(0);
    const savedIds = useMemo(() => preferences.getSavedTopicIds(network), [network, version]); // eslint-disable-line react-hooks/exhaustive-deps
    const [lookup, setLookup] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [creatingTopicId, setCreatingTopicId] = useState<string | null>(null);

    const selectedId = routeTopicId && isEntityId(routeTopicId) ? routeTopicId : null;

    const { data, loading, reload } = useAsyncData(`${network}:${savedIds.join(",")}`, async (signal): Promise<TopicRow[]> => {
        const results = await Promise.allSettled(savedIds.map((id) => getTopicSummary(network, id, signal)));
        return results.map((result, index) =>
            result.status === "fulfilled"
                ? { id: savedIds[index], summary: result.value }
                : { id: savedIds[index], error: errorMessage(result.reason) },
        );
    });
    const rows: TopicRow[] = useMemo(() => data ?? savedIds.map((id) => ({ id })), [data, savedIds]);

    const saveIds = (ids: string[]) => {
        preferences.setSavedTopicIds(network, ids);
        setVersion((v) => v + 1);
    };

    const open = (id: string) => navigate(`/topics/${id}`);
    const close = () => navigate("/");

    const addTopic = async () => {
        const id = lookup.trim();
        if (!isEntityId(id)) {
            notify.warning("Use a topic id like 0.0.12345");
            return;
        }
        try {
            await getTopic(network, id);
            if (!savedIds.includes(id)) {
                saveIds([id, ...savedIds]);
            }
            setLookup("");
            open(id);
        } catch (error) {
            notify.error(errorMessage(error) === "Not found on the mirror node" ? `Topic ${id} was not found on ${network}` : error);
        }
    };

    const onCreated = async (topicId: string) => {
        setCreateOpen(false);
        setCreatingTopicId(topicId);
        // Wait until the free mirror node knows the topic, then open it.
        const payer = serverConfig?.accountId;
        if (payer) {
            await waitFor(() => isTopicIndexed(network, topicId, payer));
        }
        setCreatingTopicId(null);
        saveIds([topicId, ...preferences.getSavedTopicIds(network)]);
        open(topicId);
    };

    const layout: ListLayout = !desktop ? "narrow" : selectedId ? "split" : "wide";

    const controls = (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flex: { xs: "1 1 100%", sm: "0 1 auto" } }}>
            <TextField
                placeholder="Add topic by ID, e.g. 0.0.12345"
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addTopic()}
                slotProps={{ htmlInput: { "aria-label": "Topic ID" } }}
                sx={{ flex: 1, minWidth: 0, width: { sm: 260 } }}
            />
            <Button variant="outlined" onClick={addTopic} disabled={!lookup.trim()}>
                Add
            </Button>
            <Tooltip title="Refresh">
                <IconButton onClick={reload} aria-label="Refresh topics">
                    <RefreshRounded fontSize="small" />
                </IconButton>
            </Tooltip>
        </Stack>
    );

    const showList = desktop || !selectedId;

    return (
        <>
            {showList && (
                <PageHeader
                    title="Topics"
                    hint={`Saved in this browser · ${network}`}
                    actions={
                        <WriteButton variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>
                            Create topic
                        </WriteButton>
                    }
                />
            )}

            <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
                {showList && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                            flex: layout === "split" ? "0 0 clamp(340px, 36%, 480px)" : 1,
                            borderRight: layout === "split" ? 1 : 0,
                            borderColor: "divider",
                        }}
                    >
                        {creatingTopicId && (
                            <Alert severity="info" sx={{ m: 1.5, flexShrink: 0 }}>
                                Topic <span className="mono">{creatingTopicId}</span> created. Waiting for the mirror node…
                            </Alert>
                        )}
                        {savedIds.length === 0 ? (
                            <>
                                <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex" }}>{controls}</Box>
                                <EmptyState
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
                            </>
                        ) : (
                            <TopicList
                                rows={rows}
                                loading={loading}
                                selectedId={selectedId}
                                layout={layout}
                                onSelect={open}
                                toolbarStart={controls}
                            />
                        )}
                    </Box>
                )}

                {selectedId && (
                    <TopicDetail
                        key={`${network}:${selectedId}`}
                        topicId={selectedId}
                        saved={savedIds.includes(selectedId)}
                        fullScreen={!desktop}
                        onSave={() => saveIds([selectedId, ...savedIds])}
                        onRemove={() => saveIds(savedIds.filter((id) => id !== selectedId))}
                        onClose={close}
                        onChanged={reload}
                    />
                )}
            </Box>

            <CreateTopicDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={onCreated} />
        </>
    );
};
