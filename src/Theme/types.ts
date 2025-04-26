type ThemeMode = "light" | "dark";

interface ColorModeContextType {
    toggleColorMode: () => void;
}

export type { ColorModeContextType, ThemeMode };
