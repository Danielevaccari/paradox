import { alpha, createTheme, type PaletteMode } from "@mui/material/styles";

const palettes = {
    light: {
        primary: "#2563eb",
        secondary: "#64748b",
        background: "#f4f6fa",
        paper: "#ffffff",
        text: "#0f172a",
        textSecondary: "#5b6474",
        divider: "#e3e7ee",
    },
    dark: {
        primary: "#7aa7ff",
        secondary: "#94a3b8",
        background: "#0d1017",
        paper: "#151922",
        text: "#e6e9ef",
        textSecondary: "#9aa3b2",
        divider: "#252b36",
    },
} as const;

export const MONO_FONT = `"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace`;

export const createAppTheme = (mode: PaletteMode) => {
    const p = palettes[mode];

    return createTheme({
        palette: {
            mode,
            primary: { main: p.primary },
            secondary: { main: p.secondary },
            background: { default: p.background, paper: p.paper },
            text: { primary: p.text, secondary: p.textSecondary },
            divider: p.divider,
        },
        shape: { borderRadius: 10 },
        typography: {
            fontFamily: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
            fontSize: 14,
            h1: { fontSize: "1.5rem", fontWeight: 650, letterSpacing: "-0.01em" },
            h2: { fontSize: "1.125rem", fontWeight: 600 },
            h3: { fontSize: "1rem", fontWeight: 600 },
            subtitle2: { fontWeight: 600 },
            button: { textTransform: "none", fontWeight: 600 },
            overline: { fontWeight: 600, letterSpacing: "0.08em" },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { WebkitFontSmoothing: "antialiased" },
                    "code, pre, .mono": { fontFamily: MONO_FONT },
                },
            },
            MuiPaper: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: { backgroundImage: "none" },
                    outlined: { borderColor: p.divider },
                },
            },
            MuiCard: { defaultProps: { variant: "outlined" } },
            MuiButton: { defaultProps: { disableElevation: true } },
            MuiTextField: { defaultProps: { size: "small" } },
            MuiSelect: { defaultProps: { size: "small" } },
            MuiTooltip: { defaultProps: { arrow: true } },
            MuiTableCell: {
                styleOverrides: {
                    root: { borderColor: p.divider, paddingTop: 8, paddingBottom: 8 },
                    head: { fontWeight: 600, color: p.textSecondary, backgroundColor: p.paper, whiteSpace: "nowrap" },
                },
            },
            MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none" } } },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        "&.active": {
                            backgroundColor: alpha(p.primary, mode === "dark" ? 0.16 : 0.1),
                            color: p.primary,
                            "& .MuiListItemIcon-root": { color: p.primary },
                        },
                    },
                },
            },
            MuiListItemIcon: { styleOverrides: { root: { minWidth: 36 } } },
            MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
            MuiDialog: { defaultProps: { fullWidth: true } },
        },
    });
};
