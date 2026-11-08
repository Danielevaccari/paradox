import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    title: string;
    subtitle?: ReactNode;
    actions?: ReactNode;
};

/** One compact row: title (with an optional subtitle, hidden on phones) and actions on the right. */
export const PageHeader = ({ title, subtitle, actions }: Props) => (
    <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: { xs: 1, sm: 1.5 }, flexShrink: 0 }}
    >
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1" noWrap>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        {actions && <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>}
    </Stack>
);
