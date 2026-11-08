import { HEDERA_NETWORKS, type HederaNetwork } from "../../shared/api";
import { isEntityId } from "../utils/format";

/** Browser-only preferences in localStorage. Nothing secret is ever stored here. */

export type ThemeMode = "light" | "dark";

const read = (key: string) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const write = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Storage can be unavailable (private mode, quota); preferences are best effort.
    }
};

const readJson = <T>(key: string, fallback: T): T => {
    try {
        const raw = read(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
};

// Keys kept compatible with the previous version of the app, so saved topics survive the update.
const NETWORK_KEY = "hederaNetworkInUse";
const THEME_KEY = "paradox.themeMode";
const FONT_SIZE_KEY = "paradox.messageFontSize";
const TX_TYPE_KEY = "paradox.transactionType";
const topicsKey = (network: HederaNetwork) => `${network}_savedTopicIds`;

export const preferences = {
    getNetwork(): HederaNetwork | null {
        const value = read(NETWORK_KEY) as HederaNetwork | null;
        return value && HEDERA_NETWORKS.includes(value) ? value : null;
    },
    setNetwork: (network: HederaNetwork) => write(NETWORK_KEY, network),

    getThemeMode(): ThemeMode | null {
        const value = read(THEME_KEY);
        return value === "light" || value === "dark" ? value : null;
    },
    setThemeMode: (mode: ThemeMode) => write(THEME_KEY, mode),

    getMessageFontSize() {
        const value = Number(read(FONT_SIZE_KEY));
        return Number.isFinite(value) && value >= 10 && value <= 24 ? value : 13;
    },
    setMessageFontSize: (size: number) => write(FONT_SIZE_KEY, String(size)),

    getTransactionType: () => read(TX_TYPE_KEY) ?? "",
    setTransactionType: (type: string) => write(TX_TYPE_KEY, type),

    getSavedTopicIds(network: HederaNetwork): string[] {
        const ids = readJson<unknown>(topicsKey(network), []);
        return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && isEntityId(id)) : [];
    },
    setSavedTopicIds: (network: HederaNetwork, ids: string[]) => write(topicsKey(network), JSON.stringify([...new Set(ids)])),

    exportToFile(network: HederaNetwork) {
        const data = {
            app: "paradox",
            version: 2,
            network,
            savedTopicIds: preferences.getSavedTopicIds(network),
            themeMode: preferences.getThemeMode(),
            topicMessageFontSize: preferences.getMessageFontSize(),
        };
        const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `paradox-backup_${network}_${stamp}.json`;
        link.click();
        URL.revokeObjectURL(url);
    },

    /** Imports a backup into the given network. Returns how many topic ids were added. */
    async importFromFile(file: File, network: HederaNetwork) {
        const data = JSON.parse(await file.text()) as { savedTopicIds?: unknown; topicMessageFontSize?: unknown };
        if (!Array.isArray(data.savedTopicIds)) {
            throw new Error("This file is not a Paradox backup");
        }

        const current = preferences.getSavedTopicIds(network);
        const incoming = data.savedTopicIds.filter((id): id is string => typeof id === "string" && isEntityId(id));
        const merged = [...new Set([...current, ...incoming])];
        preferences.setSavedTopicIds(network, merged);

        if (typeof data.topicMessageFontSize === "number") {
            preferences.setMessageFontSize(data.topicMessageFontSize);
        }
        return merged.length - current.length;
    },
};
