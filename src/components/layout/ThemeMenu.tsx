import { CheckRounded, PaletteOutlined } from "@mui/icons-material";
import { Box, IconButton, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import { useState } from "react";
import { useApp } from "../../app/appContext";
import { THEME_LIST } from "../../theme/theme";
import { ThemeSwatch } from "../common/ThemePicker";

/** Quick theme switcher for the sidebar. The full picker lives in Settings. */
export const ThemeMenu = () => {
    const { themeId, setThemeId, themeMode } = useApp();
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    return (
        <>
            <Tooltip title="Theme">
                <IconButton onClick={(event) => setAnchor(event.currentTarget)} aria-label="Choose theme" size="medium">
                    <PaletteOutlined fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchor}
                open={anchor !== null}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                transformOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                {THEME_LIST.map((theme) => (
                    <MenuItem
                        key={theme.id}
                        selected={theme.id === themeId}
                        onClick={() => {
                            setThemeId(theme.id);
                            setAnchor(null);
                        }}
                        sx={{ gap: 1.5 }}
                    >
                        <ThemeSwatch id={theme.id} mode={themeMode} width={44} />
                        <ListItemText primary={theme.name} />
                        <Box sx={{ width: 20, display: "flex", justifyContent: "flex-end" }}>
                            {theme.id === themeId && <CheckRounded fontSize="small" />}
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
