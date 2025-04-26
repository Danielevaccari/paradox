import { BrowserRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { AppRoutes } from "./Main/AppRoutes";
import { AppNavigationDrawer } from "./Main/AppNavigationDrawer";

const App = () => {
    return (
        <BrowserRouter>
            <Box sx={{ display: "flex", width: "100%", height: "100vh" }}>
                <AppNavigationDrawer />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        height: "100%",
                        padding: "1rem 0px 0px 1rem",
                        bgcolor: "background.default",
                    }}
                >
                    <AppRoutes />
                </Box>
            </Box>
        </BrowserRouter>
    );
};

export { App };
