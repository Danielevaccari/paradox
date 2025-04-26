import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./Theme/themes";
import { SnackbarProvider } from "notistack";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
    <React.StrictMode>
        <SnackbarProvider maxSnack={3}>
            <ThemeProvider theme={darkTheme}>
                <App />
            </ThemeProvider>
        </SnackbarProvider>
    </React.StrictMode>,
);
