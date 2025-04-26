import * as React from "react";
import { Typography, Paper, Grid, TextField, Button, CircularProgress } from "@mui/material";
import styled from "styled-components";
import { Hedera } from "../Hedera/hedera";
import { AccountId, AccountInfo } from "@hashgraph/sdk";
import { Notifier } from "../Notifications/notifications";
import { TransactionList } from "../components/Transactions/TransactionList.";

type Props = { className?: string };

let AccountView = ({ className }: Props) => {
    const [accounts, setAccounts] = React.useState<Array<AccountInfo>>([]);
    const [selectedAccountId, setSelectedAccountId] = React.useState<AccountId | null>(null);
    const [accountIdInput, setAccountIdInput] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);

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

    React.useEffect(() => {
        const currentAccountId = Hedera.getAccountId();
        if (currentAccountId) {
            const id = AccountId.fromString(currentAccountId);
            setSelectedAccountId(id);
            fetchAccountInfo(id);
        }
    }, []);

    const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccountIdInput(e.target.value);
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

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearchAccount();
        }
    };

    const selectedAccount = React.useMemo(() => {
        if (selectedAccountId) {
            return accounts.find((account) => account.accountId.equals(selectedAccountId));
        }
    }, [accounts, selectedAccountId]);

    return (
        <div className={className}>
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid>
                        <TextField
                            size="small"
                            label="Account ID"
                            fullWidth
                            variant="outlined"
                            value={accountIdInput}
                            onChange={handleAccountIdChange}
                            onKeyPress={handleKeyPress}
                            placeholder="0.0.x"
                        />
                    </Grid>
                    <Grid>
                        <Button variant="contained" fullWidth disabled={!accountIdInput || loading} onClick={handleSearchAccount}>
                            {loading ? <CircularProgress size={24} /> : "Search Account"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {selectedAccount && (
                <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Account Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid>
                            <Typography>
                                <strong>Account ID:</strong> {selectedAccount.accountId.toString()}
                            </Typography>
                            <Typography>
                                <strong>Balance:</strong> {selectedAccount.balance?.toString()}
                            </Typography>
                        </Grid>
                        <Grid>
                            <Typography>
                                <strong>Memo:</strong> {selectedAccount.accountMemo || "N/A"}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {selectedAccountId && <TransactionList accountId={selectedAccountId} />}
        </div>
    );
};

AccountView = styled(AccountView)`
    height: 100%;
`;

export { AccountView };
