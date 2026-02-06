import preact from "eslint-config-preact";

export default [
  {
    ignores: ["build/**"],
  },
  ...preact,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        chrome: "readonly",
      },
    },
  },
];
