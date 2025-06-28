import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/**
 * ESLint v9 uses the new "Flat Config" format.
 * This configuration replaces any legacy .eslintrc.* files.
 * Docs: https://eslint.org/docs/latest/use/configure/
 */
import globals from "globals";

export default [
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  // Built-in ESLint recommended rules for plain JS / TS
  js.configs.recommended,

  // TypeScript-specific rules
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: globals.node,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Turn off the base rule as it can report incorrect errors for TS files
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
    },
  },
];
