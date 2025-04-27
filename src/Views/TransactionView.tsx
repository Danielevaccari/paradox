import * as React from "react";
import { Box, Paper, TextField, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import styled from "styled-components";
import { AccountId } from "@hashgraph/sdk";
import { Hedera } from "../Hedera/hedera";
import { Notifier } from "../Notifications/notifications";
import { TransactionList } from "../components/Transactions/TransactionList";
import { hbarLogo } from "../Hedera/constants";

type Props = {
    className?: string;
};

let TransactionView = ({ className }: Props) => {
    const [toAccountId, setToAccountId] = React.useState<string>("");
    const [transferAmount, setTransferAmount] = React.useState<number | null>(null);
    const [sendTransactionDialogIsOpen, setSendTransactionDialogIsOpen] = React.useState(false);
    const [accountIdForTransactionQuery, setAccountIdForTransactionQuery] = React.useState<string>(Hedera.getAccountId());

    const onAcceptTransaction = async () => {
        if (transferAmount === null || transferAmount <= 0) {
            Notifier.showWarning("Amount must be greater than zero.");
            return false;
        }
        try {
            const destinationAccountId = AccountId.fromString(toAccountId);
            const transactionId = await Hedera.sendTransaction(destinationAccountId, transferAmount);
            setToAccountId("");
            setTransferAmount(null);
            Notifier.showSuccess(`Transaction successful! Transaction Id: ${transactionId}`);
            return true;
        } catch (error) {
            Notifier.showError("Error sending transaction: " + error);
            return false;
        }
    };

    return (
        <div className={className}>
            <Box sx={{ display: "flex" }}>
                <Paper elevation={3} sx={{ p: "1rem", width: "100%" }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid>
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
                            <Button
                                fullWidth
                                size="medium"
                                color="success"
                                variant="contained"
                                onClick={() => setSendTransactionDialogIsOpen(true)}
                            >
                                Send transaction {hbarLogo}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
            <Dialog
                open={sendTransactionDialogIsOpen}
                onClose={() => {
                    setToAccountId("");
                    setTransferAmount(null);
                    setSendTransactionDialogIsOpen(false);
                }}
            >
                <DialogTitle>Send New Transaction</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} p="1rem">
                        <Grid sx={{ flex: 1 }}>
                            <TextField
                                disabled
                                fullWidth
                                size="small"
                                variant="outlined"
                                label="From Account ID"
                                value={Hedera.getAccountId()}
                            />
                        </Grid>
                        <Grid sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                value={toAccountId}
                                label="To Account ID"
                                onChange={(event) => setToAccountId(event.target.value)}
                            />
                        </Grid>
                        <Grid sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                variant="outlined"
                                label={`Amount ${hbarLogo}`}
                                value={transferAmount ?? ""}
                                onChange={(event) => setTransferAmount(Number(event.target.value))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setToAccountId("");
                            setTransferAmount(null);
                            setSendTransactionDialogIsOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="info"
                        variant="contained"
                        disabled={toAccountId.length <= 0 || transferAmount === null || transferAmount <= 0}
                        onClick={async () => {
                            const success = await onAcceptTransaction();
                            if (success) {
                                setSendTransactionDialogIsOpen(false);
                            }
                        }}
                    >
                        Send
                    </Button>
                </DialogActions>
            </Dialog>

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
