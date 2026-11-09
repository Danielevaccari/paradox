import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist", "build", ".netlify", ".claude", "node_modules"] },
    {
        files: ["**/*.{ts,tsx}"],
        extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat.recommended],
        languageOptions: {
            ecmaVersion: 2023,
            globals: { ...globals.browser },
        },
        plugins: { "react-refresh": reactRefresh },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            curly: ["error", "all"],
        },
    },
    {
        files: ["netlify/**/*.ts", "vite.config.ts", "eslint.config.js"],
        languageOptions: { globals: { ...globals.node } },
    },
);
