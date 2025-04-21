import {
	Typography,
	List,
	ListItem,
	ListItemText,
	Box,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import { Message } from "../../Hedera/types";
import React from "react";
import { TopicId } from "@hashgraph/sdk";
import { Hedera } from "../../Hedera/hedera";
import { DataType } from "../../Enumerations/enumerations";
import styled from "styled-components";

type Props = {
	className?: string;
	topicId: TopicId | string;
	topicMessages: Array<Message>;
	onCreateTopicMessage: (message: string) => void;
};

let TopicMessagesList = ({ className, topicId, topicMessages, onCreateTopicMessage }: Props) => {
	const [messageInput, setMessageInput] = React.useState("");
	const [selectedDataType, setSelectedDataType] = React.useState<DataType>(DataType.PLAINTEXT);

	const handleSend = () => {
		if (messageInput.trim() === "") {
			return;
		}

		onCreateTopicMessage(messageInput);
		setMessageInput(""); // Clear input after sending
	};

	return (
		<div className={className}>
			<Typography variant="h5" gutterBottom>
				{topicId.toString() || "No topic selected"}
			</Typography>

			{/* Message Input */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, width: "100%" }}>
				<Box sx={{ display: "flex", gap: 2, flexGrow: 1, maxWidth: 600 }}>
					<TextField
						fullWidth
						variant="standard"
						value={messageInput}
						placeholder=" Add new topic message"
						onChange={event => setMessageInput(event.target.value)}
					/>

					<Button variant="contained" color="secondary" size="small" onClick={handleSend}>
						Send
					</Button>
				</Box>

				<FormControl variant="standard" sx={{ minWidth: 150 }}>
					<InputLabel>Data type</InputLabel>
					<Select
						label="File Type"
						value={selectedDataType}
						onChange={event => setSelectedDataType(event.target.value as DataType)}
					>
						{Object.entries(DataType).map(
							([key, value]) =>
								typeof value === "number" && (
									<MenuItem key={value} value={value}>
										{key}
									</MenuItem>
								)
						)}
					</Select>
				</FormControl>
			</Box>

			<Typography variant="h6" gutterBottom>
				{`Topic Messages ${topicMessages.length}`}
			</Typography>

			<Box
				sx={{
					maxHeight: "600px", // or any height that fits your layout
					overflowY: "auto",
					pr: 1, // optional padding for scrollbar space
				}}
			>
				<List sx={{ marginBottom: 2 }}>
					{Hedera.assembleChunkedMessages(topicMessages)
						.reverse()
						.map((msg, index) => {
							const decodedTopicMessage = Hedera.decodeBase64ToString(msg.message);

							let message = "";

							switch (selectedDataType) {
								case DataType.PLAINTEXT:
									message = decodedTopicMessage;
									break;
								case DataType.JSON: {
									try {
										const parsed = JSON.parse(decodedTopicMessage); // Convert string to object
										const prettyJson = JSON.stringify(parsed, null, 2);
										message = prettyJson;
									} catch (error) {
										alert(error);
									}

									break;
								}
								default:
									break;
							}

							const topicMessageTimestamp = formatConsensusTime(msg.consensus_timestamp);
							const topicMessagePayerAccount = msg.payer_account_id;

							return (
								<ListItem key={index} alignItems="flex-start">
									<Box
										sx={{
											width: "100%",
											maxWidth: "100%",
											wordBreak: "break-word",
											overflowWrap: "break-word",
										}}
									>
										<ListItemText
											primary={
												<Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
													{message}
												</Typography>
											}
										/>

										<Box sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography fontSize={12} variant="body2" color="text.secondary">
												{msg.sequence_number}
											</Typography>
											<Typography fontSize={12} variant="body2" color="text.secondary">
												{topicMessageTimestamp}
											</Typography>
											<Typography fontSize={12} variant="body2" color="text.secondary">
												{topicMessagePayerAccount}
											</Typography>
										</Box>

										<hr style={{ width: "100%" }} />
									</Box>
								</ListItem>
							);
						})}
				</List>
			</Box>
		</div>
	);
};

TopicMessagesList = styled(TopicMessagesList)`
	padding: 5px 5px 5px 5px;
`;

export { TopicMessagesList };

const formatConsensusTime = (timestamp: string): string => {
	const [seconds] = timestamp.split(".");
	const date = new Date(parseInt(seconds, 10) * 1000);
	return date.toUTCString().slice(5, 22); // e.g., "22 Jan 2024 14:33"
};
