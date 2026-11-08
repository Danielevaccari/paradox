import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { AccountsView } from "./views/AccountsView";
import { SettingsView } from "./views/SettingsView";
import { TopicsView } from "./views/TopicsView";
import { TransactionsView } from "./views/TransactionsView";

export const App = () => {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/" element={<TopicsView />} />
                    <Route path="/topics/:topicId" element={<TopicsView />} />
                    <Route path="/accounts" element={<AccountsView />} />
                    <Route path="/transactions" element={<TransactionsView />} />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AppShell>
        </BrowserRouter>
    );
};
