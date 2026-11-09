import { Box, Typography } from "@mui/material";
import { useApp } from "../../app/appContext";
import { THEME_LIST, themeSwatch } from "../../theme/theme";
import type { ThemeId } from "../../theme/themeIds";

/** A tiny page in the theme's own colours: sidebar, text lines and an accent button. */
export const ThemeSwatch = ({ id, mode, width = 120 }: { id: ThemeId; mode: "light" | "dark"; width?: number }) => {
    const c = themeSwatch(id, mode);
    return (
        <Box
            aria-hidden
            sx={{
                display: "flex",
                width,
                height: width * 0.58,
                border: `1px solid ${c.line}`,
                bgcolor: c.bg,
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            <Box
                sx={{
                    width: "28%",
                    bgcolor: c.sidebar,
                    borderRight: `1px solid ${c.line}`,
                    p: "7%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "9%",
                }}
            >
                <Box sx={{ height: "10%", bgcolor: c.ink, opacity: 0.85 }} />
                <Box sx={{ height: "10%", bgcolor: c.ink, opacity: 0.3 }} />
                <Box sx={{ height: "10%", bgcolor: c.ink, opacity: 0.3 }} />
            </Box>
            <Box sx={{ flex: 1, p: "7%", display: "flex", flexDirection: "column", gap: "9%" }}>
                <Box sx={{ height: "10%", width: "65%", bgcolor: c.ink, opacity: 0.85 }} />
                <Box sx={{ height: "7%", width: "90%", bgcolor: c.ink, opacity: 0.25 }} />
                <Box sx={{ height: "7%", width: "75%", bgcolor: c.ink, opacity: 0.25 }} />
                <Box sx={{ mt: "auto", height: "16%", width: "38%", bgcolor: c.accent }} />
            </Box>
        </Box>
    );
};

/** Choose the look of the app. Every theme has a light and a dark variant. */
export const ThemePicker = () => {
    const { themeId, setThemeId, themeMode } = useApp();

    return (
        <Box
            role="radiogroup"
            aria-label="Theme"
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gap: 1.5,
            }}
        >
            {THEME_LIST.map((theme) => {
                const selected = theme.id === themeId;
                return (
                    <Box
                        key={theme.id}
                        component="button"
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setThemeId(theme.id)}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 1,
                            p: 1.25,
                            textAlign: "left",
                            font: "inherit",
                            color: "text.primary",
                            cursor: "pointer",
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: selected ? "primary.main" : "divider",
                            outline: selected ? "1px solid" : "none",
                            outlineColor: "primary.main",
                            borderRadius: 1,
                            "&:hover": { borderColor: "text.secondary" },
                            "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                        }}
                    >
                        <ThemeSwatch id={theme.id} mode={themeMode} width={150} />
                        <Box>
                            <Typography variant="h3" component="span">
                                {theme.name}
                                {selected ? " ✓" : ""}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="div">
                                {theme.description}
                            </Typography>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};
