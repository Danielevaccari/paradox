import "./App.css";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { TopicView } from "./Views/TopicView";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { TransactionView } from "./Views/TransactionsView";
import { ConfigurationView } from "./Views/ConfigurationView";
import { Hedera } from "./Hedera/hedera";

const drawerWidth = 200;

const StyledNavLink = styled(NavLink)(({ theme }) => ({
	textDecoration: "none",
	color: theme.palette.text.primary,
	width: "100%",
	"&.active": {
		backgroundColor: theme.palette.action.selected,
	},
	"&:hover": {
		backgroundColor: theme.palette.action.hover,
	},
}));

const App = () => {
	return (
		<BrowserRouter>
			<Box sx={{ display: "flex" }}>
				<Drawer
					anchor="left"
					variant="permanent"
					sx={{
						width: drawerWidth,
						flexShrink: 0,
						"& .MuiDrawer-paper": {
							width: drawerWidth,
							boxSizing: "border-box",
							display: "flex",
							flexDirection: "column",
						},
					}}
				>
					{/* Drawer Top Content */}
					<Box sx={{ p: 2 }}>
						<Typography variant="h6" sx={{ mb: 1 }}>
							HashChat
						</Typography>

						<Typography variant="body2">{` ${Hedera.getNetworkName().toUpperCase()} `}</Typography>

						{process.env.NODE_ENV === "development" && (
							<Typography variant="caption" color="yellow" fontWeight="bold">
								Debug Build
							</Typography>
						)}
					</Box>

					<List>
						<ListItem disablePadding>
							<StyledNavLink to="/">
								<ListItemButton>
									<ListItemText primary="Topics" />
								</ListItemButton>
							</StyledNavLink>
						</ListItem>

						<ListItem disablePadding>
							<StyledNavLink to="/transaction">
								<ListItemButton>
									<ListItemText primary="Transactions" />
								</ListItemButton>
							</StyledNavLink>
						</ListItem>

						<ListItem disablePadding>
							<StyledNavLink to="/configuration">
								<ListItemButton>
									<ListItemText primary="Configuration" />
								</ListItemButton>
							</StyledNavLink>
						</ListItem>
					</List>

					<Box sx={{ flexGrow: 1 }} />

					<Box sx={{ p: 2 }}>
						<Typography variant="caption" color="text.secondary">
							© Vaccari Oy
						</Typography>
					</Box>
				</Drawer>

				<Box
					component="main"
					sx={{
						flexGrow: 1,
						bgcolor: "background.default",
						height: "100vh",
						overflow: "auto",
					}}
				>
					<Routes>
						<Route path="/" element={<TopicView />} />
						<Route path="/transaction" element={<TransactionView />} />
						<Route path="/configuration" element={<ConfigurationView />} />
					</Routes>
				</Box>
			</Box>
		</BrowserRouter>
	);
};

export default App;
