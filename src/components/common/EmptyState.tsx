import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    icon?: ReactNode;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
};

export const EmptyState = ({ icon, title, description, action }: Props) => (
    <Box sx={{ py: { xs: 4, md: 6 }, px: 2, textAlign: "center", color: "text.secondary" }}>
        {icon && <Box sx={{ mb: 1.5, "& svg": { fontSize: 40, opacity: 0.6 } }}>{icon}</Box>}
        <Typography variant="h3" color="text.primary">
            {title}
        </Typography>
        {description && (
            <Typography variant="body2" sx={{ mt: 0.75, maxWidth: 420, mx: "auto" }}>
                {description}
            </Typography>
        )}
        {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
);
