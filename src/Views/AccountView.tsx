import * as React from "react";
import { Typography, Paper, Grid, TextField, Button, Divider, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Hedera } from "../Hedera/hedera";
import { AccountId, AccountInfo } from "@hiero-ledger/sdk";
import { Notifier } from "../Notifications/notifications";
import { formatConsensusTime } from "../Utility/date";

type Props = { className?: string };

const AccountViewBase = ({ className }: Props) => {
    const [loading, setLoading] = React.useState(false);
    const [accounts, setAccounts] = React.useState<Array<AccountInfo>>([]);
    const [accountIdInput, setAccountIdInput] = React.useState(Hedera.getAccountId());
    const [selectedAccountId, setSelectedAccountId] = React.useState<AccountId | null>(null);

    const fetchAccountInfo = React.useCallback(async (accountId: AccountId) => {
        try {
            setLoading(true);
            const accountInfo = await Hedera.getAccountInfo(accountId);
            setAccounts([accountInfo]);
        } catch (error) {
            Notifier.showError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAccountIdChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setAccountIdInput(event.target.value);
    }, []);

    const handleSearchAccount = React.useCallback(() => {
        if (!accountIdInput) {
            Notifier.showWarning("Please enter a valid account ID.");
            return;
        }

        try {
            const id = AccountId.fromString(accountIdInput);
            setSelectedAccountId(id);
            fetchAccountInfo(id);
        } catch (error) {
            Notifier.showError(error);
        }
    }, [accountIdInput, fetchAccountInfo]);

    const selectedAccount = React.useMemo(() => {
        if (selectedAccountId) {
            return accounts.find((account) => account.accountId.equals(selectedAccountId));
        }
    }, [accounts, selectedAccountId]);

    return (
        <div className={className}>
            {/* Fixed Top Content */}
            <Box sx={{ flexShrink: 0 }}>
                {/* Search Area */}
                <Paper elevation={3} sx={{ p: "1rem", mb: "1rem" }}>
                    <Grid container spacing={2} sx={{ alignItems: "center" }}>
                        <Grid>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                value={accountIdInput}
                                placeholder="0.0.xxxx"
                                label="Account ID"
                                onChange={handleAccountIdChange}
                            />
                        </Grid>
                        <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button size="large" variant="contained" disabled={!accountIdInput || loading} onClick={handleSearchAccount}>
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Account Details */}
                {selectedAccount && (
                    <Paper elevation={3} sx={{ p: "1rem" }}>
                        <Typography gutterBottom>Overview</Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Grid
                            container
                            spacing={2}
                            sx={{ alignItems: "center", px: 2, justifyContent: "space-between" }}
                        >
                            <Grid>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Account ID
                                    </Typography>
                                    <Typography variant="body1">{selectedAccount.accountId.toString()}</Typography>
                                </Box>
                            </Grid>

                            <Grid>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Balance
                                    </Typography>
                                    <Typography variant="body1">{selectedAccount.balance?.toString()}</Typography>
                                </Box>
                            </Grid>

                            <Grid>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Memo
                                    </Typography>
                                    <Typography variant="body1">{selectedAccount.accountMemo || "N/A"}</Typography>
                                </Box>
                            </Grid>

                            <Grid>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Stake node
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedAccount.stakingInfo?.stakedNodeId?.toString() ?? "Not staking"}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Pending reward
                                    </Typography>
                                    <Typography variant="body1">{selectedAccount.stakingInfo?.pendingReward?.toString()}</Typography>
                                </Box>
                            </Grid>

                            <Grid>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Expiration Time
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatConsensusTime(selectedAccount.expirationTime.toString())}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
            </Box>
        </div>
    );
};

const AccountView = styled(AccountViewBase)`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`;

export { AccountView };
