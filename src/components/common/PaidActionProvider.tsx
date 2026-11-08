import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useApp } from "../../app/appContext";
import { PaidActionContext, type ConfirmPaidAction, type PaidActionRequest } from "../../app/paidActionContext";
import { notify } from "../../utils/notify";
import { formatFee } from "../../utils/format";
import { FeeSummary } from "./FeeSummary";

type Pending = { request: PaidActionRequest; resolve: (ok: boolean) => void };

export const PaidActionProvider = ({ children }: { children: ReactNode }) => {
    const { serverConfig } = useApp();
    const [pending, setPending] = useState<Pending | null>(null);
    const [busy, setBusy] = useState(false);
    const busyRef = useRef(false);

    const confirm = useCallback<ConfirmPaidAction>(
        (request) =>
            new Promise<boolean>((resolve) => {
                setPending({ request, resolve });
            }),
        [],
    );

    const decline = () => {
        if (busyRef.current) {
            return;
        }
        pending?.resolve(false);
        setPending(null);
    };

    const accept = async () => {
        if (!pending || busyRef.current) {
            return;
        }
        busyRef.current = true;
        setBusy(true);
        let ok = false;
        try {
            await pending.request.run();
            ok = true;
        } catch (error) {
            notify.error(error);
        } finally {
            busyRef.current = false;
            setBusy(false);
            pending.resolve(ok);
            setPending(null);
        }
    };

    const request = pending?.request;
    const network = serverConfig?.network ?? "testnet";

    return (
        <PaidActionContext.Provider value={confirm}>
            {children}
            <Dialog open={pending !== null} onClose={decline} maxWidth="xs" aria-labelledby="paid-action-title">
                <DialogTitle id="paid-action-title">Accept a paid action?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {request?.title}
                    </Typography>
                    {request?.description && (
                        <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                            {request.description}
                        </Typography>
                    )}
                    <FeeSummary
                        facts={[
                            { label: "Network", value: <span style={{ textTransform: "capitalize" }}>{network}</span> },
                            { label: "Paid from", value: serverConfig?.accountId ?? "app account" },
                            ...(request?.facts ?? []).map((fact) => ({ label: fact.label, value: fact.value })),
                            { label: "Typical fee", value: request ? formatFee(request.feeHbar) : "" },
                        ]}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {network === "mainnet" ? "This spends real HBAR." : "Testnet HBAR has no real value."} Nothing is sent until you
                        accept.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={decline} disabled={busy}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={request?.destructive ? "error" : "primary"}
                        onClick={accept}
                        disabled={busy}
                        autoFocus
                    >
                        {busy ? "Running…" : (request?.confirmLabel ?? "Accept and run")}
                    </Button>
                </DialogActions>
            </Dialog>
        </PaidActionContext.Provider>
    );
};
