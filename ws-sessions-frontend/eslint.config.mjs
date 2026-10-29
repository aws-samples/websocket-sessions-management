// ESLint 10 flat config.
//
// eslint-config-next does not run on ESLint 10 yet
// (https://github.com/vercel/next.js/issues/89764). This file builds the same
// rule set from plugins that support ESLint 10:
// - Next.js and React Hooks rules: the plugins eslint-config-next uses.
// - React rules: @eslint-react equivalents of the eslint-plugin-react rules
//   that eslint-config-next enables.
// - Accessibility and import rules: jsx-a11y-x and import-x, forks of
//   eslint-plugin-jsx-a11y and eslint-plugin-import, with the same rules and
//   options as eslint-config-next.
import eslintReact from "@eslint-react/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";
import { importX } from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

const eslintConfig = [
  { ignores: [".next/**", "out/**"] },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
  },
  nextPlugin.configs["core-web-vitals"],
  reactHooks.configs.flat.recommended,
  {
    plugins: {
      "@eslint-react": eslintReact,
      "jsx-a11y": jsxA11y,
      import: importX,
    },
    rules: {
      // ESLint 10 resolves JSX identifiers, so no-undef covers
      // react/jsx-no-undef.
      "no-undef": "error",
      "@eslint-react/no-missing-key": "error",
      "@eslint-react/no-duplicate-key": "error",
      "@eslint-react/no-missing-component-display-name": "error",
      "@eslint-react/jsx-no-comment-textnodes": "error",
      "@eslint-react/jsx-no-children-prop": "error",
      "@eslint-react/dom-no-dangerously-set-innerhtml-with-children": "error",
      "@eslint-react/no-direct-mutation-state": "error",
      "@eslint-react/no-component-will-mount": "error",
      "@eslint-react/no-component-will-receive-props": "error",
      "@eslint-react/no-component-will-update": "error",
      "@eslint-react/dom-no-find-dom-node": "error",
      "@eslint-react/dom-no-hydrate": "error",
      "@eslint-react/dom-no-render": "error",
      "@eslint-react/dom-no-render-return-value": "error",

      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",

      "import/no-anonymous-default-export": "warn",
    },
  },
];

export default eslintConfig;
