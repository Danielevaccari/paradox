import { OpenInNewRounded } from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import type { ReactNode } from "react";
import type { HederaNetwork } from "../../../shared/api";
import type { Transaction } from "../../api/mirrorNode";
import { decodeBase64Utf8, formatHbar, formatTimestamp } from "../../utils/format";
import { formatTransactionType } from "../../utils/transactionTypes";

const Row = ({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) => (
    <Stack direction="row" spacing={2} sx={{ py: 0.5, justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            {label}
        </Typography>
        <Typography variant="body2" className={mono ? "mono" : undefined} sx={{ textAlign: "right", wordBreak: "break-all" }}>
            {children}
        </Typography>
    </Stack>
);

type Props = {
    transaction: Transaction | null;
    accountId: string;
    network: HederaNetwork;
    onClose: () => void;
};

export const TransactionDetailsDialog = ({ transaction: tx, accountId, network, onClose }: Props) => {
    const theme = useTheme();
    const compact = useMediaQuery(theme.breakpoints.down("sm"));
    const memo = tx?.memo_base64 ? decodeBase64Utf8(tx.memo_base64) : "";

    return (
        <Dialog open={tx !== null} onClose={onClose} maxWidth="sm" fullScreen={compact}>
            {tx && (
                <>
                    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>{formatTransactionType(tx.name)}</Box>
                        <Chip size="small" color={tx.result === "SUCCESS" ? "success" : "error"} label={tx.result} />
                    </DialogTitle>
                    <DialogContent dividers>
                        <Row label="Transaction ID" mono>
                            {tx.transaction_id}
                        </Row>
                        <Row label="Time">{formatTimestamp(tx.consensus_timestamp, true)}</Row>
                        {tx.entity_id && (
                            <Row label="Entity" mono>
                                {tx.entity_id}
                            </Row>
                        )}
                        <Row label="Fee">{formatHbar(tx.charged_tx_fee, 8)}</Row>
                        {tx.node && (
                            <Row label="Node" mono>
                                {tx.node}
                            </Row>
                        )}
                        {memo && <Row label="Memo">{memo}</Row>}

                        <Divider sx={{ my: 1 }} />
                        <Typography variant="overline" color="text.secondary">
                            Transfers
                        </Typography>
                        {tx.transfers.map((transfer, index) => (
                            <Stack
                                key={`${transfer.account}-${index}`}
                                direction="row"
                                sx={{ justifyContent: "space-between", py: 0.25, fontWeight: transfer.account === accountId ? 600 : 400 }}
                            >
                                <Typography variant="body2" className="mono" sx={{ fontWeight: "inherit" }}>
                                    {transfer.account}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "inherit", color: transfer.amount > 0 ? "success.main" : "text.primary" }}
                                >
                                    {formatHbar(transfer.amount, 8)}
                                </Typography>
                            </Stack>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            href={`https://hashscan.io/${network}/transaction/${tx.consensus_timestamp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            endIcon={<OpenInNewRounded fontSize="small" />}
                            sx={{ mr: "auto" }}
                        >
                            View on HashScan
                        </Button>
                        <Button onClick={onClose}>Close</Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};
