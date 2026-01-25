import React, { useState, useMemo, useEffect } from "react";
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
    TablePagination,
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
    const [updatingTopicId, setUpdatingTopicId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    useEffect(() => {
        setPage(0);
    }, [searchTerm]);

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
            const newExpirationTime = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
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
                                <TableCell>Topic Id</TableCell>
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
                                <TableCell>Created at</TableCell>
                                <TableCell align="right"> </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredTopics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((topic) => (
                                <TableRow
                                    hover
                                    key={topic.topicId}
                                    sx={{ cursor: "pointer", height: "28px" }}
                                    onClick={() => handleSelectTopic(topic)}
                                >
                                    <TableCell align="left" sx={{ py: "2px", px: "6px" }}>
                                        <Tooltip title={topic.deleted ? "Deleted Topic" : ""}>
                                            <Typography variant="caption" color={topic.deleted ? "crimson" : ""}>
                                                {topic.topicId}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell align="left" sx={{ py: "2px", px: "6px" }}>
                                        <Typography variant="caption" color={topic.deleted ? "crimson" : ""}>
                                            {topic.memo === "" ? "Unnamed Topic" : topic.memo}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="left" sx={{ py: "2px", px: "6px" }}>
                                        <Typography variant="caption" color={topic.deleted ? "crimson" : ""}>
                                            {new Date(Number(topic.created_timestamp) * 1000).toLocaleString()}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="right" sx={{ py: "2px", px: "4px" }}>
                                        {topic.deleted === false &&
                                            topic.adminKey?.key === Hedera.getPrivateKey()?.publicKey.toStringRaw() && (
                                                <Tooltip title="Delete Topic">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ p: "2px", m: "0" }}
                                                        color="error"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteTopic(topic.topicId);
                                                        }}
                                                    >
                                                        <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                        {updatingTopicId === topic.topicId ? (
                                            <CircularProgress size={18} sx={{ mx: 0.5 }} />
                                        ) : (
                                            <Tooltip title="Update Expiration">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    sx={{ p: "2px", m: "0" }}
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
                                                sx={{
                                                    m: "0",
                                                    p: "0 4px",
                                                    minWidth: "32px",
                                                    fontSize: "0.65rem",
                                                }}
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

                    <TablePagination
                        page={page}
                        component="div"
                        rowsPerPage={rowsPerPage}
                        count={filteredTopics.length}
                        rowsPerPageOptions={[25, 50]}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
            </Box>
        </div>
    );
};

TopicList = styled(TopicList)`
    width: 100%;
    height: 100%;

    .MuiTableCell-root {
        padding: 2px 6px;
    }

    .MuiTableRow-root {
        height: 28px;
    }

    .MuiIconButton-root {
        padding: 2px;
    }
`;

export { TopicList };
