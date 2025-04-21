import * as React from "react";
import { Box, Typography, Paper, Grid, TextField, Button } from "@mui/material";
import styled from "styled-components";
import { Hedera } from "../Hedera/hedera";

type Props = { className?: string };

let ConfigurationView = ({ className }: Props) => {
	const [accountId, setAccountId] = React.useState(Hedera.getAccountId());
	const [privateKey, setPrivateKey] = React.useState(Hedera.getPrivateKey().toStringDer());

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
			<Box sx={{ p: 3 }}>
				<Typography variant="h5" gutterBottom>
					Hedera account info
				</Typography>

				<Paper elevation={3} sx={{ p: 3, maxWidth: 600 }}>
					<Grid container spacing={2} direction="column">
						<Grid item>
							<TextField
								fullWidth
								variant="standard"
								label="Account Id"
								value={accountId}
								onChange={e => setAccountId(e.target.value)}
							/>
						</Grid>

						<Grid item>
							<TextField
								fullWidth
								variant="standard"
								label="Private Key"
								value={privateKey}
								onChange={e => setPrivateKey(e.target.value)}
							/>
						</Grid>

						<Grid item>
							<Button
								variant="contained"
								color="primary"
								onClick={handleSave}
								disabled={!accountId || !privateKey}
							>
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
