import * as React from "react";
import { Box, Typography, Paper, Grid, TextField, Button } from "@mui/material";
import styled from "styled-components";
import { Hedera } from "../Hedera/hedera";

type Props = { className?: string };

let ConfigurationView = ({ className }: Props) => {
    const [privateKey, setPrivateKey] = React.useState("");
    const [accountId, setAccountId] = React.useState(Hedera.getAccountId());
    // const [privateKey, setPrivateKey] = React.useState(Hedera.getPrivateKey().toStringDer());

    const handleSave = () => {
        if (privateKey) {
            Hedera.setPrivateKey(privateKey);
        }

        if (accountId) {
            Hedera.setAccountId(accountId);
        }
    };

    return (
        <div className={className}>
            <Box>
                <Paper elevation={3} sx={{ p: "1rem" }}>
                    <Typography variant="h5" gutterBottom>
                        Hedera account info
                    </Typography>
                    <Grid container spacing={2} direction="column">
                        <Grid>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Account Id"
                                value={accountId}
                                onChange={(event) => setAccountId(event.target.value)}
                            />
                        </Grid>

                        <Grid>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Private Key"
                                value={privateKey}
                                onChange={(event) => setPrivateKey(event.target.value)}
                            />
                        </Grid>

                        <Grid>
                            <Button variant="contained" color="primary" onClick={handleSave} disabled={!accountId || !privateKey}>
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
