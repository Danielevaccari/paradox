import * as React from "react";
import { Box, Typography, Paper, TextField, Button, Grid } from "@mui/material";
import styled from "styled-components";
import { AccountId } from "@hashgraph/sdk";
import { Hedera } from "../Hedera/hedera";

type Props = {
	className?: string;
};

let TransactionView = ({ className }: Props) => {
	const [toAccountId, setToAccountId] = React.useState<string>("");
	const [transferAmount, setTransferAmount] = React.useState<number>(0);

	const onacceptTransaction = async () => {
		if (transferAmount <= 0) {
			alert("Amount must be greater than zero.");
			return;
		}

		try {
			const destinationAccountId = AccountId.fromString(toAccountId);
			const transactionId = await Hedera.sendTransaction(destinationAccountId, transferAmount);

			setToAccountId("");
			setTransferAmount(0);

			alert(`Transaction successful! Transaction Id: ${transactionId}`);
		} catch (error) {
			alert("Error sending transaction: " + error);
		}
	};

	return (
		<div className={className}>
			<Box sx={{ display: "flex", flexDirection: "column", p: 3, gap: 2, width: "50%" }}>
				<Paper elevation={3} sx={{ p: 3 }}>
					<Typography variant="h5" gutterBottom>
						Create a Transaction
					</Typography>

					<Grid container spacing={2} alignItems="center">
						{/* Sending Account */}
						<Grid item xs={4}>
							<Paper elevation={3} sx={{ p: 2 }}>
								<TextField
									fullWidth
									variant="standard"
									disabled
									label="Sending Account Id"
									value={Hedera.getAccountId()}
									InputProps={{
										readOnly: true,
									}}
								/>
							</Paper>
						</Grid>

						{/* Transaction Amount */}
						<Grid item xs={2} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
							<Box sx={{ textAlign: "center" }}>
								<TextField
									fullWidth
									type="number"
									variant="standard"
									label="Amount (HBAR)"
									value={transferAmount}
									onChange={e => setTransferAmount(Number(e.target.value))}
								/>
							</Box>
						</Grid>

						{/* Receiving Account */}
						<Grid item xs={4}>
							<Paper elevation={3} sx={{ p: 2 }}>
								<TextField
									fullWidth
									variant="standard"
									label="Receiving Account Id"
									value={toAccountId}
									onChange={e => setToAccountId(e.target.value)}
								/>
							</Paper>
						</Grid>
					</Grid>

					{/* Submit Button */}
					<Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
						<Button
							color="primary"
							variant="contained"
							disabled={toAccountId.length <= 0 || transferAmount <= 0}
							onClick={onacceptTransaction}
						>
							Send
						</Button>
					</Grid>
				</Paper>
			</Box>
		</div>
	);
};

TransactionView = styled(TransactionView)`
	// You can add any custom styles here if needed
`;

export { TransactionView };
