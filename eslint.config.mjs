import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = dirname(fileURLToPath(import.meta.url));

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
      parserOptions: {
        parser: tseslint.parser,
        tsconfigRootDir: rootDirectory,
      },
    },
  },
  {
    files: ['examples/*/web/**/*.{ts,vue}', 'apps/docs/**/*.{ts,vue}'],
    languageOptions: {
      globals: {
        defineNuxtConfig: 'readonly',
        defineNuxtPlugin: 'readonly',
        onMounted: 'readonly',
        ref: 'readonly',
        useNuxtApp: 'readonly',
        useRuntimeConfig: 'readonly',
        computed: 'readonly',
        createError: 'readonly',
        queryCollection: 'readonly',
        queryCollectionNavigation: 'readonly',
        queryCollectionSearchSections: 'readonly',
        useAppConfig: 'readonly',
        useAsyncData: 'readonly',
        useColorMode: 'readonly',
        useHead: 'readonly',
        useRoute: 'readonly',
        useSeoMeta: 'readonly',
        useState: 'readonly',
        watch: 'readonly',
      },
    },
  },
  {
    files: ['apps/docs/**/*.vue'],
    rules: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
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
