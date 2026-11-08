/** A card that fills the remaining height; its table scrolls inside while toolbars stay put. */
export const fillCardSx = { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" } as const;

/** The scrolling part (TableContainer) inside a fill card. */
export const scrollAreaSx = { flex: 1, minHeight: 0, overflow: "auto" } as const;
