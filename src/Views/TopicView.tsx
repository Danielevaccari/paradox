import { TopicId } from "@hashgraph/sdk";
import * as React from "react";
import {
    Box,
    Button,
    Paper,
    Switch,
    TextField,
    Typography,
    Drawer,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    Tooltip,
} from "@mui/material";
import { TopicMessagesList } from "../components/Topics/TopicMessagesList";
import { Message, Topic } from "../Hedera/types";
import { Hedera } from "../Hedera/hedera";
import { LocalStorageHelper } from "../LocalStorage/localStorageHelper";
import styled from "styled-components";
import { TopicList } from "../components/Topics/TopicList";
import { Notifier } from "../Notifications/notifications";
import { HederaMirrorNode } from "../Hedera/hederaMirrorNode";

type Props = {
    className?: string;
};

let TopicView = ({ className }: Props) => {
    const [memo, setMemo] = React.useState<string>("");
    const [isAdmin, setIsAdmin] = React.useState(true);
    const [isPrivate, setIsPrivate] = React.useState(true);
    const [inputTopicId, setInputTopicId] = React.useState("");
    const [loadingTopic, setLoadingTopic] = React.useState(false);
    const [creatingTopic, setCreatingTopic] = React.useState(false);
    const [topics, setTopics] = React.useState<Array<Topic>>([]);
    const [openCreateTopicDialog, setOpenCreateTopicDialog] = React.useState(false);
    const [selectedTopic, setSelectedTopic] = React.useState<Topic | null>(null);
    const [selectedTopicTopicMessages, setSelectedTopicTopicMessages] = React.useState<Array<Message>>([]);

    const onTopicMemoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setMemo(event.target.value);
    };

    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputTopicId(event.target.value);
    }, []);

    const onSelectTopic = React.useCallback((topic: Topic) => {
        setSelectedTopic(topic);
    }, []);

    const onDeleteTopic = React.useCallback((topicId: string) => {
        Hedera.deleteTopicById(topicId)
            .then(() => {
                setTopics((prevTopics) => {
                    const updated = prevTopics.map((topic) => (topic.topicId === topicId ? { ...topic, deleted: true } : topic));
                    return updated;
                });

                Notifier.showSuccess("Topic deleted successfully. Following topic message submissions will fail");
            })
            .catch(Notifier.showError);
    }, []);

    const handleFetchTopic = React.useCallback(() => {
        const trimmedTopicId = inputTopicId.trim();
        if (trimmedTopicId.length === 0) {
            return;
        }

        const topicIdRegex = /^\d+\.\d+\.\d+$/;

        if (!topicIdRegex.test(trimmedTopicId)) {
            Notifier.showError("Invalid topic ID format. Use format like 0.0.123456");
            return;
        }

        const topicId = TopicId.fromString(trimmedTopicId);
        setLoadingTopic(true);

        HederaMirrorNode.getTopicInfoById(topicId)
            .then((topic: Topic) => {
                setTopics((prev) => [topic, ...prev]);
                onSelectTopic(topic);
                Notifier.showSuccess("Topic found");
                LocalStorageHelper.storeTopicId(topic.topicId);
            })
            .catch(Notifier.showError)
            .finally(() => setLoadingTopic(false));
    }, [inputTopicId, onSelectTopic]);

    const onCreateTopic = async () => {
        if (memo.trim() === "") {
            return;
        }
        setCreatingTopic(true);

        let topicId;

        if (isAdmin) {
            topicId = await Hedera.createAdminTopic(memo);
        } else if (isPrivate) {
            topicId = await Hedera.createPrivateTopic(memo);
        } else {
            topicId = await Hedera.createTopic(memo);
        }

        if (!topicId) {
            setCreatingTopic(false);
            return;
        }

        new Promise((resolve) => setTimeout(resolve, 3000)).then(() => {
            // Add delay to allow the topic to be created on the network
            HederaMirrorNode.getTopicInfoById(topicId)
                .then((topic: Topic) => {
                    setTopics((prev) => [topic, ...prev]);
                    setMemo("");
                    Notifier.showSuccess("Topic created successfully");
                })
                .finally(() => {
                    setCreatingTopic(false);
                    setOpenCreateTopicDialog(false);
                });
        });
    };

    const getTopicMessagesByTopicId = (topicId: TopicId | string) => {
        HederaMirrorNode.mirrorNodeGetTopicMessagesByTopicId(topicId).then(setSelectedTopicTopicMessages);
    };

    const onCreateTopicMessage = React.useCallback(
        (topicMessage: string) => {
            if (!selectedTopic) {
                return;
            }

            Hedera.createTopicMessage(selectedTopic.topicId, topicMessage)
                .then(() => {
                    new Promise((resolve) => setTimeout(resolve, 6000)).then(() => {
                        getTopicMessagesByTopicId(selectedTopic.topicId);
                    });
                })
                .catch(Notifier.showError);
        },
        [selectedTopic],
    );

    const fetchTopics = React.useCallback(async () => {
        const topics = await Promise.all(
            LocalStorageHelper.getStoredTopicIds().map(async (savedTopicId) => {
                const topicId = TopicId.fromString(savedTopicId);
                const topic = await HederaMirrorNode.getTopicInfoById(topicId);

                return topic;
            }),
        );

        setTopics(topics);
    }, []);

    const refresh = React.useCallback(() => {
        fetchTopics();
    }, [fetchTopics]);

    const onRemoveTopicFromLocalStorage = React.useCallback((topicId: string) => {
        setTopics((prevState) => prevState.filter((topic) => topic.topicId !== topicId));
        LocalStorageHelper.deleteTopicId(topicId.toString());
    }, []);

    React.useEffect(() => {
        if (!selectedTopic) {
            return;
        }

        getTopicMessagesByTopicId(selectedTopic.topicId);
    }, [selectedTopic]);

    React.useEffect(() => {
        topics.forEach((topic) => {
            LocalStorageHelper.storeTopicId(topic.topicId);
        });
    }, [topics]);

    React.useEffect(() => {
        // Effect for initial fetch
        fetchTopics();
    }, [fetchTopics]);

    return (
        <div className={className}>
            <Box>
                <div className="header">
                    {/* Topic Controls */}
                    <Paper sx={{ p: "1rem" }}>
                        <Grid container spacing={3} alignItems="center">
                            {/* ID Input and Fetch Button Group */}
                            <Grid>
                                <Box
                                    sx={(theme) => ({
                                        backgroundColor: theme.palette.background.default,
                                        p: "1rem",
                                    })}
                                >
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid>
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                value={inputTopicId}
                                                label="Enter Topic ID"
                                                onChange={handleInputChange}
                                            />
                                        </Grid>

                                        <Grid>
                                            <Tooltip title="Fetch existing topic info" arrow>
                                                <Button
                                                    fullWidth
                                                    color="info"
                                                    size="medium"
                                                    variant="contained"
                                                    disabled={loadingTopic || inputTopicId.length <= 4}
                                                    onClick={handleFetchTopic}
                                                >
                                                    {loadingTopic ? "Loading..." : "Get"}
                                                </Button>
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>

                            {/* Create New Topic Button Group */}
                            <Grid>
                                <Box
                                    sx={(theme) => ({
                                        backgroundColor: theme.palette.background.default,
                                        p: "1rem",
                                    })}
                                >
                                    <Tooltip title="Create a new topic using Consensus Service" arrow>
                                        <Button
                                            fullWidth
                                            size="medium"
                                            color="success"
                                            variant="contained"
                                            onClick={() => setOpenCreateTopicDialog(true)}
                                        >
                                            Create Topic
                                        </Button>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </div>

                {/* Scrollable Content */}
                <div className="content">
                    <TopicList
                        topics={topics}
                        refreshTopicView={refresh}
                        onSelectTopic={onSelectTopic}
                        onDeleteTopic={onDeleteTopic}
                        onRemoveTopicFromLocalStorage={onRemoveTopicFromLocalStorage}
                    />
                </div>

                {/* Right Drawer for Topic Messages */}
                <Drawer
                    anchor="right"
                    open={Boolean(selectedTopic)}
                    onClose={() => setSelectedTopic(null)}
                    slotProps={{ paper: { sx: { width: "50%", padding: "1rem 0px 1rem 1rem" } } }}
                >
                    {selectedTopic && (
                        <TopicMessagesList
                            topic={selectedTopic}
                            topicMessages={selectedTopicTopicMessages}
                            onCreateTopicMessage={onCreateTopicMessage}
                        />
                    )}
                </Drawer>
            </Box>

            {/* Dialog for Create Topic */}
            <Dialog open={openCreateTopicDialog} onClose={() => setOpenCreateTopicDialog(false)}>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Memo"
                        value={memo}
                        variant="standard"
                        helperText="Enter a memo for the topic"
                        onChange={onTopicMemoChange}
                    />

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid>
                            <Tooltip title="Only admin can delete Topics" arrow>
                                <Box display="flex" alignItems="center">
                                    <Switch color="success" checked={isAdmin} onChange={(event) => setIsAdmin(event.target.checked)} />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        Admin
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </Grid>
                        <Grid>
                            <Tooltip title="Only specified accounts can send Topic messages into private Topics" arrow>
                                <Box display="flex" alignItems="center">
                                    <Switch color="success" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />

                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        Private
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </Grid>

                        <Grid>
                            <Tooltip title="Create a new topic using Consensus Service" arrow>
                                <Button
                                    fullWidth
                                    size="large"
                                    color="success"
                                    variant="contained"
                                    disabled={creatingTopic || memo.length === 0}
                                    onClick={onCreateTopic}
                                >
                                    Create Topic
                                </Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenCreateTopicDialog(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

TopicView = styled(TopicView)`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    > div {
        display: flex;
        flex-direction: column;
        height: 100%;

        > .header {
            flex-shrink: 0;
        }

        > .content {
            flex-grow: 1;
            overflow-y: auto;
        }
    }
`;

export { TopicView };
