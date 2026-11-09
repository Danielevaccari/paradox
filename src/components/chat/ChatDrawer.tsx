import { Drawer } from "@mui/material";
import { ChatPanel } from "./ChatPanel";

type Props = { open: boolean; onClose: () => void };

/** keepMounted keeps the conversation while the panel is closed. */
export const ChatDrawer = ({ open, onClose }: Props) => (
    <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 400 }, bgcolor: "background.paper" } } }}
    >
        <ChatPanel onClose={onClose} />
    </Drawer>
);
