import { alpha, createTheme, type PaletteMode } from "@mui/material/styles";
import { DEFAULT_THEME_ID, THEME_IDS, type ThemeId } from "./themeIds";

declare module "@mui/material/styles" {
    interface Theme {
        custom: {
            /** CSS border for the rule under page headers. */
            headerRule: string;
        };
    }
    interface ThemeOptions {
        custom?: { headerRule: string };
    }
}

interface Palette {
    bg: string; // page
    raised: string; // sheets: dialogs, detail pane, chat
    sidebar: string;
    ink: string; // text
    inkSoft: string; // secondary text
    line: string; // dividers
    accent: string;
    onAccent: string;
    success: string;
    error: string;
    warning: string;
    info: string;
}

interface ThemeDefinition {
    name: string;
    description: string;
    bodyFont: string;
    headingFont: string;
    fontSize: number;
    radius: number;
    /** Buttons in small uppercase letters (stamp style) instead of normal case. */
    uppercaseButtons: boolean;
    /** The current page and toggles are stamped in ink; otherwise they get an accent tint. */
    inkSelection: boolean;
    /** A thick ink rule under page headers and a hard offset shadow on dialogs. */
    printed: boolean;
    light: Palette;
    dark: Palette;
}

export const SYSTEM_FONT = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
export const MONO_FONT = `"IBM Plex Mono", ui-monospace, "Cascadia Mono", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace`;
export const SERIF_FONT = `"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif`;

export const THEMES: Record<ThemeId, ThemeDefinition> = {
    // Matte paper, minimal retro: warm paper, ink-brown text, vermilion stamp accent, typewriter mono.
    paper: {
        name: "Paper",
        description: "Matte paper, ink and a vermilion stamp. Typewriter type.",
        bodyFont: MONO_FONT,
        headingFont: SERIF_FONT,
        fontSize: 13,
        radius: 2,
        uppercaseButtons: true,
        inkSelection: true,
        printed: true,
        light: {
            bg: "#f2ede1",
            raised: "#f8f4ea",
            sidebar: "#e9e2d2",
            ink: "#2a2620",
            inkSoft: "#6b6354",
            line: "#cfc6b2",
            accent: "#b4432b",
            onAccent: "#f8f4ea",
            success: "#4f6b3d",
            error: "#a33a2c",
            warning: "#a8741a",
            info: "#3f5f7a",
        },
        dark: {
            bg: "#1d1a16",
            raised: "#26221d",
            sidebar: "#171410",
            ink: "#e7dfcc",
            inkSoft: "#a89f8b",
            line: "#3b352c",
            accent: "#e0905f",
            onAccent: "#1d1a16",
            success: "#8fb070",
            error: "#e07a6a",
            warning: "#d9a84a",
            info: "#7fa6c4",
        },
    },
    // Neutral and modern: system fonts, cool greys, one blue accent.
    clean: {
        name: "Clean",
        description: "Neutral and modern. System fonts, cool greys, blue accent.",
        bodyFont: SYSTEM_FONT,
        headingFont: SYSTEM_FONT,
        fontSize: 14,
        radius: 4,
        uppercaseButtons: false,
        inkSelection: false,
        printed: false,
        light: {
            bg: "#ffffff",
            raised: "#ffffff",
            sidebar: "#f6f7f9",
            ink: "#14161a",
            inkSoft: "#5d6470",
            line: "#e4e6ea",
            accent: "#2f55c9",
            onAccent: "#ffffff",
            success: "#1f7a3d",
            error: "#c0392b",
            warning: "#a86a00",
            info: "#2f55c9",
        },
        dark: {
            bg: "#101215",
            raised: "#14171b",
            sidebar: "#171a1f",
            ink: "#eceef1",
            inkSoft: "#9ba1ac",
            line: "#262a31",
            accent: "#86a4ff",
            onAccent: "#101215",
            success: "#5fc58a",
            error: "#f08a7e",
            warning: "#e0b25a",
            info: "#86a4ff",
        },
    },
    // Calm and organic: soft green-greys, a serif for headings, one forest-green accent.
    forest: {
        name: "Forest",
        description: "Calm and organic. Soft greens, serif headings.",
        bodyFont: SYSTEM_FONT,
        headingFont: SERIF_FONT,
        fontSize: 14,
        radius: 4,
        uppercaseButtons: false,
        inkSelection: false,
        printed: false,
        light: {
            bg: "#eff2ea",
            raised: "#f7f9f3",
            sidebar: "#e3e8dc",
            ink: "#1f2a22",
            inkSoft: "#5a6a5e",
            line: "#cbd4c4",
            accent: "#2f6b4a",
            onAccent: "#f7f9f3",
            success: "#2f6b4a",
            error: "#a8402f",
            warning: "#9a6b12",
            info: "#3a6580",
        },
        dark: {
            bg: "#131a15",
            raised: "#1a221c",
            sidebar: "#0e130f",
            ink: "#e3eadf",
            inkSoft: "#9aab9e",
            line: "#28342b",
            accent: "#7fc29a",
            onAccent: "#0e130f",
            success: "#7fc29a",
            error: "#e58a78",
            warning: "#dcb25c",
            info: "#86b3cf",
        },
    },
    // Black on grey, nothing else: mono type, square corners, ink for everything that matters.
    graphite: {
        name: "Graphite",
        description: "Black on grey and nothing else. Mono type, square corners.",
        bodyFont: MONO_FONT,
        headingFont: MONO_FONT,
        fontSize: 13,
        radius: 0,
        uppercaseButtons: true,
        inkSelection: true,
        printed: true,
        light: {
            bg: "#efefed",
            raised: "#f7f7f5",
            sidebar: "#e3e3e0",
            ink: "#141414",
            inkSoft: "#5c5c5a",
            line: "#c9c9c5",
            accent: "#141414",
            onAccent: "#f7f7f5",
            success: "#3d6b3d",
            error: "#9c2f2f",
            warning: "#8a6a14",
            info: "#3c5a78",
        },
        dark: {
            bg: "#121212",
            raised: "#1a1a1a",
            sidebar: "#0c0c0c",
            ink: "#ededed",
            inkSoft: "#9a9a9a",
            line: "#2c2c2c",
            accent: "#ededed",
            onAccent: "#121212",
            success: "#7fb87f",
            error: "#e07a7a",
            warning: "#d6b45a",
            info: "#86a9cc",
        },
    },
};

export const THEME_LIST = THEME_IDS.map((id) => ({ id, ...THEMES[id] }));

const palette = (id: ThemeId, mode: PaletteMode) => THEMES[id][mode];

/** Four colours that identify a theme, for swatches in the picker. */
export const themeSwatch = (id: ThemeId, mode: PaletteMode) => {
    const p = palette(id, mode);
    return { bg: p.bg, sidebar: p.sidebar, ink: p.ink, accent: p.accent, line: p.line };
};

/** Colours for the Monaco message editor so it matches the theme. */
export const editorColors = (id: ThemeId, mode: PaletteMode) => {
    const p = palette(id, mode);
    return {
        "editor.background": p.raised,
        "editor.foreground": p.ink,
        "editorLineNumber.foreground": p.inkSoft,
        "editorLineNumber.activeForeground": p.ink,
        "editor.lineHighlightBackground": p.bg,
        "editor.selectionBackground": alpha(p.accent, 0.25),
        "editorCursor.foreground": p.accent,
        "editorGutter.background": p.raised,
    };
};

export const createAppTheme = (id: ThemeId = DEFAULT_THEME_ID, mode: PaletteMode = "light") => {
    const def = THEMES[id];
    const p = palette(id, mode);
    const field = alpha(p.ink, mode === "dark" ? 0.06 : 0.025);
    const selectedBg = def.inkSelection ? p.ink : alpha(p.accent, mode === "dark" ? 0.2 : 0.11);
    const selectedFg = def.inkSelection ? p.bg : p.accent;

    return createTheme({
        palette: {
            mode,
            primary: { main: p.accent, contrastText: p.onAccent },
            secondary: { main: p.inkSoft },
            success: { main: p.success },
            error: { main: p.error },
            warning: { main: p.warning },
            info: { main: p.info },
            background: { default: p.bg, paper: p.raised },
            text: { primary: p.ink, secondary: p.inkSoft },
            divider: p.line,
            action: { hover: alpha(p.ink, 0.05), selected: alpha(p.ink, 0.08) },
        },
        custom: { headerRule: def.printed ? `2px solid ${p.ink}` : `1px solid ${p.line}` },
        shape: { borderRadius: def.radius },
        typography: {
            fontFamily: def.bodyFont,
            fontSize: def.fontSize,
            h1: { fontFamily: def.headingFont, fontSize: "1.375rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" },
            h2: { fontFamily: def.headingFont, fontSize: "1.1875rem", fontWeight: 700, lineHeight: 1.3 },
            h3: { fontFamily: def.headingFont, fontSize: "1rem", fontWeight: 700 },
            body1: { fontSize: "0.8125rem", lineHeight: 1.5 },
            body2: { fontSize: "0.75rem", lineHeight: 1.5 },
            caption: { fontSize: "0.6875rem" },
            button: def.uppercaseButtons
                ? { textTransform: "uppercase", fontWeight: 600, fontSize: "0.6875rem", letterSpacing: "0.07em" }
                : { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem" },
            overline: { fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.12em", lineHeight: 1.6 },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    "html, body, #root": { height: "100%" },
                    body: { WebkitFontSmoothing: "antialiased", overflow: "hidden", fontVariantNumeric: "tabular-nums" },
                    "code, pre, .mono": { fontFamily: MONO_FONT },
                    "::selection": { backgroundColor: alpha(p.accent, 0.28) },
                    // Thin, quiet scrollbars that belong to the page.
                    "*": { scrollbarWidth: "thin", scrollbarColor: `${p.line} transparent` },
                    "*::-webkit-scrollbar": { width: 10, height: 10 },
                    "*::-webkit-scrollbar-thumb": { backgroundColor: p.line, borderRadius: 0, border: `2px solid ${p.bg}` },
                    "*::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                },
            },
            MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: "none" } } },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: { minHeight: 34, borderRadius: def.radius },
                    sizeSmall: { minHeight: 30 },
                    outlined: { "&:hover": { backgroundColor: alpha(p.ink, 0.05) } },
                },
            },
            MuiIconButton: { defaultProps: { size: "small" } },
            MuiTextField: { defaultProps: { size: "small" } },
            MuiSelect: { defaultProps: { size: "small" } },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: field,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(p.ink, 0.28) },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: alpha(p.ink, 0.5) },
                    },
                },
            },
            MuiTooltip: {
                defaultProps: { arrow: true },
                styleOverrides: {
                    tooltip: {
                        backgroundColor: p.ink,
                        color: p.bg,
                        fontFamily: def.bodyFont,
                        fontSize: "0.6875rem",
                        borderRadius: def.radius,
                    },
                    arrow: { color: p.ink },
                },
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: {
                        paddingBlock: 4,
                        paddingInline: 12,
                        borderColor: alpha(p.ink, 0.28),
                        "&.Mui-selected": { backgroundColor: selectedBg, color: selectedFg, "&:hover": { backgroundColor: selectedBg } },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: { fontWeight: 500, borderRadius: def.radius, height: 22, fontSize: "0.6875rem" },
                    outlined: { borderColor: alpha(p.ink, 0.35) },
                    label: { paddingInline: 8 },
                },
            },
            MuiAlert: { styleOverrides: { root: { borderRadius: def.radius, fontSize: "0.75rem", border: `1px solid ${p.line}` } } },
            MuiDivider: { styleOverrides: { root: { borderColor: p.line } } },
            MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none", backgroundColor: p.sidebar, borderColor: p.line } } },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: def.radius,
                        paddingBlock: 6,
                        "&.Mui-selected": {
                            backgroundColor: selectedBg,
                            color: selectedFg,
                            fontWeight: 600,
                            "&:hover": { backgroundColor: selectedBg },
                            "& .MuiListItemIcon-root": { color: selectedFg },
                        },
                    },
                },
            },
            MuiListItemIcon: { styleOverrides: { root: { minWidth: 32, "& svg": { fontSize: 19 } } } },
            MuiDialog: {
                defaultProps: { fullWidth: true },
                styleOverrides: {
                    paper: {
                        borderRadius: def.radius,
                        border: `1px solid ${alpha(p.ink, def.printed ? 0.55 : 0.2)}`,
                        ...(def.printed ? { boxShadow: `4px 4px 0 ${alpha(p.ink, 0.18)}` } : {}),
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: { root: { padding: "14px 20px 8px", fontFamily: def.headingFont, fontSize: "1.125rem", fontWeight: 700 } },
            },
            MuiDialogContent: { styleOverrides: { root: { padding: "8px 20px" } } },
            MuiDialogActions: { styleOverrides: { root: { padding: "10px 20px 14px", gap: 4 } } },
            MuiMenu: { styleOverrides: { paper: { border: `1px solid ${alpha(p.ink, 0.35)}`, borderRadius: def.radius } } },
        },
    });
};
