import { LockOutlined } from "@mui/icons-material";
import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMemo, type ReactNode } from "react";
import type { TopicSummary } from "../../api/mirrorNode";
import { consensusToDate, formatDate, formatRelative, formatTimestamp } from "../../utils/format";
import { AppDataGrid, ROW_HEIGHT_TWO_LINES } from "../common/AppDataGrid";

export type TopicRow = { id: string; summary?: TopicSummary; error?: string };

/** wide: list alone on a desktop; split: list beside the detail pane; narrow: phone. */
export type ListLayout = "wide" | "split" | "narrow";

type Props = {
    rows: TopicRow[];
    loading: boolean;
    selectedId: string | null;
    layout: ListLayout;
    onSelect: (id: string) => void;
    toolbarStart: ReactNode;
};

const access = (row: TopicRow) => {
    const topic = row.summary?.topic;
    return topic?.deleted ? "Deleted" : topic?.submit_key ? "Private" : "Public";
};

export const TopicList = ({ rows, loading, selectedId, layout, onSelect, toolbarStart }: Props) => {
    const columns = useMemo<GridColDef<TopicRow>[]>(
        () => [
            {
                field: "topic",
                headerName: "Topic",
                flex: 3,
                minWidth: 170,
                // Used for sorting and search: memo first, then the id.
                valueGetter: (_value, row) => `${row.summary?.topic.memo ?? ""} ${row.id}`,
                renderCell: ({ row }) => {
                    const topic = row.summary?.topic;
                    const secondary =
                        layout === "wide"
                            ? `Created ${formatDate(topic?.created_timestamp)}`
                            : row.summary?.lastMessageAt
                              ? formatRelative(row.summary.lastMessageAt)
                              : "No messages yet";
                    return (
                        <Box sx={{ minWidth: 0, lineHeight: 1.4 }}>
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
                                <Typography
                                    variant="body1"
                                    noWrap
                                    sx={{ fontWeight: 600, textDecoration: topic?.deleted ? "line-through" : "none" }}
                                    color={row.error ? "error" : "text.primary"}
                                >
                                    {row.error ? "Unavailable" : topic?.memo || "Unnamed topic"}
                                </Typography>
                                {topic?.deleted && <Chip size="small" color="error" label="Deleted" />}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" noWrap component="div">
                                {row.error ? row.error : `${row.id} · ${secondary}`}
                            </Typography>
                        </Box>
                    );
                },
            },
            {
                field: "access",
                headerName: "Access",
                width: 110,
                valueGetter: (_value, row) => access(row),
                renderCell: ({ row, value }) => (
                    <Tooltip title={row.summary?.topic.submit_key ? "Only accounts with the submit key can post" : "Anyone can post"}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }} className="secondary">
                            {value === "Private" && <LockOutlined sx={{ fontSize: 16 }} />}
                            <span>{value}</span>
                        </Stack>
                    </Tooltip>
                ),
            },
            {
                field: "messages",
                headerName: layout === "wide" ? "Messages" : "Msgs",
                type: "number",
                width: layout === "wide" ? 110 : 76,
                headerAlign: "right",
                align: "right",
                valueGetter: (_value, row) => row.summary?.messageCount ?? 0,
            },
            {
                field: "last",
                headerName: "Last message",
                type: "dateTime",
                width: 150,
                valueGetter: (_value, row) => consensusToDate(row.summary?.lastMessageAt),
                renderCell: ({ row }) => (
                    <Tooltip title={formatTimestamp(row.summary?.lastMessageAt, true)}>
                        <span className="secondary">{row.summary?.lastMessageAt ? formatRelative(row.summary.lastMessageAt) : "—"}</span>
                    </Tooltip>
                ),
            },
        ],
        [layout],
    );

    return (
        <AppDataGrid<TopicRow>
            rows={rows}
            columns={columns}
            loading={loading && rows.length === 0}
            rowHeight={ROW_HEIGHT_TWO_LINES}
            columnVisibilityModel={{ access: layout === "wide", last: layout === "wide", messages: true }}
            initialState={{ sorting: { sortModel: [{ field: "last", sort: "desc" }] } }}
            onRowClick={({ row }) => onSelect(row.id)}
            getRowClassName={({ row }) => (row.id === selectedId ? "is-selected" : "")}
            slotProps={{ toolbar: { start: toolbarStart, minimal: layout === "split" } }}
            localeText={{ noRowsLabel: "No topics" }}
        />
    );
};
