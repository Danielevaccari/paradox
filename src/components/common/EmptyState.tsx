import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: Props) => (
    <Box sx={{ py: { xs: 5, md: 8 }, px: 2, textAlign: "center" }}>
        <Typography variant="h3">{title}</Typography>
        {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 420, mx: "auto" }}>
                {description}
            </Typography>
        )}
        {action && <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>{action}</Box>}
    </Box>
);
