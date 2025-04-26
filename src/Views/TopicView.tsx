import { TopicId, TopicInfo } from "@hashgraph/sdk";
import * as React from "react";
import { Box, Button, Grid, Paper, Switch, TextField, Typography, Drawer } from "@mui/material";
import { TopicMessagesList } from "../components/Topics/TopicMessagesList";
import { Message } from "../Hedera/types";
import { Hedera } from "../Hedera/hedera";
import { LocalStorageHelper } from "../LocalStorage/localStorageHelper";
import styled from "styled-components";
import { TopicList } from "../components/Topics/TopicList";
import { Notifier } from "../Notifications/notifications";

type Props = {
    className?: string;
};

let TopicView = ({ className }: Props) => {
    const [memo, setMemo] = React.useState<string>("");
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isPrivate, setIsPrivate] = React.useState(false);
    const [loadingTopic, setLoadingTopic] = React.useState(false);
    const [inputTopicId, setInputTopicId] = React.useState("0.0.");
    const [creatingTopic, setCreatingTopic] = React.useState(false);
    const [topics, setTopics] = React.useState<Array<TopicInfo>>([]);
    const [selectedTopic, setSelectedTopic] = React.useState<TopicInfo | null>(null);
    const [selectedTopicTopicMessages, setSelectedTopicTopicMessages] = React.useState<Array<Message>>([]);

    const onTopicMemoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setMemo(event.target.value);
    };

    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputTopicId(event.target.value);
    }, []);

    const onSelectTopic = React.useCallback((topic: TopicInfo) => {
        setSelectedTopic(topic);
    }, []);

    const onDeleteTopic = React.useCallback((topicId: TopicId) => {
        Hedera.deleteTopicById(topicId).then(() => {
            setTopics((prevState) => prevState.filter((topic) => topic.topicId !== topicId));
            LocalStorageHelper.deleteTopicId(topicId.toString());
        });
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

        Hedera.getTopicInfo(topicId)
            .then((topic: TopicInfo) => {
                setTopics((prev) => [topic, ...prev]);
                onSelectTopic(topic);
                Notifier.showSuccess("Topic found");
                LocalStorageHelper.storeTopicId(topic.topicId.toString());
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

        Hedera.getTopicInfo(topicId)
            .then((topic: TopicInfo) => {
                setTopics((prev) => [topic, ...prev]);
                setMemo("");
            })
            .finally(() => setCreatingTopic(false));
    };

    const getTopicMessagesByTopicId = (topicId: TopicId | string) => {
        Hedera.mirrorNodeGetTopicMessagesByTopicId(topicId).then(setSelectedTopicTopicMessages);
    };

    const onCreateTopicMessage = React.useCallback(
        (topicMessage: string) => {
            if (!selectedTopic) {
                return;
            }

            Hedera.createTopicMessage(selectedTopic.topicId, topicMessage).then(() => {
                new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
                    getTopicMessagesByTopicId(selectedTopic.topicId);
                });
            });
        },
        [selectedTopic],
    );

    const fetchTopics = React.useCallback(async () => {
        const topicInfos = await Promise.all(
            LocalStorageHelper.getStoredTopicIds().map(async (savedTopicId) => {
                const topicId = TopicId.fromString(savedTopicId);
                return await Hedera.getTopicInfo(topicId);
            }),
        );

        setTopics(topicInfos);
    }, []);

    const refresh = React.useCallback(() => {
        fetchTopics();
    }, [fetchTopics]);

    React.useEffect(() => {
        if (!selectedTopic) {
            return;
        }
        getTopicMessagesByTopicId(selectedTopic.topicId);
    }, [selectedTopic]);

    React.useEffect(() => {
        topics.forEach((topic) => {
            LocalStorageHelper.storeTopicId(topic.topicId.toString());
        });
    }, [topics]);

    React.useEffect(() => {
        // Effect for initial fetch
        fetchTopics();
    }, [fetchTopics]);

    return (
        <div className={className}>
            <Box sx={{ width: "100%" }}>
                {/* Topic Controls */}
                <Paper elevation={3} sx={{ p: 3, mb: 2, width: "50%" }}>
                    <Grid container spacing={2} display="flex" alignItems="center" justifyContent="space-around">
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Existing Topic
                            </Typography>

                            <TextField fullWidth label="Topic id" variant="standard" value={inputTopicId} onChange={handleInputChange} />
                        </Grid>

                        <Grid item xs={3}>
                            <Button
                                fullWidth
                                size="large"
                                disableRipple
                                color="secondary"
                                variant="contained"
                                disabled={loadingTopic || inputTopicId.length === 0}
                                onClick={handleFetchTopic}
                            >
                                Fetch
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Create Topic
                            </Typography>

                            <TextField fullWidth value={memo} variant="standard" label="Memo" onChange={onTopicMemoChange} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                        Not admin
                                    </Typography>

                                    <Switch color="success" checked={isAdmin} onChange={(event) => setIsAdmin(event.target.checked)} />

                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        Admin
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                        Public
                                    </Typography>
                                    <Switch color="success" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        Private
                                    </Typography>
                                </Box>

                                <Button
                                    size="large"
                                    disableRipple
                                    color="success"
                                    variant="contained"
                                    disabled={creatingTopic || memo.length === 0}
                                    onClick={onCreateTopic}
                                >
                                    Create
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Topic List Table */}
                <TopicList //
                    topics={topics}
                    refreshTopicView={refresh}
                    onSelectTopic={onSelectTopic}
                    onDeleteTopic={onDeleteTopic}
                />

                {/* Right Drawer for Topic Messages */}
                <Drawer
                    anchor="right"
                    open={Boolean(selectedTopic)}
                    onClose={() => setSelectedTopic(null)}
                    PaperProps={{
                        sx: { width: "40%", p: 2 },
                    }}
                >
                    {selectedTopic && (
                        <TopicMessagesList
                            topicId={selectedTopic.topicId}
                            topicMessages={selectedTopicTopicMessages}
                            onCreateTopicMessage={onCreateTopicMessage}
                        />
                    )}
                </Drawer>
            </Box>
        </div>
    );
};

TopicView = styled(TopicView)`
    height: 100vh;
`;

export { TopicView };
