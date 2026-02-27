import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest, // Using jest globals for vitest compatibility if plugin fails
            },
        },
    },
    pluginJs.configs.recommended,
    {
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
        },
    },
];
