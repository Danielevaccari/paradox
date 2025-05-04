import { styled, useTheme } from "@mui/material/styles";
import { NavLink } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    IconButton,
    Tooltip,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import SunnyIcon from "@mui/icons-material/Sunny";
import { Bedtime, FileDownload, Save } from "@mui/icons-material";
import { useColorMode } from "../main";
import { LocalStorageHelper } from "../LocalStorage/localStorageHelper";
import { useState } from "react";
import { HederaNetwork } from "../Hedera/types";

const drawerWidth = 180;

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
    const [network, setNetwork] = useState<HederaNetwork>(LocalStorageHelper.getHederaNetwork());

    const exportData = () => {
        LocalStorageHelper.exportAppDataToFile();
    };

    const importData = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input.onchange = (event: any) => {
            const file = event.target.files[0];

            if (file) {
                LocalStorageHelper.importAppDataFromFile(file).then(() => {
                    window.location.reload();
                });
            }
        };

        input.click();
    };

    const handleNetworkChange = (event: SelectChangeEvent<HederaNetwork>) => {
        const selected = event.target.value as HederaNetwork;
        setNetwork(selected);
        LocalStorageHelper.setHederaNetwork(selected);

        window.location.reload(); // Apply changes immediately
    };

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
            <Box sx={{ p: "1rem" }}>
                <Typography variant="h6" sx={{ mb: "1rem" }}>
                    Paradox
                </Typography>

                <Select
                    fullWidth
                    size="small"
                    value={network}
                    variant="standard"
                    onChange={handleNetworkChange}
                    sx={{
                        fontSize: "0.75rem",
                        "& .MuiSelect-icon": {
                            display: "none",
                        },
                    }}
                >
                    <MenuItem value="mainnet">MAINNET</MenuItem>
                    <MenuItem value="testnet">TESTNET</MenuItem>
                    <MenuItem value="previewnet">PREVIEWNET</MenuItem>
                    {import.meta.env.VITE_LOCAL_MY_ACCOUNT_ID && <MenuItem value="local">LOCAL</MenuItem>}
                </Select>

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
                    <StyledNavLink to="/transactions">
                        <ListItemButton>
                            <ListItemText primary="Transactions" />
                        </ListItemButton>
                    </StyledNavLink>
                </ListItem>

                <ListItem disablePadding>
                    <StyledNavLink to="/settings">
                        <ListItemButton>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </StyledNavLink>
                </ListItem>
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Box
                sx={{
                    p: "0rem 1rem 0rem 1rem",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                }}
            >
                <Tooltip title="Import Data" arrow>
                    <IconButton onClick={importData}>
                        <Save />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Export Data" arrow>
                    <IconButton onClick={exportData}>
                        <FileDownload />
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={{ p: "1rem", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                    © Paradox Oy
                </Typography>

                <IconButton onClick={toggleColorMode}>{theme.palette.mode === "dark" ? <SunnyIcon /> : <Bedtime />}</IconButton>
            </Box>
        </Drawer>
    );
};

export { AppNavigationDrawer };
