import * as React from "react";
import { Typography, Paper, Grid, TextField, Button, Divider, Box } from "@mui/material";
import styled from "styled-components";
import { Hedera } from "../Hedera/hedera";
import { AccountId, AccountInfo } from "@hashgraph/sdk";
import { Notifier } from "../Notifications/notifications";
import { formatConsensusTime } from "../Utility/date";

type Props = { className?: string };

let AccountView = ({ className }: Props) => {
    const [loading, setLoading] = React.useState(false);
    const [accounts, setAccounts] = React.useState<AccountInfo[]>([]);
    const [accountIdInput, setAccountIdInput] = React.useState("");
    const [selectedAccountId, setSelectedAccountId] = React.useState<AccountId | null>(null);

    const fetchAccountInfo = async (accountId: AccountId) => {
        try {
            setLoading(true);
            const accountInfo = await Hedera.getAccountInfo(accountId);
            setAccounts([accountInfo]);
        } catch (error) {
            Notifier.showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccountIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccountIdInput(event.target.value);
    };

    const handleSearchAccount = () => {
        try {
            const id = AccountId.fromString(accountIdInput);
            setSelectedAccountId(id);
            fetchAccountInfo(id);
        } catch (error) {
            Notifier.showError(error);
        }
    };

    const selectedAccount = React.useMemo(() => {
        if (selectedAccountId) {
            return accounts.find((account) => account.accountId.equals(selectedAccountId));
        }
    }, [accounts, selectedAccountId]);

    console.log("Selected Account: ", selectedAccount);

    React.useEffect(() => {
        const currentAccountId = Hedera.getAccountId();

        if (currentAccountId) {
            const id = AccountId.fromString(currentAccountId);
            setSelectedAccountId(id);
            fetchAccountInfo(id);
        }
    }, []);

    return (
        <div className={className}>
            {/* Fixed Top Content */}
            <Box sx={{ flexShrink: 0 }}>
                {/* Search Area */}
                <Paper elevation={3} sx={{ p: "1rem", mb: "1rem" }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                value={accountIdInput}
                                placeholder="0.0.xxxx"
                                label="Search Account by ID"
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
                        <Typography gutterBottom>Account Overview</Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Grid
                            container
                            spacing={2}
                            display="flex"
                            alignItems="center"
                            p="0rem 1rem 0rem 1rem"
                            justifyContent="space-between"
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
                                        Account Memo
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

AccountView = styled(AccountView)`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`;

export { AccountView };
