import { styled, useTheme } from "@mui/material/styles";
import { NavLink } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, IconButton } from "@mui/material";
import SunnyIcon from "@mui/icons-material/Sunny";
import { Bedtime } from "@mui/icons-material";
import { Hedera } from "../Hedera/hedera";
import { useColorMode } from "../main";

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

const AppNavigationDrawer = () => {
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();

    return (
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
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Paradox
                </Typography>

                <Typography variant="body2">{` ${Hedera.getNetworkName().toUpperCase()} `}</Typography>

                {process.env.NODE_ENV === "development" && (
                    <Typography variant="caption" color="orange" fontWeight="bold">
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
                    <StyledNavLink to="/Accounts">
                        <ListItemButton>
                            <ListItemText primary="Accounts" />
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

            <Box sx={{ p: 2, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                    © Paradox Oy
                </Typography>

                <IconButton onClick={toggleColorMode}>{theme.palette.mode === "dark" ? <SunnyIcon /> : <Bedtime />}</IconButton>
            </Box>
        </Drawer>
    );
};

export { AppNavigationDrawer };

export { drawerWidth };
