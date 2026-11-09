import { createContext, useContext } from "react";
import type { HederaNetwork, ServerConfig } from "../../shared/api";
import type { ModeChoice, ThemeId } from "../theme/themeIds";
import type { ThemeMode } from "./preferences";

export type ServerStatus = { state: "loading" } | { state: "ready"; config: ServerConfig } | { state: "unavailable"; reason: string };

export interface AppContextValue {
    /** Network used for reading (mirror node). */
    network: HederaNetwork;
    setNetwork: (network: HederaNetwork) => void;
    /** The colour mode in effect (a "system" choice is resolved to light or dark). */
    themeMode: ThemeMode;
    modeChoice: ModeChoice;
    setModeChoice: (choice: ModeChoice) => void;
    /** Flips between light and dark (an explicit choice). */
    toggleThemeMode: () => void;
    themeId: ThemeId;
    setThemeId: (id: ThemeId) => void;
    server: ServerStatus;
    /** Server config when the backend answered, otherwise null. */
    serverConfig: ServerConfig | null;
    /** True when the backend can sign on the network currently being viewed. */
    canWrite: boolean;
    /** Why writes are disabled, for tooltips. Null when writes are possible. */
    writeBlockedReason: string | null;
}

export const AppContext = createContext<AppContextValue | null>(null);

export const useApp = () => {
    const value = useContext(AppContext);
    if (!value) {
        throw new Error("useApp must be used inside <AppProviders>");
    }
    return value;
};
