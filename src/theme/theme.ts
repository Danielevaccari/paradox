import { alpha, createTheme, type PaletteMode } from "@mui/material/styles";

/**
 * Minimal, flat theme: neutral greys, one accent colour (the logo blue), 1px dividers instead of
 * shadows or cards, system fonts. Both modes share one structure so layouts never shift.
 */
const palettes = {
    light: {
        accent: "#2f55c9",
        background: "#ffffff",
        subtle: "#f6f7f9",
        text: "#14161a",
        textSecondary: "#5d6470",
        divider: "#e4e6ea",
    },
    dark: {
        accent: "#86a4ff",
        background: "#101215",
        subtle: "#171a1f",
        text: "#eceef1",
        textSecondary: "#9ba1ac",
        divider: "#262a31",
    },
} as const;

export const SYSTEM_FONT = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
export const MONO_FONT = `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;

export const createAppTheme = (mode: PaletteMode) => {
    const p = palettes[mode];

    return createTheme({
        palette: {
            mode,
            primary: { main: p.accent },
            secondary: { main: p.textSecondary },
            background: { default: p.background, paper: p.background },
            text: { primary: p.text, secondary: p.textSecondary },
            divider: p.divider,
            action: { hover: alpha(p.text, 0.05), selected: alpha(p.text, 0.08) },
        },
        shape: { borderRadius: 4 },
        typography: {
            fontFamily: SYSTEM_FONT,
            fontSize: 14,
            h1: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.3 },
            h2: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.35 },
            h3: { fontSize: "0.9375rem", fontWeight: 600 },
            body1: { fontSize: "0.875rem" },
            body2: { fontSize: "0.8125rem" },
            caption: { fontSize: "0.75rem" },
            button: { textTransform: "none", fontWeight: 600 },
            overline: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", lineHeight: 1.5 },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    "html, body, #root": { height: "100%" },
                    body: { WebkitFontSmoothing: "antialiased", overflow: "hidden", fontVariantNumeric: "tabular-nums" },
                    "code, pre, .mono": { fontFamily: MONO_FONT },
                },
            },
            MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: "none" } } },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: { root: { minHeight: 34 }, sizeSmall: { minHeight: 30 } },
            },
            MuiIconButton: { defaultProps: { size: "small" } },
            MuiTextField: { defaultProps: { size: "small" } },
            MuiSelect: { defaultProps: { size: "small" } },
            MuiTooltip: { defaultProps: { arrow: true } },
            MuiToggleButton: {
                styleOverrides: { root: { textTransform: "none", paddingBlock: 4, paddingInline: 12, fontSize: "0.8125rem" } },
            },
            MuiChip: { styleOverrides: { root: { fontWeight: 500, borderRadius: 4, height: 22 }, label: { paddingInline: 8 } } },
            MuiAlert: { styleOverrides: { root: { borderRadius: 4, fontSize: "0.8125rem" } } },
            MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none", borderColor: p.divider } } },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                        paddingBlock: 6,
                        "&.Mui-selected": {
                            backgroundColor: alpha(p.accent, mode === "dark" ? 0.18 : 0.1),
                            color: p.accent,
                            fontWeight: 600,
                            "&:hover": { backgroundColor: alpha(p.accent, mode === "dark" ? 0.24 : 0.14) },
                            "& .MuiListItemIcon-root": { color: p.accent },
                        },
                    },
                },
            },
            MuiListItemIcon: { styleOverrides: { root: { minWidth: 32, "& svg": { fontSize: 20 } } } },
            MuiDialog: { defaultProps: { fullWidth: true }, styleOverrides: { paper: { borderRadius: 6 } } },
            MuiDialogTitle: { styleOverrides: { root: { padding: "14px 20px 8px", fontSize: "1rem", fontWeight: 600 } } },
            MuiDialogContent: { styleOverrides: { root: { padding: "8px 20px" } } },
            MuiDialogActions: { styleOverrides: { root: { padding: "10px 20px 14px", gap: 4 } } },
            MuiMenu: { styleOverrides: { paper: { border: `1px solid ${p.divider}` } } },
        },
    });
};

/** Background for side panels, headers and other quiet surfaces. */
export const subtleBackground = (mode: PaletteMode) => palettes[mode].subtle;
