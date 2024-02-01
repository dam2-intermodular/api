module.exports = {
  root: true,
  ignorePatterns: ['*/node_modules/'],
  rules: {
    'consistent-return': 2,
    indent: ['error', 2],
    'no-else-return': 1,
    semi: ['error', 'never'],
    'space-unary-ops': 2,
    quotes: [1, 'single'],
    'key-spacing': ['error', { mode: 'strict' }],
  },
}
