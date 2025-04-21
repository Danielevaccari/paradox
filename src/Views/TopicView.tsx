import { TopicId, TopicInfo } from "@hashgraph/sdk";
import * as React from "react";
import { TopicList } from "../components/Topics/TopicList";

import { Box, Button, Grid, Paper, Switch, TextField, Typography } from "@mui/material";
import { TopicMessagesList } from "../components/Topics/TopicMessagesList";
import { Message } from "../Hedera/types";
import { Hedera } from "../Hedera/hedera";
import { LocalStorageHelper } from "../LocalStorage/localStorageHelper";
import styled from "styled-components";

type Props = {
	className?: string;
};

let TopicView = ({ className }: Props) => {
	const [memo, setMemo] = React.useState<string>("");
	const [isAdminPrivate, setIsAdminPrivate] = React.useState(false);
	const [inputTopicId, setInputTopicId] = React.useState("");
	const [loadingTopic, setLoadingTopic] = React.useState(false);
	const [creatingTopic, setCreatingTopic] = React.useState(false);
	const [topics, setTopics] = React.useState<Array<TopicInfo>>([]);
	const [selectedTopic, setSelectedTopic] = React.useState<TopicInfo | null>(null);
	const [selectedTopicTopicMessages, setSelectedTopicTopicMessages] = React.useState<Array<Message>>([]);

	const onTopicMemoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setMemo(event.target.value);
	};

	const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setInputTopicId(event.target.value);
	}, []);

	const onSelectTopic = React.useCallback((topic: TopicInfo) => {
		setSelectedTopic(topic);
	}, []);

	const onDeleteTopic = React.useCallback((topicId: TopicId) => {
		Hedera.deleteTopicById(topicId).then(() => {
			setTopics(prevState => prevState.filter(topic => topic.topicId !== topicId)); // Delete from state
			LocalStorageHelper.deleteTopicId(topicId.toString()); // Delete from local storage
		});
	}, []);

	const handleFetchTopic = React.useCallback(() => {
		const trimmetTopicId = inputTopicId.trim();

		if (trimmetTopicId.length === 0) {
			return;
		}

		const topicId = TopicId.fromString(trimmetTopicId);

		setLoadingTopic(true); // Loading to true

		Hedera.getTopicInfo(topicId)
			.then((topic: TopicInfo) => {
				setTopics(prev => [topic, ...prev]);
				onSelectTopic(topic);
				LocalStorageHelper.storeTopicId(topic.topicId.toString()); // Store to local storage
			})
			.catch(alert)
			.finally(() => {
				setLoadingTopic(false); // Loading to false
			});
	}, [inputTopicId, onSelectTopic]);

	const onCreateTopic = async () => {
		if (memo.trim() === "") {
			return;
		}

		setCreatingTopic(true);

		let topicId;

		if (isAdminPrivate) {
			topicId = await Hedera.createPrivateAdminTopic(memo);
		} else {
			topicId = await Hedera.createTopic(memo);
		}

		if (!topicId) {
			setCreatingTopic(false);
			return;
		}

		Hedera.getTopicInfo(topicId)
			.then((topic: TopicInfo) => {
				setTopics(prev => [topic, ...prev]);
				setMemo("");
			})
			.finally(() => setCreatingTopic(false));
	};

	const getTopicMessagesByTopicId = (topicId: TopicId | string) => {
		Hedera.mirrorNodeGetTopicMessagesByTopicId(topicId).then(setSelectedTopicTopicMessages);
	};

	const onCreateTopicMessage = React.useCallback(
		(topicMessage: string) => {
			if (!selectedTopic) {
				return;
			}

			Hedera.createTopicMessage(selectedTopic.topicId, topicMessage).then(() => {
				new Promise(resolve => setTimeout(resolve, 5000)).then(() => {
					getTopicMessagesByTopicId(selectedTopic.topicId); // refresh to get newly created topic message
				});
			});
		},
		[selectedTopic]
	);

	React.useEffect(() => {
		// Effect to get topic messages for selected topic
		if (!selectedTopic) {
			return;
		}

		getTopicMessagesByTopicId(selectedTopic.topicId);
	}, [selectedTopic]);

	React.useEffect(() => {
		// Effect to save topics to local storage
		topics.forEach(topic => {
			LocalStorageHelper.storeTopicId(topic.topicId.toString()); // Store to local storage
		});
	}, [topics]);

	React.useEffect(() => {
		// Effect to get topic ids from local storage initially
		const locallySavedTopicIds = LocalStorageHelper.getStoredTopicIds();

		const fetchTopics = async () => {
			const topicInfos = await Promise.all(
				locallySavedTopicIds.map(async savedTopicId => {
					const topicId = TopicId.fromString(savedTopicId);
					return await Hedera.getTopicInfo(topicId);
				})
			);

			setTopics(topicInfos);
		};

		fetchTopics();
	}, []);

	return (
		<div className={className}>
			<Box sx={{ display: "flex", width: "100%" }}>
				{/* Left half */}
				<Box sx={{ width: "40%", p: 2 }}>
					<Paper elevation={3} sx={{ p: 3 }}>
						{/* Look for Topic by Id */}
						<Grid container spacing={2} alignItems="center">
							<Grid item xs={8}>
								<TextField
									fullWidth
									variant="standard"
									value={inputTopicId}
									placeholder="Topic id"
									label="Look for topic by Id"
									onChange={handleInputChange}
								/>
							</Grid>

							<Grid item xs={4}>
								<Button
									fullWidth
									size="small"
									disableRipple
									color="secondary"
									variant="contained"
									disabled={loadingTopic || inputTopicId.length === 0}
									onClick={handleFetchTopic}
								>
									Fetch
								</Button>
							</Grid>
						</Grid>

						{/* Create Topic */}
						<Grid container spacing={2} sx={{ mb: 2 }}>
							<Grid item xs={12}>
								<Typography variant="h6" gutterBottom>
									Create a Topic
								</Typography>
								<TextField
									fullWidth
									value={memo}
									variant="standard"
									label="Topic Memo"
									onChange={onTopicMemoChange}
								/>
							</Grid>

							<Grid item xs={12}>
								<Box display="flex" alignItems="center" justifyContent="space-between">
									<Box display="flex" alignItems="center">
										<Typography variant="body2" sx={{ mr: 1 }}>
											Public
										</Typography>
										<Switch
											checked={isAdminPrivate}
											onChange={e => setIsAdminPrivate(e.target.checked)}
											color="primary"
										/>
										<Typography variant="body2" sx={{ ml: 1 }}>
											Private
										</Typography>
									</Box>

									<Button
										variant="contained"
										color="success"
										size="small"
										disableRipple
										disabled={creatingTopic || memo.length === 0}
										onClick={onCreateTopic}
									>
										Create
									</Button>
								</Box>
							</Grid>
						</Grid>
					</Paper>

					{/* Topic list */}
					{topics.length > 0 && (
						<Box sx={{ maxHeight: "500px", overflowY: "auto", mt: 2 }}>
							<TopicList //
								topics={topics}
								onSelectTopic={onSelectTopic}
								onDeleteTopic={onDeleteTopic}
							/>
						</Box>
					)}
				</Box>

				{/* Right half */}
				{selectedTopic && (
					<Box sx={{ width: "60%" }}>
						<TopicMessagesList //
							topicId={selectedTopic.topicId}
							topicMessages={selectedTopicTopicMessages}
							onCreateTopicMessage={onCreateTopicMessage}
						/>
					</Box>
				)}
			</Box>
		</div>
	);
};

TopicView = styled(TopicView)`
	height: 100%;
`;

export { TopicView };
