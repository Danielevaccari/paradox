import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { LIMITS, TYPICAL_FEE_HBAR } from "../../../shared/api";
import { serverApi } from "../../api/serverApi";
import { usePaidAction } from "../../app/paidActionContext";
import { notify } from "../../utils/notify";

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: (topicId: string) => void;
};

export const CreateTopicDialog = ({ open, onClose, onCreated }: Props) => {
    const confirmPaid = usePaidAction();
    const [memo, setMemo] = useState("");
    const [adminKey, setAdminKey] = useState(true);
    const [submitKey, setSubmitKey] = useState(false);

    const trimmed = memo.trim();

    const create = async () => {
        let topicId = "";
        const ok = await confirmPaid({
            title: `Create topic “${trimmed}”`,
            description: `${submitKey ? "Private: only this app's account can post." : "Public: anyone can post."} ${adminKey ? "Has an admin key." : "No admin key, so it cannot be changed or deleted."}`,
            feeHbar: TYPICAL_FEE_HBAR.createTopic,
            confirmLabel: "Create topic",
            run: async () => {
                ({ topicId } = await serverApi.createTopic({ memo: trimmed, adminKey, submitKey }));
                notify.success(`Topic ${topicId} created`);
            },
        });
        if (ok) {
            setMemo("");
            onCreated(topicId);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs">
            <DialogTitle>Create topic</DialogTitle>
            <DialogContent>
                <Stack spacing={1.5} sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Memo"
                        value={memo}
                        onChange={(event) => setMemo(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && trimmed) {
                                void create();
                            }
                        }}
                        slotProps={{ htmlInput: { maxLength: LIMITS.memoMaxLength } }}
                        helperText="A short public description"
                    />
                    <div>
                        <FormControlLabel
                            control={<Switch checked={adminKey} onChange={(e) => setAdminKey(e.target.checked)} />}
                            label="Admin key"
                        />
                        <Typography variant="caption" color="text.secondary" component="p" sx={{ ml: 6, mt: -0.5 }}>
                            Lets this app renew or delete the topic later.
                        </Typography>
                    </div>
                    <div>
                        <FormControlLabel
                            control={<Switch checked={submitKey} onChange={(e) => setSubmitKey(e.target.checked)} />}
                            label="Private"
                        />
                        <Typography variant="caption" color="text.secondary" component="p" sx={{ ml: 6, mt: -0.5 }}>
                            Only this app&apos;s account can post messages.
                        </Typography>
                    </div>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={create} disabled={!trimmed}>
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
    );
};
