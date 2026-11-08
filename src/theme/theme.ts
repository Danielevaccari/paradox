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
        shape: { borderRadius: 4 },
        spacing: 8,
        typography: {
            fontFamily: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
            fontSize: 13,
            h1: { fontSize: "1.25rem", fontWeight: 650, letterSpacing: "-0.01em", lineHeight: 1.3 },
            h2: { fontSize: "1rem", fontWeight: 600 },
            h3: { fontSize: "0.9375rem", fontWeight: 600 },
            body2: { fontSize: "0.8125rem" },
            subtitle2: { fontWeight: 600 },
            button: { textTransform: "none", fontWeight: 600 },
            overline: { fontWeight: 600, letterSpacing: "0.08em", lineHeight: 1.6 },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    "html, body, #root": { height: "100%" },
                    body: { WebkitFontSmoothing: "antialiased", overflow: "hidden" },
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
            MuiButton: {
                defaultProps: { disableElevation: true, size: "small" },
                styleOverrides: { root: { minHeight: 32, paddingInline: 12 } },
            },
            MuiIconButton: { defaultProps: { size: "small" } },
            MuiTextField: { defaultProps: { size: "small" } },
            MuiSelect: { defaultProps: { size: "small" } },
            MuiInputBase: { styleOverrides: { input: { fontSize: "0.8125rem" } } },
            MuiInputLabel: { styleOverrides: { root: { fontSize: "0.8125rem" } } },
            MuiToggleButton: {
                styleOverrides: { root: { paddingBlock: 3, paddingInline: 10, textTransform: "none", fontSize: "0.75rem" } },
            },
            MuiTooltip: { defaultProps: { arrow: true } },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderColor: p.divider,
                        paddingTop: 5,
                        paddingBottom: 5,
                        paddingLeft: 12,
                        paddingRight: 12,
                        fontSize: "0.8125rem",
                    },
                    head: { fontWeight: 600, fontSize: "0.75rem", color: p.textSecondary, backgroundColor: p.paper, whiteSpace: "nowrap" },
                },
            },
            MuiTablePagination: {
                styleOverrides: {
                    toolbar: { minHeight: 40, paddingLeft: 12 },
                    selectLabel: { fontSize: "0.75rem" },
                    displayedRows: { fontSize: "0.75rem" },
                },
            },
            MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none" } } },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 4,
                        paddingTop: 4,
                        paddingBottom: 4,
                        "&.active": {
                            backgroundColor: alpha(p.primary, mode === "dark" ? 0.16 : 0.1),
                            color: p.primary,
                            "& .MuiListItemIcon-root": { color: p.primary },
                        },
                    },
                },
            },
            MuiListItemIcon: { styleOverrides: { root: { minWidth: 32, "& svg": { fontSize: 20 } } } },
            MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 4 } } },
            MuiAlert: { styleOverrides: { root: { paddingBlock: 0, fontSize: "0.8125rem" } } },
            MuiDialog: { defaultProps: { fullWidth: true } },
            MuiDialogTitle: { styleOverrides: { root: { padding: "12px 16px", fontSize: "1rem" } } },
            MuiDialogContent: { styleOverrides: { root: { padding: "8px 16px" } } },
            MuiDialogActions: { styleOverrides: { root: { padding: "8px 16px" } } },
            MuiCardContent: { styleOverrides: { root: { padding: 16, "&:last-child": { paddingBottom: 16 } } } },
        },
    });
};
