/** The available themes. Each one has a light and a dark variant (see theme.ts). */
export const THEME_IDS = ["paper", "clean", "forest", "graphite"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = "paper";

export const isThemeId = (value: unknown): value is ThemeId =>
    typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);

/** The user's colour-mode choice: a fixed mode, or follow the operating system. */
export type ModeChoice = "light" | "dark" | "system";
