import { createTheme } from "@mui/material";

const lightTheme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#f0f2f5", // Soft bluish-gray background
            paper: "#ffffff", // Neutral white for paper
        },
        text: {
            primary: "#2e3c43", // Gentle dark gray-blue
            secondary: "#546e7a", // Muted slate
        },
        primary: {
            main: "#90a4ae", // Soft steel blue
        },
        secondary: {
            main: "#a1887f", // Warm, muted brown
        },
    },
    shape: {
        borderRadius: 0, // 🔥 This sets borderRadius to 0 globally
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: "none", // Matte look — no shadows
                },
            },
        },
    },
    typography: {
        fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
        fontSize: 14,
    },
});

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#1c1c1e", // Lighter than #121212
            paper: "#2a2a2d", // Lighter than #1d1d1d
        },
        text: {
            primary: "#f0f0f0", // Slightly lighter
            secondary: "#b0b0b0", // Softer gray
            disabled: "#888888", // Easier contrast
        },
        primary: {
            main: "#90a4ae", // Softer blue-gray
        },
        secondary: {
            main: "#bcaaa4", // Softer warm tone
        },
    },
    typography: {
        fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
        fontSize: 14,
        allVariants: {
            color: "#f0f0f0",
        },
    },
    shape: {
        borderRadius: 0, // 🔥 This sets borderRadius to 0 globally
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: "none",
                    backgroundColor: "#2a2a2d", // Match paper
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "#f0f0f0",
                },
            },
        },
    },
});

export { lightTheme, darkTheme };
