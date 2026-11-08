import { Button, Tooltip, type ButtonProps } from "@mui/material";
import { useApp } from "../../app/appContext";

type Props = ButtonProps & {
    /** Extra reason the action is unavailable (shown as tooltip and disables the button). */
    blockedReason?: string | null;
};

/** A button for actions that need the backend to sign. Disabled, with the reason as tooltip, when it can't. */
export const WriteButton = ({ disabled, blockedReason, ...props }: Props) => {
    const { writeBlockedReason } = useApp();
    const reason = writeBlockedReason ?? blockedReason ?? null;
    const button = <Button {...props} disabled={disabled || reason !== null} />;

    if (reason === null) {
        return button;
    }
    return (
        <Tooltip title={reason}>
            <span>{button}</span>
        </Tooltip>
    );
};
