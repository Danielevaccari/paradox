import { ReceiptLongOutlined, RefreshRounded, SendRounded } from "@mui/icons-material";
import { Alert, Box, Button, Card, IconButton, LinearProgress, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { getTransactions, type Transaction } from "../api/mirrorNode";
import { useApp } from "../app/appContext";
import { preferences } from "../app/preferences";
import { EmptyState } from "../components/common/EmptyState";
import { fillCardSx } from "../components/common/layoutSx";
import { PageHeader } from "../components/common/PageHeader";
import { WriteButton } from "../components/common/WriteButton";
import { SendHbarDialog } from "../components/transactions/SendHbarDialog";
import { TransactionTable } from "../components/transactions/TransactionTable";
import { HBAR_SYMBOL, isEntityId } from "../utils/format";
import { notify } from "../utils/notify";
import { formatTransactionType, TRANSACTION_TYPES } from "../utils/transactionTypes";
import { useAsyncData } from "../utils/useAsyncData";

type MorePages = { key: string; transactions: Transaction[]; next: string | null };

export const TransactionsView = () => {
    const { network, serverConfig } = useApp();
    const [input, setInput] = useState("");
    const [accountId, setAccountId] = useState<string | null>(null);
    const [type, setType] = useState(() => preferences.getTransactionType());
    const [more, setMore] = useState<MorePages | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sendOpen, setSendOpen] = useState(false);

    const serverAccount = serverConfig?.network === network ? serverConfig.accountId : null;
    const effectiveId = accountId ?? serverAccount;
    const key = effectiveId ? `${network}:${effectiveId}:${type}` : null;

    const {
        data: firstPage,
        error,
        loading,
        reload,
    } = useAsyncData(key, (signal) => getTransactions(network, { accountId: effectiveId as string, type }, signal));

    const extra = more?.key === key ? more : null;
    const transactions = [...(firstPage?.transactions ?? []), ...(extra?.transactions ?? [])];
    const next = extra ? extra.next : (firstPage?.next ?? null);

    const loadMore = async () => {
        if (!next || !key) {
            return;
        }
        setLoadingMore(true);
        try {
            const page = await getTransactions(network, { accountId: effectiveId as string, next });
            setMore({ key, transactions: [...(extra?.transactions ?? []), ...page.transactions], next: page.next });
        } catch (err) {
            notify.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const refresh = () => {
        setMore(null);
        reload();
    };

    const search = () => {
        const id = input.trim();
        if (!isEntityId(id)) {
            notify.warning("Use an account id like 0.0.12345");
            return;
        }
        setAccountId(id);
    };

    return (
        <>
            <PageHeader
                title="Transactions"
                subtitle="Recent transactions of an account, newest first."
                actions={
                    serverConfig?.features.transfer && (
                        <WriteButton variant="contained" startIcon={<SendRounded />} onClick={() => setSendOpen(true)}>
                            Send {HBAR_SYMBOL}
                        </WriteButton>
                    )
                }
            />

            <Card sx={fillCardSx}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, p: 1, flexShrink: 0, alignItems: "center" }}>
                    <Stack direction="row" spacing={1} sx={{ flex: { xs: "1 1 100%", sm: "0 1 340px" } }}>
                        <TextField
                            fullWidth
                            label="Account ID"
                            placeholder={effectiveId ?? "0.0.12345"}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={(event) => event.key === "Enter" && search()}
                            sx={{ maxWidth: { sm: 260 } }}
                        />
                        <Button variant="outlined" onClick={search} disabled={!input.trim()}>
                            Show
                        </Button>
                    </Stack>
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: "center", flex: { xs: "1 1 100%", sm: "0 1 320px" }, ml: { sm: "auto" } }}
                    >
                        <TextField
                            select
                            fullWidth
                            label="Type"
                            value={type}
                            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                            onChange={(event) => {
                                setType(event.target.value);
                                preferences.setTransactionType(event.target.value);
                            }}
                            sx={{ minWidth: { sm: 240 } }}
                        >
                            <MenuItem value="">All types</MenuItem>
                            {TRANSACTION_TYPES.map((value) => (
                                <MenuItem key={value} value={value}>
                                    {formatTransactionType(value)}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Tooltip title="Refresh">
                            <span>
                                <IconButton onClick={refresh} disabled={!key} aria-label="Refresh transactions">
                                    <RefreshRounded />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>

                <Box sx={{ height: 2, flexShrink: 0 }}>{loading && <LinearProgress sx={{ height: 2 }} />}</Box>

                {error && (
                    <Alert severity="error" sx={{ m: 2 }}>
                        {error}
                    </Alert>
                )}

                {!effectiveId ? (
                    <EmptyState
                        icon={<ReceiptLongOutlined />}
                        title="Choose an account"
                        description="Enter an account id to list its transactions."
                    />
                ) : firstPage && transactions.length === 0 ? (
                    <EmptyState
                        icon={<ReceiptLongOutlined />}
                        title="No transactions"
                        description="Nothing found for this account and type."
                    />
                ) : (
                    transactions.length > 0 && (
                        <>
                            <TransactionTable transactions={transactions} accountId={effectiveId} />
                            <Stack
                                direction="row"
                                sx={{
                                    px: 1.5,
                                    py: 0.5,
                                    flexShrink: 0,
                                    borderTop: 1,
                                    borderColor: "divider",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    {transactions.length} transactions
                                </Typography>
                                {next && (
                                    <Button onClick={loadMore} disabled={loadingMore}>
                                        {loadingMore ? "Loading…" : "Load more"}
                                    </Button>
                                )}
                            </Stack>
                        </>
                    )
                )}
            </Card>

            {serverConfig?.accountId && (
                <SendHbarDialog
                    open={sendOpen}
                    fromAccountId={serverConfig.accountId}
                    onClose={() => setSendOpen(false)}
                    onSent={() => {
                        setSendOpen(false);
                        setTimeout(refresh, 4000);
                    }}
                />
            )}
        </>
    );
};
