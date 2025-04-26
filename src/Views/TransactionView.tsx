import * as React from "react";
import { Box, Typography, Paper, TextField, Button, Grid } from "@mui/material";
import styled from "styled-components";
import { AccountId } from "@hashgraph/sdk";
import { Hedera } from "../Hedera/hedera";
import { Notifier } from "../Notifications/notifications";
import { TransactionList } from "../components/Transactions/TransactionList.";

type Props = {
    className?: string;
};

let TransactionView = ({ className }: Props) => {
    const [toAccountId, setToAccountId] = React.useState<string>("");
    const [transferAmount, setTransferAmount] = React.useState<number>(0);

    const onacceptTransaction = async () => {
        if (transferAmount <= 0) {
            Notifier.showWarning("Amount must be greater than zero.");
            return;
        }

        try {
            const destinationAccountId = AccountId.fromString(toAccountId);
            const transactionId = await Hedera.sendTransaction(destinationAccountId, transferAmount);

            setToAccountId("");
            setTransferAmount(0);

            Notifier.showSuccess(`Transaction successful! Transaction Id: ${transactionId}`);
        } catch (error) {
            Notifier.showError("Error sending transaction: " + error);
        }
    };

    return (
        <div className={className}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {/* Send Transaction Form */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Create a Transaction
                    </Typography>

                    <Grid container spacing={2} alignItems="center">
                        <Grid>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    disabled
                                    label="Sending Account Id"
                                    value={Hedera.getAccountId()}
                                    InputProps={{ readOnly: true }}
                                />
                            </Paper>
                        </Grid>

                        <Grid>
                            <TextField
                                fullWidth
                                type="number"
                                variant="standard"
                                label="Amount (HBAR)"
                                value={transferAmount}
                                onChange={(event) => setTransferAmount(Number(event.target.value))}
                            />
                        </Grid>

                        <Grid>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    label="Receiving Account Id"
                                    value={toAccountId}
                                    onChange={(e) => setToAccountId(e.target.value)}
                                />
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button
                            color="primary"
                            variant="contained"
                            disabled={toAccountId.length <= 0 || transferAmount <= 0}
                            onClick={onacceptTransaction}
                        >
                            Send
                        </Button>
                    </Grid>
                </Paper>

                <TransactionList accountId={Hedera.getAccountId()} />
            </Box>
        </div>
    );
};

TransactionView = styled(TransactionView)`
    height: 100%;
    width: 100%;
`;

export { TransactionView };
