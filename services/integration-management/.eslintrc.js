module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        // Basic rules - relaxed for development
        'no-console': 'off', // Allow console statements in development
        'no-debugger': 'error',
        'no-unused-vars': 'off', // Allow unused vars in development
        'prefer-const': 'error',
        'no-var': 'error',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
        semi: ['error', 'always'],
        'comma-dangle': 'off', // Let Prettier handle this
    },
    overrides: [
        {
            files: [
                '__tests__/**/*.ts',
                'tests/**/*.ts',
                '**/*.test.ts',
                '**/*.spec.ts',
            ],
            env: {
                jest: true,
            },
            rules: {
                'no-unused-vars': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
    ],
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        '*.min.js',
        '*.bundle.js',
    ],
};
