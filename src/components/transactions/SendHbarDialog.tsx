import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { LIMITS } from "../../../shared/api";
import { serverApi } from "../../api/serverApi";
import { HBAR_SYMBOL, isEntityId } from "../../utils/format";
import { notify } from "../../utils/notify";

type Props = {
    open: boolean;
    fromAccountId: string;
    onClose: () => void;
    onSent: () => void;
};

export const SendHbarDialog = ({ open, fromAccountId, onClose, onSent }: Props) => {
    const [to, setTo] = useState("");
    const [amount, setAmount] = useState("");
    const [sending, setSending] = useState(false);

    const amountNumber = Number(amount);
    const valid = isEntityId(to) && to.trim() !== fromAccountId && amountNumber > 0 && amountNumber <= LIMITS.transferMaxHbar;

    const send = async () => {
        setSending(true);
        try {
            const { transactionId } = await serverApi.transfer({ to: to.trim(), amountHbar: amountNumber });
            notify.success(`Sent ${amountNumber} ${HBAR_SYMBOL} (${transactionId})`);
            setTo("");
            setAmount("");
            onSent();
        } catch (error) {
            notify.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onClose={sending ? undefined : onClose} maxWidth="xs">
            <DialogTitle>Send HBAR</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TextField label="From" value={fromAccountId} disabled />
                    <TextField label="To account" placeholder="0.0.12345" value={to} onChange={(e) => setTo(e.target.value)} autoFocus />
                    <TextField
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        helperText={`Up to ${LIMITS.transferMaxHbar} ${HBAR_SYMBOL} per transfer`}
                        slotProps={{
                            input: { endAdornment: <InputAdornment position="end">{HBAR_SYMBOL}</InputAdornment> },
                            htmlInput: { min: 0, step: "any" },
                        }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={sending}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={send} disabled={!valid || sending}>
                    {sending ? "Sending…" : "Send"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
