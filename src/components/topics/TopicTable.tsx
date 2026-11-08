import { CloseRounded, DeleteOutlineRounded, ErrorOutlineRounded, LockOutlined, ShieldOutlined, UpdateRounded } from "@mui/icons-material";
import { Chip, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { useMemo, type ReactNode } from "react";
import type { Topic } from "../../api/mirrorNode";
import { useApp } from "../../app/appContext";
import { consensusToDate, formatTimestamp } from "../../utils/format";
import { AppDataGrid } from "../common/AppDataGrid";
import { isOperatorKey } from "./topicKeys";

export type TopicRow = { id: string; topic?: Topic; error?: string };

type Props = {
    rows: TopicRow[];
    loading: boolean;
    busyTopicId: string | null;
    onOpen: (row: TopicRow) => void;
    onExtend: (topicId: string) => void;
    onDelete: (topicId: string) => void;
    onRemove: (topicId: string) => void;
    toolbarStart?: ReactNode;
};

export const TopicTable = ({ rows, loading, busyTopicId, onOpen, onExtend, onDelete, onRemove, toolbarStart }: Props) => {
    const { serverConfig, canWrite } = useApp();
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up("md"));

    const columns = useMemo<GridColDef<TopicRow>[]>(
        () => [
            {
                field: "id",
                headerName: "Topic ID",
                flex: 0.8,
                minWidth: 110,
                renderCell: ({ row }) => (
                    <Typography variant="body2" sx={{ textDecoration: row.topic?.deleted ? "line-through" : "none" }}>
                        {row.id}
                    </Typography>
                ),
            },
            {
                field: "memo",
                headerName: "Memo",
                flex: 2,
                minWidth: 100,
                valueGetter: (_value, row) => row.topic?.memo ?? "",
                renderCell: ({ row }) => (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
                        {row.error ? (
                            <Tooltip title={row.error}>
                                <Chip size="small" color="error" variant="outlined" icon={<ErrorOutlineRounded />} label="Unavailable" />
                            </Tooltip>
                        ) : (
                            <Typography variant="body2" noWrap color={row.topic?.memo ? "text.primary" : "text.secondary"}>
                                {row.topic?.memo || "Unnamed topic"}
                            </Typography>
                        )}
                        {row.topic?.deleted && (
                            <Chip size="small" color="error" label="Deleted" sx={{ display: { xs: "none", sm: "inline-flex" } }} />
                        )}
                        {row.topic?.submit_key && (
                            <Tooltip title="Private: needs a submit key">
                                <LockOutlined fontSize="small" color="action" />
                            </Tooltip>
                        )}
                        {row.topic?.admin_key && !row.topic.deleted && (
                            <Tooltip title="Has an admin key">
                                <ShieldOutlined fontSize="small" color="action" sx={{ display: { xs: "none", sm: "block" } }} />
                            </Tooltip>
                        )}
                    </Stack>
                ),
            },
            {
                field: "created",
                headerName: "Created",
                type: "dateTime",
                flex: 1,
                minWidth: 150,
                valueGetter: (_value, row) => consensusToDate(row.topic?.created_timestamp),
                renderCell: ({ row }) => formatTimestamp(row.topic?.created_timestamp),
                cellClassName: "secondary",
            },
            {
                field: "actions",
                type: "actions",
                align: "right",
                headerAlign: "right",
                width: 72,
                getActions: ({ row }) => {
                    const isAdmin = canWrite && !row.topic?.deleted && isOperatorKey(row.topic?.admin_key, serverConfig?.publicKey);
                    const busy = busyTopicId === row.id;
                    const remove = (
                        <GridActionsCellItem
                            key="remove"
                            icon={<CloseRounded fontSize="small" />}
                            label="Remove from this list"
                            showInMenu
                            onClick={() => onRemove(row.id)}
                        />
                    );
                    if (!isAdmin) {
                        return [remove];
                    }
                    return [
                        <GridActionsCellItem
                            key="renew"
                            icon={<UpdateRounded fontSize="small" />}
                            label="Renew: expire 90 days from now"
                            showInMenu
                            disabled={busy}
                            onClick={() => onExtend(row.id)}
                        />,
                        <GridActionsCellItem
                            key="delete"
                            icon={<DeleteOutlineRounded fontSize="small" color={busy ? "disabled" : "error"} />}
                            label="Delete topic on Hedera"
                            disabled={busy}
                            onClick={() => onDelete(row.id)}
                        />,
                        remove,
                    ];
                },
            },
        ],
        [canWrite, serverConfig?.publicKey, busyTopicId, onExtend, onDelete, onRemove],
    );

    return (
        <AppDataGrid<TopicRow>
            rows={rows}
            columns={columns}
            loading={loading && rows.length === 0}
            columnVisibilityModel={{ created: wide }}
            initialState={{ sorting: { sortModel: [{ field: "created", sort: "desc" }] } }}
            onRowClick={({ row }) => onOpen(row)}
            slotProps={{ toolbar: { start: toolbarStart } }}
            localeText={{ noRowsLabel: "No topics" }}
            sx={{ "& .secondary": { color: "text.secondary" } }}
        />
    );
};
