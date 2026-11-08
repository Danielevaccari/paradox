import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    open: boolean;
    title: string;
    children: ReactNode;
    confirmLabel: string;
    destructive?: boolean;
    busy?: boolean;
    onConfirm: () => void;
    onClose: () => void;
};

export const ConfirmDialog = ({ open, title, children, confirmLabel, destructive, busy, onConfirm, onClose }: Props) => (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText component="div">{children}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={busy}>
                Cancel
            </Button>
            <Button variant="contained" color={destructive ? "error" : "primary"} onClick={onConfirm} disabled={busy}>
                {busy ? "Working…" : confirmLabel}
            </Button>
        </DialogActions>
    </Dialog>
);
