import { MenuRounded } from "@mui/icons-material";
import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { NavContent } from "./NavContent";

export const DRAWER_WIDTH = 232;

export const AppShell = ({ children }: { children: ReactNode }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Box sx={{ display: "flex", minHeight: "100dvh" }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{ display: { md: "none" }, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
            >
                <Toolbar sx={{ gap: 1 }}>
                    <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                        <MenuRounded />
                    </IconButton>
                    <Logo />
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
                    <NavContent onNavigate={() => setMobileOpen(false)} />
                </Drawer>
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", borderColor: "divider" },
                    }}
                >
                    <NavContent />
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    px: { xs: 2, sm: 3, lg: 4 },
                    pt: { xs: 10, md: 4 },
                    pb: 12,
                    maxWidth: 1400,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};
