import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useApp } from "./app/appContext";
import { ChatLauncher } from "./components/chat/ChatLauncher";
import { AppShell } from "./components/layout/AppShell";
import { AccountsView } from "./views/AccountsView";
import { SettingsView } from "./views/SettingsView";
import { TopicsView } from "./views/TopicsView";
import { TransactionsView } from "./views/TransactionsView";

export const App = () => {
    const { serverConfig } = useApp();

    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/" element={<TopicsView />} />
                    <Route path="/accounts" element={<AccountsView />} />
                    <Route path="/transactions" element={<TransactionsView />} />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AppShell>
            {serverConfig?.features.chat && <ChatLauncher />}
        </BrowserRouter>
    );
};
