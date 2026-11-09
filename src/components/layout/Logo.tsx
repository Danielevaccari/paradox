import { Box, Typography, useTheme } from "@mui/material";

/**
 * The Paradox mark: a Penrose triangle, an impossible loop of three beams. The shapes are the same as
 * in public/favicon.svg. Colours work in light and dark mode.
 */
const POLYGONS: ReadonlyArray<{ tone: 0 | 1 | 2; points: string }> = [
    { tone: 0, points: "25,47.16 19.75,38.06 14.5,47.16 19.75,56.25" },
    { tone: 1, points: "9.25,38.06 19.75,38.06 14.5,47.16 4,47.16" },
    { tone: 2, points: "9.25,56.25 19.75,56.25 14.5,47.16 4,47.16" },
    { tone: 0, points: "37.25,25.94 32,16.84 19.75,38.06 25,47.16" },
    { tone: 1, points: "21.5,16.84 32,16.84 19.75,38.06 9.25,38.06" },
    { tone: 0, points: "42.5,16.84 37.25,7.75 32,16.84 37.25,25.94" },
    { tone: 1, points: "26.75,7.75 37.25,7.75 32,16.84 21.5,16.84" },
    { tone: 0, points: "54.75,38.06 42.5,16.84 37.25,25.94 49.5,47.16" },
    { tone: 2, points: "39,47.16 49.5,47.16 37.25,25.94 26.75,25.94" },
    { tone: 0, points: "60,47.16 54.75,38.06 49.5,47.16 54.75,56.25" },
    { tone: 2, points: "44.25,56.25 54.75,56.25 49.5,47.16 39,47.16" },
    { tone: 1, points: "19.75,38.06 44.25,38.06 39,47.16 14.5,47.16" },
    { tone: 2, points: "19.75,56.25 44.25,56.25 39,47.16 14.5,47.16" },
    { tone: 1, points: "9.25,38.06 19.75,38.06 14.5,47.16 4,47.16" },
    { tone: 2, points: "9.25,56.25 19.75,56.25 14.5,47.16 4,47.16" },
];

/** The mark takes its three tones from the theme's accent colour. */
export const LogoMark = ({ size = 28 }: { size?: number }) => {
    const { primary } = useTheme().palette;
    const tones = [primary.light, primary.main, primary.dark] as const;
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Paradox" style={{ display: "block", flexShrink: 0 }}>
            {POLYGONS.map((polygon, index) => (
                <polygon
                    key={index}
                    fill={tones[polygon.tone]}
                    stroke={tones[polygon.tone]}
                    strokeWidth={0.35}
                    strokeLinejoin="round"
                    points={polygon.points}
                />
            ))}
        </svg>
    );
};

/** Icon and wordmark side by side. */
export const Logo = ({ size = 28 }: { size?: number }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
        <LogoMark size={size} />
        <Typography
            component="span"
            sx={{
                fontFamily: (theme) => theme.typography.h1.fontFamily,
                fontWeight: 700,
                fontSize: size * 0.68,
                letterSpacing: "-0.02em",
                lineHeight: 1,
            }}
        >
            Paradox
        </Typography>
    </Box>
);
