import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    title: string;
    /** Short secondary text next to the title (hidden on phones). */
    hint?: ReactNode;
    actions?: ReactNode;
};

/** One slim line: title on the left, actions on the right, a divider below. */
export const PageHeader = ({ title, hint, actions }: Props) => (
    <Stack
        direction="row"
        spacing={1.5}
        sx={{
            px: { xs: 1.5, sm: 2 },
            minHeight: 52,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: (theme) => theme.custom.headerRule,
            flexShrink: 0,
        }}
    >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline", minWidth: 0 }}>
            <Typography variant="h1" noWrap>
                {title}
            </Typography>
            {hint && (
                <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: "none", sm: "block" } }}>
                    {hint}
                </Typography>
            )}
        </Stack>
        {actions && <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>}
    </Stack>
);
