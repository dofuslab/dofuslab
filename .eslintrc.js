module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@emotion/eslint-plugin'],
  settings: {
    'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
    'import/resolver': {
      node: {
        paths: ['client'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        paths: ['client'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        // next.js doesn't require react
        'react/react-in-jsx-scope': 'off',
        'react/function-component-definition': 'off',
      },
    },
  ],
  rules: {
    'react/jsx-filename-extension': [
      2,
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      2,
      { devDependencies: ['**/test.tsx', '**/test.ts'] },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { ignoreRestSiblings: true },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    'no-shadow': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'lf',
      },
    ],
    '@emotion/no-vanilla': 'error',
    '@emotion/import-from-emotion': 'error',
    '@emotion/styled-import': 'error',
    '@emotion/pkg-renaming': 'error',
  },
};
