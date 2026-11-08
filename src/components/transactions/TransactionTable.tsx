import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { GridFooterContainer, GridPagination, type GridColDef, type GridFooterContainerProps } from "@mui/x-data-grid";
import { useMemo, useState, type ReactNode } from "react";
import type { HederaNetwork } from "../../../shared/api";
import type { Transaction } from "../../api/mirrorNode";
import { consensusToDate, formatHbar, formatTimestamp } from "../../utils/format";
import { formatTransactionType } from "../../utils/transactionTypes";
import { AppDataGrid, ROW_HEIGHT, ROW_HEIGHT_TWO_LINES } from "../common/AppDataGrid";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";

declare module "@mui/x-data-grid" {
    interface FooterPropsOverrides {
        onLoadMore?: () => void;
        loadingMore?: boolean;
    }
}

type Row = Transaction & { id: string; net: number };

const Footer = ({ onLoadMore, loadingMore, ...props }: GridFooterContainerProps & { onLoadMore?: () => void; loadingMore?: boolean }) => (
    <GridFooterContainer {...props} sx={{ pl: 1 }}>
        {onLoadMore ? (
            <Button onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load older"}
            </Button>
        ) : (
            <span />
        )}
        <GridPagination />
    </GridFooterContainer>
);

const StatusDot = ({ ok }: { ok: boolean }) => (
    <Box
        component="span"
        sx={{
            display: "inline-block",
            flexShrink: 0,
            width: 8,
            height: 8,
            borderRadius: "50%",
            mr: 1,
            bgcolor: ok ? "success.main" : "error.main",
        }}
    />
);

type Props = {
    transactions: Transaction[];
    accountId: string;
    network: HederaNetwork;
    loading: boolean;
    onLoadMore?: () => void;
    loadingMore: boolean;
    toolbarStart?: ReactNode;
};

export const TransactionTable = ({ transactions, accountId, network, loading, onLoadMore, loadingMore, toolbarStart }: Props) => {
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up("md"));
    const [selected, setSelected] = useState<Transaction | null>(null);

    const rows = useMemo<Row[]>(
        () =>
            transactions.map((tx) => ({
                ...tx,
                id: `${tx.transaction_id}-${tx.consensus_timestamp}`,
                net: tx.transfers.filter((t) => t.account === accountId).reduce((sum, t) => sum + t.amount, 0),
            })),
        [transactions, accountId],
    );

    const columns = useMemo<GridColDef<Row>[]>(
        () => [
            // Text columns on the left, numbers grouped on the right; widths are proportional.
            {
                field: "time",
                headerName: "Time",
                type: "dateTime",
                flex: 1.1,
                minWidth: 150,
                valueGetter: (_value, row) => consensusToDate(row.consensus_timestamp),
                renderCell: ({ row }) => formatTimestamp(row.consensus_timestamp, true),
                cellClassName: "secondary",
            },
            {
                field: "name",
                headerName: "Type",
                flex: 1.6,
                minWidth: 150,
                valueGetter: (value: string) => formatTransactionType(value),
                renderCell: ({ row, value }) => (
                    <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                        <StatusDot ok={row.result === "SUCCESS"} />
                        <Box sx={{ minWidth: 0, lineHeight: 1.3 }}>
                            <Typography variant="body2" noWrap>
                                {value}
                            </Typography>
                            {!wide && (
                                <Typography variant="caption" color="text.secondary" noWrap component="div">
                                    {formatTimestamp(row.consensus_timestamp, true)}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ),
            },
            {
                field: "entity_id",
                headerName: "Entity",
                flex: 0.9,
                minWidth: 110,
                valueGetter: (value: string | null) => value ?? "—",
            },
            {
                field: "net",
                headerName: "Amount",
                type: "number",
                flex: 0.9,
                minWidth: 110,
                renderCell: ({ value }) => (
                    <Box component="span" sx={{ color: value > 0 ? "success.main" : value < 0 ? "text.primary" : "text.secondary" }}>
                        {value > 0 ? "+" : ""}
                        {formatHbar(value)}
                    </Box>
                ),
            },
            {
                field: "charged_tx_fee",
                headerName: "Fee",
                type: "number",
                flex: 0.8,
                minWidth: 100,
                renderCell: ({ value }) => formatHbar(value, 6),
                cellClassName: "secondary",
            },
            { field: "transaction_id", headerName: "Transaction ID", width: 260 },
            { field: "result", headerName: "Result", width: 140 },
        ],
        [wide],
    );

    return (
        <>
            <AppDataGrid<Row>
                rows={rows}
                columns={columns}
                loading={loading && rows.length === 0}
                rowHeight={wide ? ROW_HEIGHT : ROW_HEIGHT_TWO_LINES}
                columnVisibilityModel={{ entity_id: wide, charged_tx_fee: wide, time: wide, transaction_id: false, result: false }}
                onRowClick={({ row }) => setSelected(row)}
                slots={{ footer: Footer }}
                slotProps={{ footer: { onLoadMore, loadingMore }, toolbar: { start: toolbarStart } }}
                localeText={{ noRowsLabel: "No transactions for this account and type" }}
            />
            <TransactionDetailsDialog transaction={selected} accountId={accountId} network={network} onClose={() => setSelected(null)} />
        </>
    );
};
