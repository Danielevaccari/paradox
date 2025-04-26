import { Routes, Route } from "react-router-dom";
import { TopicView } from "../Views/TopicView";
import { TransactionView } from "../Views/TransactionsView";
import { ConfigurationView } from "../Views/ConfigurationView";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<TopicView />} />
            <Route path="/transaction" element={<TransactionView />} />
            <Route path="/configuration" element={<ConfigurationView />} />
        </Routes>
    );
};

export { AppRoutes };
