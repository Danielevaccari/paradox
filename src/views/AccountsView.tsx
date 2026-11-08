import { SearchRounded } from "@mui/icons-material";
import { Alert, Box, Button, Chip, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";
import { getAccount } from "../api/mirrorNode";
import { useApp } from "../app/appContext";
import { EmptyState } from "../components/common/EmptyState";
import { pageBodySx } from "../components/common/layout";
import { PageHeader } from "../components/common/PageHeader";
import { formatHbar, formatTimestamp, isEntityId } from "../utils/format";
import { notify } from "../utils/notify";
import { useAsyncData } from "../utils/useAsyncData";

const Field = ({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" component="div">
            {label}
        </Typography>
        <Typography variant="body1" className={mono ? "mono" : undefined} sx={{ fontWeight: 600, wordBreak: "break-all" }}>
            {children}
        </Typography>
    </Box>
);

export const AccountsView = () => {
    const { network, serverConfig } = useApp();
    const [input, setInput] = useState("");
    const [accountId, setAccountId] = useState<string | null>(null);
    // Default to the server's account once the config has loaded.
    const effectiveId = accountId ?? (serverConfig?.network === network ? serverConfig.accountId : null);

    const {
        data: account,
        error,
        loading,
    } = useAsyncData(effectiveId ? `${network}:${effectiveId}` : null, (signal) => getAccount(network, effectiveId as string, signal));

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
            <PageHeader title="Accounts" hint="Any account, from the free mirror node" />
            <Stack
                direction="row"
                spacing={1}
                sx={{ px: { xs: 1.5, sm: 2 }, py: 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
            >
                <TextField
                    placeholder={effectiveId ?? "Account ID, e.g. 0.0.12345"}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && search()}
                    slotProps={{ htmlInput: { "aria-label": "Account ID" } }}
                    sx={{ flex: 1, maxWidth: 360 }}
                />
                <Button variant="contained" startIcon={<SearchRounded />} onClick={search} disabled={!input.trim()}>
                    Search
                </Button>
            </Stack>
            <Box sx={{ height: 2, flexShrink: 0 }}>{loading && <LinearProgress sx={{ height: 2 }} />}</Box>

            <Box sx={pageBodySx}>
                {error && <Alert severity="error">{error}</Alert>}

                {!effectiveId && !loading && (
                    <EmptyState title="Search for an account" description="Enter an account id to see its balance and staking details." />
                )}

                {account && (
                    <>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2, flexWrap: "wrap" }}>
                            <Typography variant="h2" className="mono">
                                {account.account}
                            </Typography>
                            {account.account === serverConfig?.accountId && serverConfig.network === network && (
                                <Chip size="small" color="primary" variant="outlined" label="App account" />
                            )}
                            {account.deleted && <Chip size="small" color="error" label="Deleted" />}
                        </Stack>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
                            <Field label="Balance">{formatHbar(account.balance?.balance)}</Field>
                            <Field label="Memo">{account.memo || "—"}</Field>
                            <Field label="Staked to">
                                {account.staked_node_id !== null
                                    ? `Node ${account.staked_node_id}`
                                    : (account.staked_account_id ?? "Not staking")}
                            </Field>
                            <Field label="Pending reward">{formatHbar(account.pending_reward)}</Field>
                            <Field label="Created">{formatTimestamp(account.created_timestamp)}</Field>
                            <Field label="Expires">{formatTimestamp(account.expiry_timestamp)}</Field>
                            {account.evm_address && (
                                <Box sx={{ gridColumn: "1 / -1" }}>
                                    <Field label="EVM address" mono>
                                        {account.evm_address}
                                    </Field>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </>
    );
};
