module.exports = {
    root: true,
    ignorePatterns: ["src/components/**"],
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
    plugins: ["react", "react-hooks", "react-refresh"],
    extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
    settings: {
        react: { version: "detect" },
    },
    rules: {
        // Vite + React 17+ doesn't require React in scope
        "react/react-in-jsx-scope": "off",

        // Catch unused variables/imports (core eslint)
        "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

        // Vite React Refresh best practice
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

        // We are not using prop-types in this codebase
        "react/prop-types": "off",
        "react/no-unescaped-entities": "off",

        // Avoid noisy hook warnings failing CI (max-warnings 0)
        "react-hooks/exhaustive-deps": "off",
    },
}


