module.exports = {
  env: {
    node: true, //allows require, module, process, etc.
    es2022: true,
    mocha: true //Allows describe, it, before, after — used in tests
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script'
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off'
  },
  ignorePatterns: ['node_modules', 'coverage']
};