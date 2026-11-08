import * as React from "react";
import { Box, Typography, Paper, Stack, TextField, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Hedera } from "../Hedera/hedera";
import { Notifier } from "../Notifications/notifications";

type Props = { className?: string };

const ConfigurationViewBase = ({ className }: Props) => {
    const [privateKey, setPrivateKey] = React.useState("");
    const [accountId, setAccountId] = React.useState(Hedera.getAccountId());
    const [maxTopicMessageTxFee, setMaxTxFee] = React.useState(Hedera.getMaxTopicMessageTxFee());
    const [maxTopicMessageChunks, setMaxChunks] = React.useState(Hedera.getMaxTopicMessageChunks());

    const handleSave = () => {
        if (privateKey) {
            Hedera.setPrivateKey(privateKey);
            Notifier.showInfo(`Private key updated`);
        }
        if (accountId) {
            Hedera.setAccountId(accountId);
            Notifier.showInfo(`Account ID set to ${accountId}`);
        }
        if (maxTopicMessageTxFee) {
            Hedera.setMaxTopicMessageTxFee(maxTopicMessageTxFee);
            Notifier.showInfo(`Max transaction fee set to ${maxTopicMessageTxFee} HBAR`);
        }
        if (maxTopicMessageChunks) {
            Hedera.setMaxTopicMessageChunks(maxTopicMessageChunks);
            Notifier.showInfo(`Max message chunks set to ${maxTopicMessageChunks}`);
        }
    };

    const somethingHasChanged =
        accountId !== Hedera.getAccountId() ||
        maxTopicMessageTxFee !== Hedera.getMaxTopicMessageTxFee() ||
        maxTopicMessageChunks !== Hedera.getMaxTopicMessageChunks();

    return (
        <div className={className}>
            <Box>
                <Paper elevation={3} sx={{ p: "1rem" }}>
                    <Typography variant="h5" gutterBottom>
                        Hedera account settings
                    </Typography>
                    <Stack spacing={2}>
                        <Box>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Account Id"
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                            />
                        </Box>

                        <Box>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Private Key"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                            />
                        </Box>
                    </Stack>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                        Topic messages
                    </Typography>
                    <Stack spacing={2}>
                        <Box>
                            <TextField
                                fullWidth
                                type="number"
                                variant="outlined"
                                label="Max Transaction Fee (HBAR)"
                                value={maxTopicMessageTxFee}
                                onChange={(e) => setMaxTxFee(Number(e.target.value))}
                            />
                        </Box>

                        <Box>
                            <TextField
                                fullWidth
                                type="number"
                                variant="outlined"
                                label="Max Message Chunks"
                                value={maxTopicMessageChunks}
                                onChange={(e) => setMaxChunks(Number(e.target.value))}
                            />
                        </Box>

                        <Box>
                            <Button variant="contained" color="primary" onClick={handleSave} disabled={!somethingHasChanged}>
                                Save
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </div>
    );
};

const ConfigurationView = styled(ConfigurationViewBase)`
    height: 100%;
`;

export { ConfigurationView };
