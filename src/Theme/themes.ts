import { createTheme, PaletteMode } from "@mui/material";

const Colors = {
    light: {
        backgroundDefault: "#f5f5f5", // very soft gray
        backgroundPaper: "#ffffff", // white paper
        textPrimary: "#1a1a1a", // almost black for excellent readability
        textSecondary: "#5f6368", // neutral muted gray
        primaryMain: "#1976d2", // enterprise blue (material blue 700)
        secondaryMain: "#6c757d", // neutral dark gray (like Bootstrap's secondary)
    },
    dark: {
        backgroundDefault: "#121212", // dark background
        backgroundPaper: "#1e1e1e", // slightly lighter for paper
        textPrimary: "#e0e0e0", // light text
        textSecondary: "#a0a0a0", // softer secondary
        textDisabled: "#6d6d6d", // accessible disabled
        primaryMain: "#90caf9", // light blue for dark mode
        secondaryMain: "#b0bec5", // soft muted gray-blue
    },
};

const commonTypography = {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
    fontSize: 14,
};

const commonShape = {
    borderRadius: 0,
};

const commonComponents = {
    MuiPaper: {
        styleOverrides: {
            root: {
                boxShadow: "none",
            },
        },
    },
};

const createCustomTheme = (mode: PaletteMode) => {
    const paletteColors = mode === "light" ? Colors.light : Colors.dark;

    return createTheme({
        palette: {
            mode,
            background: {
                default: paletteColors.backgroundDefault,
                paper: paletteColors.backgroundPaper,
            },
            text: {
                primary: paletteColors.textPrimary,
                secondary: paletteColors.textSecondary,
                ...(mode === "dark" && { disabled: Colors.dark.textDisabled }),
            },
            primary: {
                main: paletteColors.primaryMain,
            },
            secondary: {
                main: paletteColors.secondaryMain,
            },
        },
        typography: {
            ...commonTypography,
            ...(mode === "dark" && {
                allVariants: {
                    color: paletteColors.textPrimary,
                },
            }),
        },
        shape: commonShape,
        components: {
            ...commonComponents,
            ...(mode === "dark" && {
                MuiTypography: {
                    styleOverrides: {
                        root: {
                            color: paletteColors.textPrimary,
                        },
                    },
                },
            }),
        },
    });
};

const lightTheme = createCustomTheme("light");

const darkTheme = createCustomTheme("dark");

export { lightTheme, darkTheme, Colors };
