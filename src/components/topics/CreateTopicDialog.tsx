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
import { LIMITS } from "../../../shared/api";
import { serverApi } from "../../api/serverApi";
import { notify } from "../../utils/notify";

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: (topicId: string) => void;
};

export const CreateTopicDialog = ({ open, onClose, onCreated }: Props) => {
    const [memo, setMemo] = useState("");
    const [adminKey, setAdminKey] = useState(true);
    const [submitKey, setSubmitKey] = useState(false);
    const [creating, setCreating] = useState(false);

    const trimmed = memo.trim();

    const create = async () => {
        setCreating(true);
        try {
            const { topicId } = await serverApi.createTopic({ memo: trimmed, adminKey, submitKey });
            notify.success(`Topic ${topicId} created`);
            setMemo("");
            onCreated(topicId);
        } catch (error) {
            notify.error(error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onClose={creating ? undefined : onClose} maxWidth="xs">
            <DialogTitle>Create topic</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Memo"
                        value={memo}
                        onChange={(event) => setMemo(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && trimmed && !creating) {
                                void create();
                            }
                        }}
                        slotProps={{ htmlInput: { maxLength: LIMITS.memoMaxLength } }}
                        helperText="A short public description of the topic"
                    />
                    <div>
                        <FormControlLabel
                            control={<Switch checked={adminKey} onChange={(e) => setAdminKey(e.target.checked)} />}
                            label="Admin key"
                        />
                        <Typography variant="caption" color="text.secondary" component="p" sx={{ ml: 6, mt: -0.5 }}>
                            Lets this app update or delete the topic later.
                        </Typography>
                    </div>
                    <div>
                        <FormControlLabel
                            control={<Switch checked={submitKey} onChange={(e) => setSubmitKey(e.target.checked)} />}
                            label="Private (submit key)"
                        />
                        <Typography variant="caption" color="text.secondary" component="p" sx={{ ml: 6, mt: -0.5 }}>
                            Only this app&apos;s account can post messages.
                        </Typography>
                    </div>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={creating}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={create} disabled={!trimmed || creating}>
                    {creating ? "Creating…" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
