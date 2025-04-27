import * as React from "react";
import { Box, Paper, TextField, Button, Grid } from "@mui/material";
import styled from "styled-components";
import { AccountId } from "@hashgraph/sdk";
import { Hedera } from "../Hedera/hedera";
import { Notifier } from "../Notifications/notifications";
import { TransactionList } from "../components/Transactions/TransactionList.";
import { hbarLogo } from "../Hedera/constants";

type Props = {
    className?: string;
};

let TransactionView = ({ className }: Props) => {
    const [toAccountId, setToAccountId] = React.useState<string>("");
    const [transferAmount, setTransferAmount] = React.useState<number | null>(null);
    const [accountIdForTransactionQuery, setAccountIdForTransactionQuery] = React.useState<string>(Hedera.getAccountId());

    const onAcceptTransaction = async () => {
        if (transferAmount === null || transferAmount <= 0) {
            Notifier.showWarning("Amount must be greater than zero.");
            return;
        }

        try {
            const destinationAccountId = AccountId.fromString(toAccountId);
            const transactionId = await Hedera.sendTransaction(destinationAccountId, transferAmount);

            setToAccountId("");
            setTransferAmount(null);

            Notifier.showSuccess(`Transaction successful! Transaction Id: ${transactionId}`);
        } catch (error) {
            Notifier.showError("Error sending transaction: " + error);
        }
    };

    return (
        <div className={className}>
            <Box sx={{ display: "flex" }}>
                <Paper elevation={3} sx={{ p: "1rem", width: "100%" }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid justifyContent="left">
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                label="Account ID"
                                value={accountIdForTransactionQuery}
                                onChange={(event) => setAccountIdForTransactionQuery(event.target.value)}
                            />
                        </Grid>

                        <Grid>
                            <TextField
                                disabled
                                fullWidth
                                size="small"
                                variant="outlined"
                                label="From Account ID"
                                value={Hedera.getAccountId()}
                            />
                        </Grid>

                        <Grid>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                variant="outlined"
                                value={transferAmount ?? ""}
                                label={`Amount ${hbarLogo}`}
                                onChange={(event) => setTransferAmount(Number(event.target.value))}
                            />
                        </Grid>

                        <Grid>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                value={toAccountId}
                                label="To Account ID"
                                onChange={(event) => setToAccountId(event.target.value)}
                            />
                        </Grid>

                        <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                fullWidth
                                color="info"
                                size="medium"
                                variant="contained"
                                disabled={toAccountId.length <= 0 || transferAmount === null || transferAmount <= 0}
                                onClick={onAcceptTransaction}
                            >
                                Send
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {/* Scrollable Transaction List */}
            <Box sx={{ flexGrow: 1, overflow: "auto", minHeight: 0 }}>
                <TransactionList accountId={accountIdForTransactionQuery} />
            </Box>
        </div>
    );
};

TransactionView = styled(TransactionView)`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`;

export { TransactionView };
