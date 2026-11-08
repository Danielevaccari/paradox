import { FileDownloadOutlined, FileUploadOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Divider, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useRef, type ReactNode } from "react";
import { useApp } from "../app/appContext";
import { preferences } from "../app/preferences";
import { pageBodySx } from "../components/common/layout";
import { PageHeader } from "../components/common/PageHeader";
import { notify } from "../utils/notify";

const Section = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
    <Box sx={{ py: 2.5 }}>
        <Typography variant="h2">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5 }}>
            {description}
        </Typography>
        {children}
    </Box>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.25, sm: 2 }} sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ width: { sm: 160 }, flexShrink: 0 }}>
            {label}
        </Typography>
        <Box sx={{ minWidth: 0, wordBreak: "break-all" }}>{children}</Box>
    </Stack>
);

const Feature = ({ on, label }: { on: boolean; label: string }) => (
    <Chip size="small" variant="outlined" color={on ? "success" : "default"} label={`${label}${on ? "" : " off"}`} />
);

export const SettingsView = () => {
    const { server, network, themeMode, toggleThemeMode } = useApp();
    const fileInput = useRef<HTMLInputElement>(null);

    const importFile = async (file: File | undefined) => {
        if (!file) {
            return;
        }
        try {
            const added = await preferences.importFromFile(file, network);
            notify.success(`Imported ${added} new topic${added === 1 ? "" : "s"} into ${network}`);
        } catch (error) {
            notify.error(error instanceof SyntaxError ? "This file is not valid JSON" : error);
        } finally {
            if (fileInput.current) {
                fileInput.current.value = "";
            }
        }
    };

    return (
        <>
            <PageHeader title="Settings" />
            <Box sx={pageBodySx}>
                <Box sx={{ maxWidth: 760 }}>
                    <Section
                        title="Hedera account"
                        description="Transactions are signed on the server, so keys never reach the browser. Reading is free and uses the public mirror node; anything that costs HBAR asks you to accept first."
                    >
                        {server.state === "loading" && <Typography color="text.secondary">Connecting…</Typography>}
                        {server.state === "unavailable" && (
                            <Alert severity="warning">Backend unavailable: {server.reason}. The app works read-only.</Alert>
                        )}
                        {server.state === "ready" && (
                            <Box>
                                <Row label="Network">
                                    <Typography sx={{ textTransform: "capitalize" }}>{server.config.network}</Typography>
                                </Row>
                                <Divider />
                                <Row label="Account">
                                    <Typography className="mono">{server.config.accountId ?? "Not configured"}</Typography>
                                </Row>
                                <Divider />
                                <Row label="Public key">
                                    <Typography className="mono" variant="body2">
                                        {server.config.publicKey ?? "—"}
                                    </Typography>
                                </Row>
                                <Divider />
                                <Row label="Features">
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                                        <Feature on={server.config.features.writes} label="Topics" />
                                        <Feature on={server.config.features.chat} label="AI chat" />
                                        <Feature on={server.config.features.transfer} label="HBAR transfers" />
                                    </Stack>
                                </Row>
                            </Box>
                        )}
                    </Section>
                    <Divider />

                    <Section title="Appearance" description="Saved in this browser.">
                        <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={themeMode}
                            onChange={(_e, value) => value && value !== themeMode && toggleThemeMode()}
                        >
                            <ToggleButton value="light">Light</ToggleButton>
                            <ToggleButton value="dark">Dark</ToggleButton>
                        </ToggleButtonGroup>
                    </Section>
                    <Divider />

                    <Section title="Saved topics" description={`Back up or restore the topic list for ${network}.`}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadOutlined />}
                                onClick={() => preferences.exportToFile(network)}
                            >
                                Export
                            </Button>
                            <Button variant="outlined" startIcon={<FileUploadOutlined />} onClick={() => fileInput.current?.click()}>
                                Import
                            </Button>
                            <input
                                ref={fileInput}
                                type="file"
                                accept="application/json"
                                hidden
                                onChange={(event) => importFile(event.target.files?.[0])}
                            />
                        </Stack>
                    </Section>
                </Box>
            </Box>
        </>
    );
};
