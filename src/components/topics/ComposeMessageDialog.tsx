import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { lazy, Suspense, useState } from "react";
import { LIMITS } from "../../../shared/api";
import { serverApi } from "../../api/serverApi";
import { byteLength } from "../../utils/format";
import { notify } from "../../utils/notify";

// Monaco is large: load it only when the dialog opens on a desktop-sized screen.
const MonacoEditor = lazy(() => import("@monaco-editor/react"));

const LANGUAGES = [
    { value: "json", label: "JSON" },
    { value: "plaintext", label: "Text" },
    { value: "yaml", label: "YAML" },
    { value: "xml", label: "XML" },
    { value: "html", label: "HTML" },
    { value: "csv", label: "CSV" },
];

type Props = {
    open: boolean;
    topicId: string;
    onClose: () => void;
    onSent: (sequenceNumber: number) => void;
};

export const ComposeMessageDialog = ({ open, topicId, onClose, onSent }: Props) => {
    const theme = useTheme();
    const compact = useMediaQuery(theme.breakpoints.down("sm"));
    const [language, setLanguage] = useState("json");
    const [value, setValue] = useState("");
    const [sending, setSending] = useState(false);

    const bytes = byteLength(value);
    const tooLarge = bytes > LIMITS.messageMaxBytes;

    const send = async () => {
        let message = value;
        if (language === "json") {
            try {
                message = JSON.stringify(JSON.parse(value));
            } catch {
                notify.warning("That is not valid JSON. Switch the format to Text to send it as is.");
                return;
            }
        }

        setSending(true);
        try {
            const { sequenceNumber } = await serverApi.submitMessage({ topicId, message });
            notify.success(`Message #${sequenceNumber} submitted`);
            setValue("");
            onSent(sequenceNumber);
        } catch (error) {
            notify.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onClose={sending ? undefined : onClose} maxWidth="md" fullScreen={compact}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flexGrow: 1 }}>
                    New message
                    <Typography variant="body2" color="text.secondary" className="mono">
                        {topicId}
                    </Typography>
                </Box>
                <TextField select label="Format" value={language} onChange={(e) => setLanguage(e.target.value)} sx={{ minWidth: 120 }}>
                    {LANGUAGES.map((l) => (
                        <MenuItem key={l.value} value={l.value}>
                            {l.label}
                        </MenuItem>
                    ))}
                </TextField>
            </DialogTitle>
            <DialogContent dividers sx={{ p: compact ? 2 : 0 }}>
                {compact ? (
                    <TextField
                        autoFocus
                        multiline
                        fullWidth
                        minRows={12}
                        value={value}
                        placeholder={language === "json" ? '{ "hello": "hedera" }' : "Your message"}
                        onChange={(event) => setValue(event.target.value)}
                        slotProps={{ htmlInput: { className: "mono", style: { fontSize: 13 } } }}
                    />
                ) : (
                    <Suspense
                        fallback={
                            <Box sx={{ height: "55vh", display: "grid", placeItems: "center" }}>
                                <CircularProgress size={28} />
                            </Box>
                        }
                    >
                        <MonacoEditor
                            height="55vh"
                            language={language}
                            value={value}
                            theme={theme.palette.mode === "dark" ? "vs-dark" : "light"}
                            onChange={(next) => setValue(next ?? "")}
                            options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, wordWrap: "on", tabSize: 2 }}
                        />
                    </Suspense>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3 }}>
                <Typography variant="caption" color={tooLarge ? "error" : "text.secondary"} sx={{ mr: "auto" }}>
                    {bytes.toLocaleString()} / {LIMITS.messageMaxBytes.toLocaleString()} bytes
                </Typography>
                <Button onClick={onClose} disabled={sending}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={send} disabled={!value.trim() || tooLarge || sending}>
                    {sending ? "Submitting…" : "Submit"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
