import { AutoAwesomeRounded } from "@mui/icons-material";
import { Drawer, Fab, Tooltip } from "@mui/material";
import { useState } from "react";
import { ChatPanel } from "./ChatPanel";

export const ChatLauncher = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip title="Ask the Paradox assistant" placement="left">
                <Fab
                    color="primary"
                    variant="extended"
                    onClick={() => setOpen(true)}
                    aria-label="Open assistant"
                    sx={{
                        position: "fixed",
                        right: { xs: 16, md: 24 },
                        bottom: { xs: 16, md: 24 },
                        zIndex: (theme) => theme.zIndex.drawer - 1,
                    }}
                >
                    <AutoAwesomeRounded sx={{ mr: 1 }} />
                    Ask AI
                </Fab>
            </Tooltip>
            {/* keepMounted keeps the conversation while the panel is closed. */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                ModalProps={{ keepMounted: true }}
                slotProps={{ paper: { sx: { width: { xs: "100%", sm: 420 } } } }}
            >
                <ChatPanel onClose={() => setOpen(false)} />
            </Drawer>
        </>
    );
};
