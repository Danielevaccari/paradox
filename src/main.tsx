import React, { useMemo, useState, createContext, useContext } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { lightTheme, darkTheme } from "./Theme/themes";
import { LocalStorageHelper } from "./LocalStorage/localStorageHelper";
import { ColorModeContextType, ThemeMode } from "./Theme/types";

const Root = () => {
    const [mode, setMode] = useState<ThemeMode>(() => LocalStorageHelper.getThemeMode());

    const colorMode = useMemo<ColorModeContextType>(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode: ThemeMode = prevMode === "light" ? "dark" : "light";
                    LocalStorageHelper.setThemeMode(newMode);
                    return newMode;
                });
            },
        }),
        [],
    );

    const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode]);

    return (
        <React.StrictMode>
            <ColorModeContext.Provider value={colorMode}>
                <SnackbarProvider maxSnack={3}>
                    <ThemeProvider theme={theme}>
                        <App />
                    </ThemeProvider>
                </SnackbarProvider>
            </ColorModeContext.Provider>
        </React.StrictMode>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(<Root />);

const ColorModeContext = createContext<ColorModeContextType>({ toggleColorMode: () => {} });

const useColorMode = () => useContext(ColorModeContext);

export { useColorMode };
