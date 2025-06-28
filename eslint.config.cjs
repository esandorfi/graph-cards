const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");

/**
 * ESLint v9 flat-config, CommonJS variant so it runs in Node without `type: module`.
 */

module.exports = [
  // Enable Node globals project-wide
  {
    languageOptions: {
      globals: globals.node,
    },
  },

  // ESLint recommended rules
  js.configs.recommended,

  // TypeScript rules
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
    },
  },
];
