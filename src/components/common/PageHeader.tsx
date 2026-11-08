import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    title: string;
    subtitle?: ReactNode;
    actions?: ReactNode;
};

export const PageHeader = ({ title, subtitle, actions }: Props) => (
    <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ alignItems: { xs: "stretch", sm: "flex-end" }, justifyContent: "space-between", mb: { xs: 2, md: 3 } }}
    >
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1">{title}</Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        {actions && <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>{actions}</Box>}
    </Stack>
);
