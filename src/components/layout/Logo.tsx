import { Box, Typography } from "@mui/material";

export const Logo = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
            aria-hidden
            sx={{
                width: 30,
                height: 30,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "primary.contrastText",
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                fontWeight: 700,
                fontSize: 16,
            }}
        >
            P
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>Paradox</Typography>
    </Box>
);
