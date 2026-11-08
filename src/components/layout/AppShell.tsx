import { AutoAwesomeRounded, MenuRounded } from "@mui/icons-material";
import { AppBar, Box, Drawer, IconButton, Toolbar, Tooltip } from "@mui/material";
import { useState, type ReactNode } from "react";
import { useApp } from "../../app/appContext";
import { ChatDrawer } from "../chat/ChatDrawer";
import { Logo } from "./Logo";
import { NavContent } from "./NavContent";

export const DRAWER_WIDTH = 208;
const APP_BAR_HEIGHT = 48;

/**
 * Full-height shell: the page itself never scrolls on list views. Views fill the space and scroll
 * their own rows (tables use sticky headers); content pages scroll inside <main>.
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
        <Box sx={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{ display: { md: "none" }, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
            >
                <Toolbar variant="dense" disableGutters sx={{ minHeight: APP_BAR_HEIGHT, px: 0.5, gap: 0.5 }}>
                    <IconButton onClick={() => setMobileOpen(true)} aria-label="Open menu" size="medium">
                        <MenuRounded />
                    </IconButton>
                    <Logo />
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
                        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", borderColor: "divider" },
                    }}
                >
                    <NavContent onOpenChat={chatEnabled ? openChat : undefined} />
                </Drawer>
            </Box>

            <Box component="main" sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                <Box sx={{ display: { md: "none" }, height: APP_BAR_HEIGHT, flexShrink: 0 }} />
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        maxWidth: 1600,
                        px: { xs: 1, sm: 2, lg: 3 },
                        py: { xs: 1, sm: 2 },
                    }}
                >
                    {children}
                </Box>
            </Box>

            {chatEnabled && <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />}
        </Box>
    );
};
