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
import { AppBar, Toolbar, Grid } from "@mui/material";

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
				<AppBar sx={{ zIndex: 10_000 }}>
					<Toolbar>
						<Grid container spacing={2} alignItems="center" sx={{ width: "100%" }}>
							<Grid item>
								<Typography variant="body2">
									{` ${Hedera.getNetworkName().toUpperCase()} `}

									{process.env.NODE_ENV === "development" && (
										<Typography variant="caption" color="yellow" fontWeight="bold">
											Debug Build
										</Typography>
									)}
								</Typography>
							</Grid>
						</Grid>
					</Toolbar>
				</AppBar>

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
							flexDirection: "column", // Make it a vertical flex container
						},
					}}
				>
					{/* Drawer Content */}
					<Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
						<Typography variant="h6">HashChat</Typography>
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

					{/* Spacer to push footer down */}
					<Box sx={{ flexGrow: 1 }} />

					{/* Bottom Footer */}
					<Box sx={{ p: 2 }}>
						<Typography variant="caption" color="text.secondary">
							© Vaccari Oy
						</Typography>
					</Box>
				</Drawer>

				{/* Main Content */}
				<Box
					component="main"
					sx={{
						flexGrow: 1,
						bgcolor: "background.default",
						height: "100%", // Full height
						overflow: "auto",
						marginTop: "64px", // Shift content below the AppBar
					}}
				>
					{/* Routes */}
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
