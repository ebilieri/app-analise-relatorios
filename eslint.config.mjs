import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const config = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**"
    ]
  }
];

export default config;
