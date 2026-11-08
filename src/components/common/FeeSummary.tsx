import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Fact = { label: string; value: ReactNode };

/** Compact label/value rows used in the paid-action prompts. */
export const FeeSummary = ({ facts }: { facts: Fact[] }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 2, rowGap: 0.5, my: 1.5 }}>
        {facts.map((fact) => (
            <Box key={fact.label} sx={{ display: "contents" }}>
                <Typography variant="body2" color="text.secondary">
                    {fact.label}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "right", wordBreak: "break-all" }}>
                    {fact.value}
                </Typography>
            </Box>
        ))}
    </Box>
);
