const globals = require("globals");

module.exports = {
  parserOptions : {
    sourceType: 'module',
    "ecmaVersion": 2020,
  },
  env: {
    browser: true,
    node: true, 
  },
  globals: { 
    ...globals.browser,
    ...globals.node,
  },
  rules: { 
    "no-console": "off",
  },
};