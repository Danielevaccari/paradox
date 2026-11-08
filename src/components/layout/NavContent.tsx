import {
    AccountCircleOutlined,
    AutoAwesomeRounded,
    DarkModeOutlined,
    ForumOutlined,
    LightModeOutlined,
    ReceiptLongOutlined,
    SettingsOutlined,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    TextField,
    Tooltip,
} from "@mui/material";
import { Link, useLocation } from "react-router";
import { HEDERA_NETWORKS, type HederaNetwork } from "../../../shared/api";
import { useApp } from "../../app/appContext";
import { Logo } from "./Logo";

const NAV_ITEMS = [
    { to: "/", label: "Topics", icon: <ForumOutlined />, isActive: (path: string) => path === "/" || path.startsWith("/topics") },
    { to: "/accounts", label: "Accounts", icon: <AccountCircleOutlined />, isActive: (path: string) => path.startsWith("/accounts") },
    {
        to: "/transactions",
        label: "Transactions",
        icon: <ReceiptLongOutlined />,
        isActive: (path: string) => path.startsWith("/transactions"),
    },
    { to: "/settings", label: "Settings", icon: <SettingsOutlined />, isActive: (path: string) => path.startsWith("/settings") },
];

type Props = {
    onNavigate?: () => void;
    /** Shown as an "Ask AI" button when the chatbot is available. */
    onOpenChat?: () => void;
};

export const NavContent = ({ onNavigate, onOpenChat }: Props) => {
    const { network, setNetwork, themeMode, toggleThemeMode, serverConfig } = useApp();
    const { pathname } = useLocation();
    const readOnly = serverConfig !== null && serverConfig.network !== network;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 1.5 }}>
            <Box sx={{ px: 0.5, pt: 0.5, pb: 2 }}>
                <Logo size={30} />
            </Box>

            <TextField
                select
                fullWidth
                value={network}
                onChange={(event) => setNetwork(event.target.value as HederaNetwork)}
                slotProps={{ htmlInput: { "aria-label": "Network" } }}
                sx={{ "& .MuiSelect-select": { textTransform: "capitalize" } }}
            >
                {HEDERA_NETWORKS.map((value) => (
                    <MenuItem key={value} value={value} sx={{ textTransform: "capitalize" }} dense>
                        {value}
                    </MenuItem>
                ))}
            </TextField>

            {(readOnly || import.meta.env.DEV) && (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.75 }}>
                    {readOnly && (
                        <Tooltip title={`The server signs on ${serverConfig?.network}. This network is read-only.`}>
                            <Chip size="small" label="Read-only" variant="outlined" />
                        </Tooltip>
                    )}
                    {import.meta.env.DEV && <Chip size="small" label="Dev" variant="outlined" />}
                </Box>
            )}

            <List component="nav" dense sx={{ display: "flex", flexDirection: "column", gap: 0.25, mt: 1.5 }}>
                {NAV_ITEMS.map((item) => (
                    <ListItemButton key={item.to} component={Link} to={item.to} selected={item.isActive(pathname)} onClick={onNavigate}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: "inherit" } } }}
                        />
                    </ListItemButton>
                ))}
            </List>

            {onOpenChat && (
                <Button
                    variant="outlined"
                    startIcon={<AutoAwesomeRounded />}
                    onClick={onOpenChat}
                    sx={{ mt: 1.5, justifyContent: "flex-start" }}
                >
                    Ask AI
                </Button>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Tooltip title={themeMode === "dark" ? "Light mode" : "Dark mode"}>
                    <IconButton onClick={toggleThemeMode} aria-label="Toggle colour mode" size="medium">
                        {themeMode === "dark" ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};
