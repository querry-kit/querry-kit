import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
      '**/coverage/**',
      '**/generated/**',
      'docs/.vitepress/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    files: ['examples/*/web/**/*.{ts,vue}'],
    languageOptions: {
      globals: {
        defineNuxtConfig: 'readonly',
        defineNuxtPlugin: 'readonly',
        onMounted: 'readonly',
        ref: 'readonly',
        useNuxtApp: 'readonly',
        useRuntimeConfig: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier,
);
