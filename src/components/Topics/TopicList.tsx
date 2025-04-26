import React from "react";
import { TopicId, TopicInfo } from "@hashgraph/sdk";
import {
	Box,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Paper,
	CircularProgress,
} from "@mui/material";
import { Hedera } from "../../Hedera/hedera";
import { Notifier } from "../../Notifications/notifications";
import styled from "styled-components";

type Props = {
	className?: string;
	topics: Array<TopicInfo>;
	onSelectTopic: (topic: TopicInfo) => void;
	onDeleteTopic: (topicId: TopicId) => void;
	refreshTopicView: () => void;
};

let TopicList = ({ className, topics, onSelectTopic, onDeleteTopic, refreshTopicView }: Props) => {
	const [updatingTopicId, setUpdatingTopicId] = React.useState<string | null>(null);

	const handleSelectTopic = React.useCallback(
		(topic: TopicInfo) => {
			onSelectTopic(topic);
		},
		[onSelectTopic]
	);

	const handleDeleteTopic = React.useCallback(
		(topicId: TopicId) => {
			onDeleteTopic(topicId);
		},
		[onDeleteTopic]
	);

	const handleUpdateTopicExpirationDate = React.useCallback(
		(topic: TopicInfo) => {
			const newExpirationTime = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from NOW max expiration

			Hedera.updateTopic({ topicId: topic.topicId, newExpirationTime: newExpirationTime })
				.then(() => {
					refreshTopicView();
				})
				.catch(Notifier.showError)
				.finally(() => {
					setUpdatingTopicId(null);
				});
		},
		[refreshTopicView]
	);

	return (
		<div className={className}>
			<Box height="100%">
				<Typography variant="h6" gutterBottom>
					Topics
				</Typography>

				<TableContainer component={Paper} style={{ borderRadius: 0, height: "100%", overflowY: "auto" }}>
					<Table size="small" stickyHeader>
						<TableHead
							sx={{
								position: "sticky",
								top: 0,
								backgroundColor: "background.paper",
								zIndex: 1,
							}}
						>
							<TableRow>
								<TableCell>Topic id</TableCell>
								<TableCell>Topic messages</TableCell>
								<TableCell>Memo</TableCell>
								<TableCell>Network</TableCell>
								<TableCell>Expires</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{topics.map(topic => (
								<TableRow
									key={topic.topicId.toString()}
									hover
									sx={{ cursor: "pointer" }}
									onClick={() => handleSelectTopic(topic)}
								>
									<TableCell align="left" sx={{ width: 50 }}>
										<Typography variant="caption">{topic.topicId.toString()}</Typography>
									</TableCell>

									<TableCell align="left" width={120}>
										{topic.sequenceNumber?.toString() || "NaN"}
									</TableCell>

									<TableCell align="left">
										<Typography width={200} variant="body2">
											{topic.topicMemo ?? "Unnamed Topic"}
											{topic.topicMemo && topic.topicMemo.length > 50 ? "..." : ""}
										</Typography>
									</TableCell>

									<TableCell width={70}>{topic.ledgerId?.toString().toUpperCase()}</TableCell>

									<TableCell>
										{topic.expirationTime && formatDateToDDMMYYYY(topic.expirationTime.toDate())}
									</TableCell>

									<TableCell align="right">
										{topic.submitKey?.toString() ===
											Hedera.getPrivateKey().publicKey.toString() && (
											<Button
												size="small"
												color="error"
												disableRipple
												sx={{ mr: 1 }}
												variant="outlined"
												onClick={event => {
													event.stopPropagation(); // prevent row click
													handleDeleteTopic(topic.topicId);
												}}
											>
												Delete
											</Button>
										)}

										{updatingTopicId === topic.topicId.toString() ? (
											<CircularProgress size={20} />
										) : (
											<Button
												size="small"
												disableRipple
												sx={{ mr: 1 }}
												color="info"
												variant="outlined"
												onClick={event => {
													event.stopPropagation(); // prevent row click
													setUpdatingTopicId(topic.topicId.toString());
													handleUpdateTopicExpirationDate(topic);
												}}
											>
												Set Max Expiry
											</Button>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</div>
	);
};

TopicList = styled(TopicList)`
	height: 50vh;
`;

export { TopicList };

function formatDateToDDMMYYYY(date: Date) {
	const d = date instanceof Date ? date : new Date(date);
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();
	return `${day}-${month}-${year}`;
}
