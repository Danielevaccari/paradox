import * as React from "react";
import { Box, Typography, Paper, Grid, TextField, Button } from "@mui/material";
import styled from "styled-components";
import { Hedera } from "../Hedera/hedera";
import { Notifier } from "../Notifications/notifications";

type Props = { className?: string };

let ConfigurationView = ({ className }: Props) => {
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
                    <Grid container spacing={2} direction="column">
                        <Grid>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Account Id"
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                            />
                        </Grid>

                        <Grid>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Private Key"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                        Topic messages
                    </Typography>
                    <Grid container spacing={2} direction="column">
                        <Grid>
                            <TextField
                                fullWidth
                                type="number"
                                variant="outlined"
                                label="Max Transaction Fee (HBAR)"
                                value={maxTopicMessageTxFee}
                                onChange={(e) => setMaxTxFee(Number(e.target.value))}
                            />
                        </Grid>

                        <Grid>
                            <TextField
                                fullWidth
                                type="number"
                                variant="outlined"
                                label="Max Message Chunks"
                                value={maxTopicMessageChunks}
                                onChange={(e) => setMaxChunks(Number(e.target.value))}
                            />
                        </Grid>

                        <Grid>
                            <Button variant="contained" color="primary" onClick={handleSave} disabled={!somethingHasChanged}>
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </div>
    );
};

ConfigurationView = styled(ConfigurationView)`
    height: 100%;
`;

export { ConfigurationView };
