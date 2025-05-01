import {
    Typography,
    List,
    ListItem,
    Box,
    Button,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputLabel,
    FormControl,
    useTheme,
    IconButton,
    Tooltip,
} from "@mui/material";
import { TopicMessage, Topic } from "../../Hedera/types";
import React, { useState } from "react";
import { Hedera } from "../../Hedera/hedera";
import { SupportedLanguages } from "../../Enumerations/enumerations";
import styled from "styled-components";
import { formatConsensusTime } from "../../Utility/date";
import { Notifier } from "../../Notifications/notifications";
import Editor from "@monaco-editor/react";
import { calculateByteSize } from "../../Utility/math";
import { Add, Remove } from "@mui/icons-material";
import { LocalStorageHelper } from "../../LocalStorage/localStorageHelper";
import { getEditorHeight } from "../../Utility/misc";

type Props = {
    className?: string;
    topic: Topic;
    topicMessages: Array<TopicMessage>;
    onCreateTopicMessage: (message: string) => void;
};

let TopicMessagesList = ({ className, topic, topicMessages, onCreateTopicMessage }: Props) => {
    const [byteSize, setByteSize] = useState(0);
    const [textEditorIsOpen, setTextEditorIsOpen] = React.useState(false);
    const [textEditorValue, setTextEditorValue] = React.useState<string>("");
    const [fontSize, setFontSize] = React.useState(LocalStorageHelper.getTopicMessageFontSize());
    const [selectedLanguage, setSelectedLanguage] = React.useState<SupportedLanguages>(SupportedLanguages.JSON);

    const theme = useTheme();

    const handleOpenJsonEditor = () => {
        if (selectedLanguage === SupportedLanguages.JSON) {
            setTextEditorValue("");
        } else if (selectedLanguage === SupportedLanguages.TEXT) {
            setTextEditorValue("");
        }

        setTextEditorIsOpen(true);
    };

    const onAcceptTextEditor = () => {
        switch (selectedLanguage) {
            case SupportedLanguages.TEXT:
                onCreateTopicMessage(textEditorValue);
                setTextEditorIsOpen(false);

                break;
            case SupportedLanguages.JSON:
                try {
                    const parsed = JSON.parse(textEditorValue);
                    const jsonString = JSON.stringify(parsed);

                    onCreateTopicMessage(jsonString);
                    setTextEditorIsOpen(false);
                } catch {
                    Notifier.showError("Invalid JSON");
                }
                break;
            default:
                Notifier.showError("Unsupported data type");
                break;
        }
    };

    const handleEditorChange = (value: string | undefined) => {
        setTextEditorValue(value ?? "{}");

        const byteSize = calculateByteSize(value ?? "{}");
        setByteSize(byteSize); // Track byte size whenever content changes in the editor
    };

    const changeFontSize = (num: number) => {
        setFontSize((prevSize) => {
            let newFontSize = prevSize + num;

            // Clamp the font size between 0.5 and 3
            newFontSize = Math.max(6, Math.min(newFontSize, 30));

            // Save as number (you can stringify it if storing in localStorage)
            LocalStorageHelper.setTopicMessageFontSize(newFontSize);

            return newFontSize;
        });
    };

    return (
        <div className={className}>
            {/* Message Input and Data Type */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: theme.palette.background.default,
                    padding: "1rem",
                }}
            >
                {topic.deleted ? (
                    <>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Message submission is disabled for deleted topics
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <Box>
                            <Select
                                size="small"
                                variant="outlined"
                                value={selectedLanguage}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left",
                                    },
                                    transformOrigin: {
                                        vertical: "top",
                                        horizontal: "right",
                                    },
                                }}
                                onChange={(event) => setSelectedLanguage(event.target.value as SupportedLanguages)}
                            >
                                {Object.entries(SupportedLanguages).map(
                                    ([key, value]) =>
                                        typeof value === "string" && (
                                            <MenuItem key={value} value={value}>
                                                {key}
                                            </MenuItem>
                                        ),
                                )}
                            </Select>
                        </Box>

                        <Box>
                            <Button variant="contained" color="success" size="medium" onClick={handleOpenJsonEditor}>
                                New msg
                            </Button>
                        </Box>
                    </>
                )}

                {/* Font Size Buttons */}
                <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexGrow: 1 }}>
                    <IconButton onClick={() => changeFontSize(1)}>
                        <Add />
                    </IconButton>
                    <IconButton onClick={() => changeFontSize(-1)}>
                        <Remove />
                    </IconButton>
                </Box>
            </Box>

            {/* Scrollable Message List */}
            <Box className="scroll-container">
                <List>
                    {topicMessages
                        .sort((a, b) => b.sequence_number - a.sequence_number)
                        .map((msg, index) => {
                            let message = "";
                            const decodedTopicMessage = Hedera.decodeBase64ToString(msg.message);

                            if (selectedLanguage === SupportedLanguages.TEXT) {
                                message = decodedTopicMessage;
                            } else if (selectedLanguage === SupportedLanguages.JSON) {
                                try {
                                    message = JSON.stringify(JSON.parse(decodedTopicMessage), null, 2);
                                } catch {
                                    message = decodedTopicMessage; // Fallback to plaintext if JSON parsing fails
                                }
                            }

                            const timestamp = formatConsensusTime(msg.consensus_timestamp);

                            return (
                                <ListItem key={index} alignItems="flex-start">
                                    <Box sx={{ width: "100%", wordBreak: "break-word" }}>
                                        {/* Metadata Header */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                fontSize: "0.75rem",
                                                padding: "0rem 0.25rem 0.25rem 0.25rem",
                                                justifyContent: "space-between",
                                                color: theme.palette.text.secondary,
                                                backgroundColor: theme.palette.background.paper,
                                            }}
                                        >
                                            <Tooltip title="Message sequence number. Might not be continuous if chunks exist" arrow>
                                                <span>{msg.sequence_number}</span>
                                            </Tooltip>

                                            <Tooltip title="Consensus timestamp" arrow>
                                                <span>{timestamp}</span>
                                            </Tooltip>

                                            <Tooltip title="Sender Account ID" arrow>
                                                <span>{msg.payer_account_id}</span>
                                            </Tooltip>
                                        </Box>

                                        <Editor
                                            value={message}
                                            language={selectedLanguage}
                                            height={getEditorHeight(message, fontSize)}
                                            theme={theme.palette.mode === "dark" ? "vs-dark" : "vs-light"}
                                            options={{
                                                readOnly: true,
                                                fontSize: fontSize,
                                                lineNumbers: "off",
                                                wordWrap: "on",
                                            }}
                                        />
                                    </Box>
                                </ListItem>
                            );
                        })}
                </List>
            </Box>

            {/* JSON Editor Dialog */}
            <Dialog open={textEditorIsOpen} onClose={() => setTextEditorIsOpen(false)} fullWidth maxWidth="lg">
                <DialogTitle>
                    <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                            label="Language"
                            value={selectedLanguage}
                            onChange={(event) => setSelectedLanguage(event.target.value as SupportedLanguages)}
                        >
                            <MenuItem value="json">JSON</MenuItem>
                            <MenuItem value="yaml">YAML</MenuItem>
                            <MenuItem value="html">HTML</MenuItem>
                            <MenuItem value="xml">XML</MenuItem>
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="text">TEXT</MenuItem>
                        </Select>
                    </FormControl>
                </DialogTitle>
                <DialogContent dividers>
                    <Editor
                        height="60vh"
                        value={textEditorValue}
                        language={selectedLanguage}
                        theme={theme.palette.mode === "dark" ? "vs-dark" : "vs-light"}
                        onChange={handleEditorChange} // Handle editor change and calculate byte size
                    />
                </DialogContent>
                <DialogActions>
                    <Typography variant="body2" sx={{ padding: 0 }}>
                        {byteSize} bytes
                    </Typography>
                    <Button onClick={() => setTextEditorIsOpen(false)}>Close</Button>

                    <Button onClick={onAcceptTextEditor} variant="contained" color="primary">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

TopicMessagesList = styled(TopicMessagesList)`
    height: 100%;
    display: flex;
    flex-direction: column;

    .scroll-container {
        flex-grow: 1;
        overflow-y: auto;
    }
`;

export { TopicMessagesList };
