import { AutoAwesomeRounded, MenuRounded } from "@mui/icons-material";
import { AppBar, Box, Drawer, IconButton, Toolbar, Tooltip } from "@mui/material";
import { useState, type ReactNode } from "react";
import { useApp } from "../../app/appContext";
import { ChatDrawer } from "../chat/ChatDrawer";
import { Logo } from "./Logo";
import { NavContent } from "./NavContent";

export const DRAWER_WIDTH = 200;
const APP_BAR_HEIGHT = 48;

/**
 * Full-height shell with no page padding: views use all the space and scroll their own content
 * (list rows, message lists), so the page itself never scrolls.
 */
export const AppShell = ({ children }: { children: ReactNode }) => {
    const { serverConfig } = useApp();
    const chatEnabled = Boolean(serverConfig?.features.chat);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const openChat = () => {
        setMobileOpen(false);
        setChatOpen(true);
    };

    return (
        <Box sx={{ display: "flex", height: "100dvh", overflow: "hidden", bgcolor: "background.default" }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    display: { md: "none" },
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                    backgroundImage: "none",
                }}
            >
                <Toolbar variant="dense" disableGutters sx={{ minHeight: APP_BAR_HEIGHT, px: 0.5, gap: 0.5 }}>
                    <IconButton onClick={() => setMobileOpen(true)} aria-label="Open menu" size="medium">
                        <MenuRounded />
                    </IconButton>
                    <Logo size={24} />
                    <Box sx={{ flexGrow: 1 }} />
                    {chatEnabled && (
                        <Tooltip title="Ask AI">
                            <IconButton color="primary" onClick={openChat} aria-label="Open assistant" size="medium">
                                <AutoAwesomeRounded />
                            </IconButton>
                        </Tooltip>
                    )}
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
                >
                    <NavContent onNavigate={() => setMobileOpen(false)} onOpenChat={chatEnabled ? openChat : undefined} />
                </Drawer>
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
                    }}
                >
                    <NavContent onOpenChat={chatEnabled ? openChat : undefined} />
                </Drawer>
            </Box>

            <Box component="main" sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box sx={{ display: { md: "none" }, height: APP_BAR_HEIGHT, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</Box>
            </Box>

            {chatEnabled && <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />}
        </Box>
    );
};
