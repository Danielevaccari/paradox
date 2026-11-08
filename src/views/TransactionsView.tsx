import { RefreshRounded, SendRounded } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, LinearProgress, MenuItem, Stack, TextField, Tooltip } from "@mui/material";
import { useState } from "react";
import { getTransactions, type Transaction } from "../api/mirrorNode";
import { useApp } from "../app/appContext";
import { preferences } from "../app/preferences";
import { EmptyState } from "../components/common/EmptyState";
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

    const controls = (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center", flex: { xs: "1 1 100%", md: "0 1 auto" } }}>
            <Stack direction="row" spacing={0.5} sx={{ flex: { xs: "1 1 100%", sm: "0 1 auto" } }}>
                <TextField
                    placeholder={effectiveId ?? "Account ID"}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && search()}
                    slotProps={{ htmlInput: { "aria-label": "Account ID" } }}
                    sx={{ flex: 1, minWidth: 0, width: { sm: 170 } }}
                />
                <Button variant="outlined" onClick={search} disabled={!input.trim()}>
                    Show
                </Button>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flex: { xs: "1 1 100%", sm: "0 1 auto" } }}>
                <TextField
                    select
                    value={type}
                    slotProps={{ select: { displayEmpty: true }, htmlInput: { "aria-label": "Transaction type" } }}
                    onChange={(event) => {
                        setType(event.target.value);
                        preferences.setTransactionType(event.target.value);
                    }}
                    sx={{ flex: 1, minWidth: 0, width: { sm: 200 } }}
                >
                    <MenuItem value="">All types</MenuItem>
                    {TRANSACTION_TYPES.map((value) => (
                        <MenuItem key={value} value={value} dense>
                            {formatTransactionType(value)}
                        </MenuItem>
                    ))}
                </TextField>
                <Tooltip title="Refresh">
                    <span>
                        <IconButton onClick={refresh} disabled={!key} aria-label="Refresh transactions">
                            <RefreshRounded fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        </Box>
    );

    return (
        <>
            <PageHeader
                title="Transactions"
                hint="Newest first, from the free mirror node"
                actions={
                    serverConfig?.features.transfer && (
                        <WriteButton variant="contained" startIcon={<SendRounded />} onClick={() => setSendOpen(true)}>
                            Send {HBAR_SYMBOL}
                        </WriteButton>
                    )
                }
            />

            <Box sx={{ height: 2, flexShrink: 0 }}>{loading && <LinearProgress sx={{ height: 2 }} />}</Box>

            {error && (
                <Alert severity="error" sx={{ m: 1.5 }}>
                    {error}
                </Alert>
            )}

            {!effectiveId ? (
                <>
                    <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex" }}>{controls}</Box>
                    <EmptyState title="Choose an account" description="Enter an account id to list its transactions." />
                </>
            ) : (
                <TransactionTable
                    transactions={transactions}
                    accountId={effectiveId}
                    network={network}
                    loading={loading}
                    onLoadMore={next ? loadMore : undefined}
                    loadingMore={loadingMore}
                    toolbarStart={controls}
                />
            )}

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
