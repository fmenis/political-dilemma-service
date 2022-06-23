module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: ['error', 'never'],
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: ['tap', 'fastify-swagger'],
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'max-len': ['error', { code: 100 }],
  },
}
