import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { netlifyFunctionsDev } from "./vite/netlifyFunctionsDev.ts";

export default defineConfig(({ mode }) => {
    // Make server-only variables from .env (HEDERA_*, ANTHROPIC_API_KEY, ...) available to the
    // functions in dev. They stay on the server: Vite only exposes VITE_* variables to the browser.
    for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ""))) {
        if (!key.startsWith("VITE_") && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }

    return {
        plugins: [react(), netlifyFunctionsDev()],
        build: {
            rolldownOptions: {
                output: {
                    codeSplitting: {
                        groups: [
                            { name: "mui-x", test: /node_modules[\\/]@mui[\\/]x-/ },
                            { name: "mui", test: /node_modules[\\/]@mui/ },
                            { name: "react", test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
                        ],
                    },
                },
            },
        },
    };
});
