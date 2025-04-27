import React, { useState, useMemo } from "react";
import { TopicId, TopicInfo } from "@hashgraph/sdk";
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
} from "@mui/material";
import { Hedera } from "../../Hedera/hedera";
import { Notifier } from "../../Notifications/notifications";
import styled from "styled-components";
import { formatDateToDDMMYYYY } from "../../Utility/date";

type Props = {
    className?: string;
    topics: Array<TopicInfo>;
    onSelectTopic: (topic: TopicInfo) => void;
    onDeleteTopic: (topicId: TopicId) => void;
    refreshTopicView: () => void;
    onRemoveTopicFromLocalStorage: (topicId: TopicId) => void;
};

let TopicList = ({ className, topics, onSelectTopic, onDeleteTopic, refreshTopicView, onRemoveTopicFromLocalStorage }: Props) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [updatingTopicId, setUpdatingTopicId] = React.useState<string | null>(null);

    const handleSelectTopic = React.useCallback(
        (topic: TopicInfo) => {
            onSelectTopic(topic);
        },
        [onSelectTopic],
    );

    const handleDeleteTopic = React.useCallback(
        (topicId: TopicId) => {
            onDeleteTopic(topicId);
        },
        [onDeleteTopic],
    );

    const handleUpdateTopicExpirationDate = React.useCallback(
        (topic: TopicInfo) => {
            const newExpirationTime = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from NOW max expiration

            Hedera.updateTopic({ topicId: topic.topicId, newExpirationTime: newExpirationTime })
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
        return topics.filter((topic) => topic.topicMemo?.toLowerCase().includes(searchTerm.toLowerCase()));
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
                                <TableCell>Msg amt</TableCell>
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
                                <TableCell>Network</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredTopics.map((topic) => (
                                <TableRow
                                    key={topic.topicId.toString()}
                                    hover
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => handleSelectTopic(topic)}
                                >
                                    <TableCell align="left" sx={{ width: 50 }}>
                                        <Typography variant="caption">{topic.topicId.toString()}</Typography>
                                    </TableCell>

                                    <TableCell align="left" width={150}>
                                        {topic.sequenceNumber?.toString() || "NaN"}
                                    </TableCell>

                                    <TableCell align="left">
                                        <Typography width={200} variant="body2">
                                            {topic.topicMemo ?? "Unnamed Topic"}
                                            {topic.topicMemo && topic.topicMemo.length > 50 ? "..." : ""}
                                        </Typography>
                                    </TableCell>

                                    <TableCell width={70}>{topic.ledgerId?.toString().toUpperCase()}</TableCell>

                                    <TableCell>{topic.expirationTime && formatDateToDDMMYYYY(topic.expirationTime.toDate())}</TableCell>

                                    <TableCell align="right">
                                        {topic.submitKey?.toString() === Hedera.getPrivateKey().publicKey.toString() && (
                                            <Tooltip title="Delete Topic">
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    disableRipple
                                                    sx={{ mr: 1 }}
                                                    variant="outlined"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeleteTopic(topic.topicId);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </Tooltip>
                                        )}

                                        {updatingTopicId === topic.topicId.toString() ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <Button
                                                size="small"
                                                disableRipple
                                                sx={{ mr: 1 }}
                                                color="info"
                                                variant="outlined"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setUpdatingTopicId(topic.topicId.toString());
                                                    handleUpdateTopicExpirationDate(topic);
                                                }}
                                            >
                                                Set Max Expiry
                                            </Button>
                                        )}

                                        <Tooltip title="Remove from Local Storage">
                                            <Button
                                                size="small"
                                                disableRipple
                                                color="secondary"
                                                variant="outlined"
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
