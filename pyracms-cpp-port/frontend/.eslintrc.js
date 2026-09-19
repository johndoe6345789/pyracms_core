module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  overrides: [
    {
      // Jest mock factories must use require() (imports are hoisted out of
      // reach of jest.mock) and lightweight mock components need no names.
      files: ['src/__tests__/**/*.{ts,tsx}', 'e2e/**/*.ts'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'react/display-name': 'off',
        'react/jsx-key': 'off',
        'react/no-children-prop': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'max-len': ['error', {
      code: 80,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    }],
    'max-lines': ['error', {
      max: 150,
      skipBlankLines: true,
      skipComments: true,
    }],
    'prettier/prettier': 'warn',
  },
};
