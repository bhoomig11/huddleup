import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {...pluginReact.configs.flat.recommended, settings: {react: {version: "detect"}}},
  {...reactHooks.configs.flat.recommended, rules: {"react/react-in-jsx-scope": "off"}},
  eslintConfigPrettier,
  globalIgnores([".react-router/", "build/**/*", "node_modules/"]),
]);
