import * as React from "react";
import {
    Box,
    Paper,
    TextField,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AccountId } from "@hiero-ledger/sdk";
import { Hedera } from "../Hedera/hedera";
import { Notifier } from "../Notifications/notifications";
import { TransactionList } from "../components/Transactions/TransactionList";
import { hbarLogo } from "../Hedera/constants";
import { TransactionType } from "../Hedera/enumerations";
import { LocalStorageHelper } from "../LocalStorage/localStorageHelper";

type Props = {
    className?: string;
};

const TransactionViewBase = ({ className }: Props) => {
    const [toAccountId, setToAccountId] = React.useState<string>("");
    const [transferAmount, setTransferAmount] = React.useState<number | null>(null);
    const [sendTransactionDialogIsOpen, setSendTransactionDialogIsOpen] = React.useState(false);
    const [accountIdForTransactionQuery, setAccountIdForTransactionQuery] = React.useState<string | undefined>(Hedera.getAccountId());
    const [transactionType, setTransactionType] = React.useState<TransactionType>(LocalStorageHelper.getTransactionListTransactionType());

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

    const onChangeTransactionType = (event: SelectChangeEvent<TransactionType>) => {
        const selectedType = event.target.value as TransactionType;
        setTransactionType(selectedType);
        LocalStorageHelper.setTransactionListTransactionType(selectedType);
    };

    return (
        <div className={className}>
            <Box sx={{ display: "flex", height: "10%" }}>
                <Paper elevation={3} sx={{ p: "1rem", width: "100%" }}>
                    <Grid container spacing={2} sx={{ alignItems: "center" }}>
                        <Grid>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                label="Account ID"
                                value={accountIdForTransactionQuery}
                                sx={{
                                    width: { xs: "120px", sm: "130px", md: "150px" },
                                }}
                                onChange={(event) => setAccountIdForTransactionQuery(event.target.value)}
                            />
                        </Grid>

                        <Grid>
                            <FormControl
                                fullWidth
                                size="small"
                                sx={{
                                    minWidth: { xs: "120px", sm: "150px", md: "200px" },
                                }}
                            >
                                <InputLabel>Transaction Type</InputLabel>
                                <Select value={transactionType} label="Transaction Type" onChange={onChangeTransactionType}>
                                    <MenuItem value={undefined}>All</MenuItem>
                                    {Object.values(TransactionType).map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid sx={{ marginLeft: "auto" }}>
                            <Button
                                fullWidth
                                size="medium"
                                color="primary"
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
                    <Grid container spacing={2} sx={{ p: 2 }}>
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

            {accountIdForTransactionQuery && (
                <Box sx={{ height: "90%", overflow: "auto" }}>
                    <TransactionList key={`${accountIdForTransactionQuery}-${transactionType}`} accountId={accountIdForTransactionQuery} transactionType={transactionType} />
                </Box>
            )}
        </div>
    );
};

const TransactionView = styled(TransactionViewBase)`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`;

export { TransactionView };
