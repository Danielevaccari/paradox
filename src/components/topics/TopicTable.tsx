import { CloseRounded, DeleteOutlineRounded, ErrorOutlineRounded, LockOutlined, ShieldOutlined, UpdateRounded } from "@mui/icons-material";
import {
    Box,
    Chip,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { useState } from "react";
import type { Topic } from "../../api/mirrorNode";
import { useApp } from "../../app/appContext";
import { formatTimestamp } from "../../utils/format";
import { isOperatorKey } from "./topicKeys";

export type TopicRow = { id: string; topic?: Topic; error?: string };

type Props = {
    rows: TopicRow[];
    busyTopicId: string | null;
    onOpen: (row: TopicRow) => void;
    onExtend: (topicId: string) => void;
    onDelete: (topicId: string) => void;
    onRemove: (topicId: string) => void;
};

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];

export const TopicTable = ({ rows, busyTopicId, onOpen, onExtend, onDelete, onRemove }: Props) => {
    const { serverConfig, canWrite } = useApp();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
    const currentPage = Math.min(page, lastPage);
    const visible = rows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

    return (
        <>
            <TableContainer>
                <Table size="small" sx={{ "& td, & th": { px: { xs: 1, sm: 2 } } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Topic ID</TableCell>
                            <TableCell>Memo</TableCell>
                            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Created</TableCell>
                            <TableCell align="right">
                                <Box component="span" sx={visuallyHidden}>
                                    Actions
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visible.map((row) => {
                            const { topic } = row;
                            const isAdmin = canWrite && !topic?.deleted && isOperatorKey(topic?.admin_key, serverConfig?.publicKey);
                            const busy = busyTopicId === row.id;

                            return (
                                <TableRow
                                    key={row.id}
                                    hover
                                    onClick={() => onOpen(row)}
                                    sx={{ cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                                >
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                                        <Typography
                                            variant="body2"
                                            className="mono"
                                            sx={{ textDecoration: topic?.deleted ? "line-through" : "none" }}
                                        >
                                            {row.id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: { xs: 96, sm: 360 } }}>
                                        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
                                            {row.error ? (
                                                <Tooltip title={row.error}>
                                                    <Chip
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        icon={<ErrorOutlineRounded />}
                                                        label="Unavailable"
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="body2" noWrap color={topic?.memo ? "text.primary" : "text.secondary"}>
                                                    {topic?.memo || "Unnamed topic"}
                                                </Typography>
                                            )}
                                            {topic?.deleted && <Chip size="small" color="error" label="Deleted" />}
                                            {topic?.submit_key && (
                                                <Tooltip title="Private: needs a submit key">
                                                    <LockOutlined fontSize="small" color="action" />
                                                </Tooltip>
                                            )}
                                            {topic?.admin_key && !topic.deleted && (
                                                <Tooltip title="Has an admin key">
                                                    <ShieldOutlined
                                                        fontSize="small"
                                                        color="action"
                                                        sx={{ display: { xs: "none", sm: "block" } }}
                                                    />
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell
                                        sx={{ display: { xs: "none", md: "table-cell" }, whiteSpace: "nowrap", color: "text.secondary" }}
                                    >
                                        {formatTimestamp(topic?.created_timestamp)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }} onClick={(event) => event.stopPropagation()}>
                                        {isAdmin && (
                                            <>
                                                <Tooltip title="Renew: expire 90 days from now">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={busy}
                                                            onClick={() => onExtend(row.id)}
                                                            aria-label="Renew topic"
                                                        >
                                                            <UpdateRounded fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Delete topic on Hedera">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            disabled={busy}
                                                            onClick={() => onDelete(row.id)}
                                                            aria-label="Delete topic"
                                                        >
                                                            <DeleteOutlineRounded fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Tooltip title="Remove from this list">
                                            <IconButton size="small" onClick={() => onRemove(row.id)} aria-label="Remove from list">
                                                <CloseRounded fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {rows.length > ROWS_PER_PAGE_OPTIONS[0] && (
                <TablePagination
                    component="div"
                    count={rows.length}
                    page={currentPage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    onPageChange={(_event, next) => setPage(next)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(Number(event.target.value));
                        setPage(0);
                    }}
                />
            )}
        </>
    );
};

const visuallyHidden = {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
} as const;
