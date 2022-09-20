// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'header', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
  ],
  env: {
    node: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-console': 'error',
    'header/header': [
      'error',
      'line',
      [
        ' Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.',
        ' SPDX-License-Identifier: Apache-2.0',
      ],
      2,
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSEnumDeclaration',
        message: "Don't declare enums; use an object instead, and mark it with `as const`",
      },
    ],
  },
}
