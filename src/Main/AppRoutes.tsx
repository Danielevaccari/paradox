import { Routes, Route } from "react-router-dom";
import { TopicView } from "../Views/TopicView";
import { TransactionView } from "../Views/TransactionView";
import { ConfigurationView } from "../Views/ConfigurationView";
import { AccountView } from "../Views/AccountView";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<TopicView />} />
            <Route path="/Account" element={<AccountView />} />
            <Route path="/transaction" element={<TransactionView />} />
            <Route path="/configuration" element={<ConfigurationView />} />
        </Routes>
    );
};

export { AppRoutes };
