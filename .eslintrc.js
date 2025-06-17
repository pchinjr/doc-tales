module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint"
  ],
  "rules": {
    "quotes": ["error", "double"],
    "no-console": "off", // Allow console for development
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off", // Allow any for now
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-function": "off", // Allow empty functions
    "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    "react/prop-types": "off" // Not needed with TypeScript
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "overrides": [
    {
      "files": ["*.test.js", "*.spec.js", "**/tests/**/*.js", "**/lambda/**/*.js"],
      "rules": {
        "no-console": "off",
        "no-undef": "off",
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ],
  "ignorePatterns": ["node_modules", "build", "dist", "coverage", ".github", "public"]
}
