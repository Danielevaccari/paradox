import React, { useState, useMemo } from "react";
import { TopicId } from "@hashgraph/sdk";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    CircularProgress,
    TextField,
    Tooltip,
    IconButton,
} from "@mui/material";
import { Hedera } from "../../Hedera/hedera";
import { Notifier } from "../../Notifications/notifications";
import styled from "styled-components";
import { Topic } from "../../Hedera/types";
import { DeleteOutline, PunchClock } from "@mui/icons-material";

type Props = {
    className?: string;
    topics: Array<Topic>;
    onSelectTopic: (topic: Topic) => void;
    onDeleteTopic: (topicId: string) => void;
    refreshTopicView: () => void;
    onRemoveTopicFromLocalStorage: (topicId: string) => void;
};

let TopicList = ({ className, topics, onSelectTopic, onDeleteTopic, refreshTopicView, onRemoveTopicFromLocalStorage }: Props) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [updatingTopicId, setUpdatingTopicId] = React.useState<string | null>(null);

    const handleSelectTopic = React.useCallback(
        (topic: Topic) => {
            onSelectTopic(topic);
        },
        [onSelectTopic],
    );

    const handleDeleteTopic = React.useCallback(
        (topicId: string) => {
            onDeleteTopic(topicId);
        },
        [onDeleteTopic],
    );

    const handleUpdateTopicExpirationDate = React.useCallback(
        (topic: Topic) => {
            const newExpirationTime = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from NOW max expiration

            const topicId = TopicId.fromString(topic.topicId);

            Hedera.updateTopic({ topicId: topicId, newExpirationTime: newExpirationTime })
                .then(() => {
                    refreshTopicView();
                })
                .catch(Notifier.showError)
                .finally(() => {
                    setUpdatingTopicId(null);
                });
        },
        [refreshTopicView],
    );

    const filteredTopics = useMemo(() => {
        return topics.filter((topic) => topic.memo?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [topics, searchTerm]);

    return (
        <div className={className}>
            <Box>
                <TableContainer component={Paper}>
                    <Table size="small" stickyHeader>
                        <TableHead
                            sx={{
                                top: 0,
                                zIndex: 1,
                                position: "sticky",
                                backgroundColor: "background.paper",
                            }}
                        >
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>
                                    Memo
                                    <TextField
                                        size="small"
                                        sx={{ ml: 1 }}
                                        variant="standard"
                                        value={searchTerm}
                                        placeholder="search"
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                    />
                                </TableCell>
                                <TableCell align="right"> </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredTopics.map((topic) => (
                                <TableRow
                                    hover
                                    key={topic.topicId}
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleSelectTopic(topic)}
                                >
                                    <TableCell align="left">
                                        <Tooltip title={topic.deleted ? "Deleted Topic" : ""}>
                                            <Typography variant="caption" color={topic.deleted ? "red" : ""}>
                                                {topic.topicId}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell align="left">
                                        <Typography variant="body2">{topic.memo ?? "Unnamed Topic"}</Typography>
                                    </TableCell>

                                    <TableCell align="right">
                                        {topic.deleted === false &&
                                            topic.adminKey?.key === Hedera.getPrivateKey().publicKey.toStringRaw() && (
                                                <Tooltip title="Delete Topic. Topic remains but following topic message submissions will fail">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        sx={{ m: "0.15rem" }}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteTopic(topic.topicId);
                                                        }}
                                                    >
                                                        <DeleteOutline />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                        {updatingTopicId === topic.topicId ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <Tooltip title="Update Expiration">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    sx={{ m: "0.15rem" }}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setUpdatingTopicId(topic.topicId.toString());
                                                        handleUpdateTopicExpirationDate(topic);
                                                    }}
                                                >
                                                    <PunchClock fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        <Tooltip title="Remove from Local Storage">
                                            <Button
                                                size="small"
                                                disableRipple
                                                color="secondary"
                                                variant="outlined"
                                                sx={{ m: "0.15rem", minWidth: "40px" }} // Custom width
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onRemoveTopicFromLocalStorage(topic.topicId);
                                                }}
                                            >
                                                ❌
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </div>
    );
};

TopicList = styled(TopicList)`
    width: 100%;
    height: 100%;
`;

export { TopicList };
