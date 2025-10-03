import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    // Apply to all JS files
    files: ["**/*.{js,mjs,cjs}"],

    // Use the JS plugin
    plugins: { js },

    // Recommended JS rules
    extends: ["js/recommended"],

    // Define global variables
    languageOptions: {
      globals: {
        ...globals.browser, // browser globals
        ...globals.jest     // Jest globals: describe, it, expect, beforeEach, etc.
      }
    },

    rules: {
      "no-empty": "warn",
      "no-unused-vars": "warn",
    },
  }
]);
