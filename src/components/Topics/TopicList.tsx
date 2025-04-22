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
} from "@mui/material";
import { Hedera } from "../../Hedera/hedera";

type Props = {
	topics: Array<TopicInfo>;
	onSelectTopic: (topic: TopicInfo) => void;
	onDeleteTopic: (topicId: TopicId) => void;
};

const TopicList = ({ topics, onSelectTopic, onDeleteTopic }: Props) => {
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

	return (
		<Box>
			<Typography variant="h6" gutterBottom>
				Topics
			</Typography>

			<TableContainer component={Paper} style={{ borderRadius: 0 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Topic id</TableCell>

							<TableCell>Memo</TableCell>

							<TableCell>Network</TableCell>

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
								<TableCell>
									<Typography variant="caption">{topic.topicId.toString()}</Typography>
								</TableCell>

								<TableCell>{topic.topicMemo || "Unnamed Topic"}</TableCell>

								<TableCell>{topic.ledgerId?.toString()}</TableCell>

								<TableCell align="right">
									{/* If admin key is the same as public key then the topic can be deleted */}
									{topic.adminKey === Hedera.getPrivateKey().publicKey && (
										<Button
											size="small"
											color="error"
											disableRipple
											sx={{ mr: 1 }}
											variant="outlined"
											onClick={() => handleDeleteTopic(topic.topicId)}
										>
											Delete
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export { TopicList };
