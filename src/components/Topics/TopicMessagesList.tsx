import {
    Typography,
    List,
    ListItem,
    ListItemText,
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
} from "@mui/material";
import { Message } from "../../Hedera/types";
import React, { useState } from "react";
import { TopicId } from "@hashgraph/sdk";
import { Hedera } from "../../Hedera/hedera";
import { DataType } from "../../Enumerations/enumerations";
import styled from "styled-components";
import { formatConsensusTime } from "../../Utility/date";
import { Notifier } from "../../Notifications/notifications";
import Editor from "@monaco-editor/react";
import { calculateByteSize } from "../../Utility/math";

type Props = {
    className?: string;
    topicId: TopicId | string;
    topicMessages: Array<Message>;
    onCreateTopicMessage: (message: string) => void;
};

let TopicMessagesList = ({ className, topicMessages, onCreateTopicMessage }: Props) => {
    const [byteSize, setByteSize] = useState(0); // State for byte size
    const [openJsonEditor, setOpenJsonEditor] = React.useState(false);
    const [textEditorValue, setTextEditorValue] = React.useState<string>("{}");
    const [selectedLanguage, setSelectedLanguage] = React.useState<string>("json");
    const [selectedDataType, setSelectedDataType] = React.useState<DataType>(DataType.PLAINTEXT);

    const theme = useTheme();

    const handleOpenJsonEditor = () => {
        setTextEditorValue("{}");
        setOpenJsonEditor(true);
    };

    const onAcceptTextEditor = () => {
        try {
            const parsed = JSON.parse(textEditorValue);
            const jsonString = JSON.stringify(parsed);
            onCreateTopicMessage(jsonString);
            setOpenJsonEditor(false);
        } catch {
            Notifier.showError("Invalid JSON");
        }
    };

    const handleEditorChange = (value: string | undefined) => {
        setTextEditorValue(value ?? "{}");

        const byteSize = calculateByteSize(value ?? "{}");
        setByteSize(byteSize); // Track byte size whenever content changes in the editor
    };

    return (
        <div className={className}>
            {/* Message Input and Data Type */}
            <Box sx={{ display: "flex", gap: "20px", alignItems: "center", width: "100%" }}>
                <Box>
                    <Select
                        size="small"
                        variant="outlined"
                        value={selectedDataType}
                        onChange={(event) => setSelectedDataType(event.target.value as DataType)}
                    >
                        {Object.entries(DataType).map(
                            ([key, value]) =>
                                typeof value === "number" && (
                                    <MenuItem key={value} value={value}>
                                        {key}
                                    </MenuItem>
                                ),
                        )}
                    </Select>
                </Box>

                <Box>
                    <Button variant="contained" color="success" size="medium" onClick={handleOpenJsonEditor}>
                        Send new message
                    </Button>
                </Box>
            </Box>

            {/* Scrollable Message List */}
            <Box className="scroll-container">
                <List sx={{ mb: 2 }}>
                    {Hedera.assembleChunkedMessages(topicMessages)
                        .reverse()
                        .map((msg, index) => {
                            let message = "";
                            const decodedTopicMessage = Hedera.decodeBase64ToString(msg.message);

                            if (selectedDataType === DataType.PLAINTEXT) {
                                message = decodedTopicMessage;
                            } else if (selectedDataType === DataType.JSON) {
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
                                        <ListItemText primary={<Typography sx={{ whiteSpace: "pre-wrap" }}>{message}</Typography>} />

                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                            <Typography fontSize={12} color="text.secondary">
                                                {msg.sequence_number}
                                            </Typography>

                                            <Typography fontSize={12} color="text.secondary">
                                                {timestamp}
                                            </Typography>

                                            <Typography fontSize={12} color="text.secondary">
                                                {msg.payer_account_id}
                                            </Typography>
                                        </Box>
                                        <hr style={{ margin: 0 }} />
                                    </Box>
                                </ListItem>
                            );
                        })}
                </List>
            </Box>

            {/* JSON Editor Dialog */}
            <Dialog open={openJsonEditor} onClose={() => setOpenJsonEditor(false)} fullWidth maxWidth="lg">
                <DialogTitle>
                    <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select value={selectedLanguage} label="Language" onChange={(event) => setSelectedLanguage(event.target.value)}>
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
                    <Typography variant="body2" sx={{ padding: 2 }}>
                        {byteSize} bytes
                    </Typography>
                    <Button onClick={() => setOpenJsonEditor(false)}>Close</Button>
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
