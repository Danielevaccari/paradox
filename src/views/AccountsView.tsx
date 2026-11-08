import { AccountCircleOutlined, SearchRounded } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";
import { getAccount } from "../api/mirrorNode";
import { useApp } from "../app/appContext";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { formatHbar, formatTimestamp, isEntityId } from "../utils/format";
import { notify } from "../utils/notify";
import { useAsyncData } from "../utils/useAsyncData";

const Field = ({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) => (
    <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
        </Typography>
        <Typography variant="body1" className={mono ? "mono" : undefined} sx={{ wordBreak: "break-all" }}>
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
            <PageHeader title="Accounts" subtitle="Look up any Hedera account on the mirror node." />

            <Card sx={{ mb: 1, flexShrink: 0 }}>
                <Stack direction="row" spacing={1} sx={{ p: 1 }}>
                    <TextField
                        fullWidth
                        label="Account ID"
                        placeholder={effectiveId ?? "0.0.12345"}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && search()}
                        sx={{ maxWidth: 320 }}
                    />
                    <Button variant="contained" startIcon={<SearchRounded />} onClick={search} disabled={!input.trim()}>
                        Search
                    </Button>
                </Stack>
                <Box sx={{ height: 2 }}>{loading && <LinearProgress sx={{ height: 2 }} />}</Box>
            </Card>

            {error && <Alert severity="error">{error}</Alert>}

            {!effectiveId && !loading && (
                <Card>
                    <EmptyState
                        icon={<AccountCircleOutlined />}
                        title="Search for an account"
                        description="Enter an account id to see its balance and staking details."
                    />
                </Card>
            )}

            {account && (
                <Card>
                    <CardContent>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2, flexWrap: "wrap" }}>
                            <Typography variant="h2" className="mono">
                                {account.account}
                            </Typography>
                            {account.account === serverConfig?.accountId && serverConfig.network === network && (
                                <Chip size="small" color="primary" variant="outlined" label="App account" />
                            )}
                            {account.deleted && <Chip size="small" color="error" label="Deleted" />}
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Field label="Balance">{formatHbar(account.balance?.balance)}</Field>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Field label="Memo">{account.memo || "—"}</Field>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Field label="Staked to">
                                    {account.staked_node_id !== null
                                        ? `Node ${account.staked_node_id}`
                                        : (account.staked_account_id ?? "Not staking")}
                                </Field>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Field label="Pending reward">{formatHbar(account.pending_reward)}</Field>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Field label="Created">{formatTimestamp(account.created_timestamp)}</Field>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Field label="Expires">{formatTimestamp(account.expiry_timestamp)}</Field>
                            </Grid>
                            {account.evm_address && (
                                <Grid size={12}>
                                    <Field label="EVM address" mono>
                                        {account.evm_address}
                                    </Field>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </>
    );
};
