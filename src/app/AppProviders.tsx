import { CssBaseline, useMediaQuery } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { HederaNetwork } from "../../shared/api";
import { fetchServerConfig } from "../api/serverApi";
import { PaidActionProvider } from "../components/common/PaidActionProvider";
import { createAppTheme } from "../theme/theme";
import { errorMessage } from "../utils/format";
import { AppContext, type AppContextValue, type ServerStatus } from "./appContext";
import { preferences, type ThemeMode } from "./preferences";

export const AppProviders = ({ children }: { children: ReactNode }) => {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", { noSsr: true });
    const [storedTheme, setStoredTheme] = useState<ThemeMode | null>(() => preferences.getThemeMode());
    const themeMode: ThemeMode = storedTheme ?? (prefersDark ? "dark" : "light");

    const [storedNetwork, setStoredNetwork] = useState<HederaNetwork | null>(() => preferences.getNetwork());
    const [server, setServer] = useState<ServerStatus>({ state: "loading" });

    useEffect(() => {
        const controller = new AbortController();
        fetchServerConfig(controller.signal)
            .then((config) => setServer({ state: "ready", config }))
            .catch((error) => {
                if (!controller.signal.aborted) {
                    setServer({ state: "unavailable", reason: errorMessage(error) });
                }
            });
        return () => controller.abort();
    }, []);

    const serverConfig = server.state === "ready" ? server.config : null;
    // Until the user picks a network, follow the server's network (testnet by default).
    const network: HederaNetwork = storedNetwork ?? serverConfig?.network ?? "testnet";

    const setNetwork = useCallback((next: HederaNetwork) => {
        preferences.setNetwork(next);
        setStoredNetwork(next);
    }, []);

    const toggleThemeMode = useCallback(() => {
        const next: ThemeMode = themeMode === "dark" ? "light" : "dark";
        preferences.setThemeMode(next);
        setStoredTheme(next);
    }, [themeMode]);

    const writeBlockedReason = useMemo(() => {
        if (server.state === "loading") {
            return "Connecting to the backend…";
        }
        if (server.state === "unavailable") {
            return `Backend unavailable: ${server.reason}`;
        }
        if (!server.config.features.writes) {
            return "The server has no Hedera account configured";
        }
        if (server.config.network !== network) {
            return `Writes are available on ${server.config.network} only. Switch network to create or submit.`;
        }
        return null;
    }, [server, network]);

    const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

    useEffect(() => {
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.palette.background.default);
    }, [theme]);

    const value = useMemo<AppContextValue>(
        () => ({
            network,
            setNetwork,
            themeMode,
            toggleThemeMode,
            server,
            serverConfig,
            canWrite: writeBlockedReason === null,
            writeBlockedReason,
        }),
        [network, setNetwork, themeMode, toggleThemeMode, server, serverConfig, writeBlockedReason],
    );

    return (
        <AppContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} autoHideDuration={4000}>
                    <PaidActionProvider>{children}</PaidActionProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </AppContext.Provider>
    );
};
