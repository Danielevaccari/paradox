import React from "react";
import { TopicId, TopicInfo } from "@hashgraph/sdk";
import { List, ListItem, ListItemText, Button, Typography, Box, Stack } from "@mui/material";
import { formatConsensusTime } from "../../Utility/date";

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

			<List>
				{topics.map(topic => (
					<ListItem
						key={topic.topicId.toString()}
						sx={{
							backgroundColor: theme => theme.palette.background.paper,
							mb: 1,
							px: 2,
							py: 1.5,
						}}
						secondaryAction={
							<Stack direction="row" spacing={1}>
								{topic.adminKey && (
									// Only topics with an admin key can be deleted
									<Button
										size="small"
										color="error"
										disableRipple
										variant="outlined"
										onClick={() => handleDeleteTopic(topic.topicId)}
									>
										Delete
									</Button>
								)}

								<Button
									size="small"
									variant="contained"
									color="primary"
									disableRipple
									onClick={() => handleSelectTopic(topic)}
								>
									Select
								</Button>
							</Stack>
						}
					>
						<ListItemText
							primary={topic.topicMemo || "Unnamed Topic"}
							secondary={topic.topicId.toString()}
						/>
					</ListItem>
				))}
			</List>
		</Box>
	);
};

export { TopicList };
