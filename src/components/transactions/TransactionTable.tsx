import { KeyboardArrowDownRounded, KeyboardArrowUpRounded } from "@mui/icons-material";
import {
    Box,
    Collapse,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import type { Transaction } from "../../api/mirrorNode";
import { formatHbar, formatTimestamp } from "../../utils/format";
import { formatTransactionType } from "../../utils/transactionTypes";

const hideOnMobile = { display: { xs: "none", md: "table-cell" } } as const;
const wideOnly = { display: { xs: "none", lg: "table-cell" } } as const;

const TransactionRow = ({ transaction, accountId }: { transaction: Transaction; accountId: string }) => {
    const [open, setOpen] = useState(false);
    const ok = transaction.result === "SUCCESS";
    const net = transaction.transfers.filter((t) => t.account === accountId).reduce((sum, t) => sum + t.amount, 0);

    return (
        <Fragment>
            <TableRow
                hover
                onClick={() => setOpen(!open)}
                sx={{ cursor: "pointer", "& > td": { borderBottom: open ? "none" : undefined } }}
            >
                <TableCell padding="checkbox" sx={{ pl: { xs: 0.5, md: 1 }, pr: 0 }}>
                    <IconButton size="small" aria-label={open ? "Hide transfers" : "Show transfers"}>
                        {open ? <KeyboardArrowUpRounded fontSize="small" /> : <KeyboardArrowDownRounded fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ whiteSpace: { xs: "normal", md: "nowrap" }, pr: { xs: 0.5, md: 2 } }}>
                    <Tooltip title={transaction.result}>
                        <Box
                            component="span"
                            sx={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                mr: 1,
                                bgcolor: ok ? "success.main" : "error.main",
                            }}
                        />
                    </Tooltip>
                    <Typography component="span" variant="body2" sx={{ fontSize: { xs: 12, md: 14 } }}>
                        {formatTransactionType(transaction.name)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" className="mono" sx={{ display: { xs: "block", md: "none" } }}>
                        {formatTimestamp(transaction.consensus_timestamp, true)}
                    </Typography>
                </TableCell>
                <TableCell
                    align="right"
                    sx={{
                        whiteSpace: "nowrap",
                        pl: { xs: 0.5, md: 2 },
                        fontSize: { xs: 12, md: 14 },
                        color: net > 0 ? "success.main" : net < 0 ? "text.primary" : "text.secondary",
                    }}
                >
                    {net > 0 ? "+" : ""}
                    {formatHbar(net)}
                </TableCell>
                <TableCell sx={{ ...wideOnly, whiteSpace: "nowrap" }} className="mono">
                    {transaction.entity_id ?? "—"}
                </TableCell>
                <TableCell align="right" sx={{ ...wideOnly, whiteSpace: "nowrap", color: "text.secondary" }}>
                    {formatHbar(transaction.charged_tx_fee, 6)}
                </TableCell>
                <TableCell sx={{ ...hideOnMobile, whiteSpace: "nowrap", color: "text.secondary" }}>
                    {formatTimestamp(transaction.consensus_timestamp, true)}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={6} sx={{ py: 0, ...(open ? {} : { borderBottom: "none" }) }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 1.5, pl: { xs: 1, md: 7 }, pr: 1 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                className="mono"
                                sx={{ display: "block", mb: 1, wordBreak: "break-all" }}
                            >
                                {transaction.transaction_id}
                                {transaction.node ? ` · node ${transaction.node}` : ""}
                            </Typography>
                            {transaction.transfers.map((transfer, index) => (
                                <Box
                                    key={`${transfer.account}-${index}`}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        maxWidth: 420,
                                        py: 0.25,
                                        fontWeight: transfer.account === accountId ? 600 : 400,
                                    }}
                                >
                                    <Typography variant="body2" className="mono" sx={{ fontWeight: "inherit" }}>
                                        {transfer.account}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: "inherit" }}>
                                        {formatHbar(transfer.amount, 8)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
};

export const TransactionTable = ({ transactions, accountId }: { transactions: Transaction[]; accountId: string }) => (
    <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell sx={wideOnly}>Entity</TableCell>
                    <TableCell align="right" sx={wideOnly}>
                        Fee
                    </TableCell>
                    <TableCell sx={hideOnMobile}>Time</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {transactions.map((transaction) => (
                    <TransactionRow
                        key={`${transaction.transaction_id}-${transaction.consensus_timestamp}`}
                        transaction={transaction}
                        accountId={accountId}
                    />
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);
