import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = dirname(fileURLToPath(import.meta.url));

const nuxtGlobals = {
  computed: 'readonly',
  createError: 'readonly',
  defineAppConfig: 'readonly',
  defineNuxtConfig: 'readonly',
  onMounted: 'readonly',
  queryCollection: 'readonly',
  queryCollectionNavigation: 'readonly',
  queryCollectionSearchSections: 'readonly',
  ref: 'readonly',
  useAppConfig: 'readonly',
  useAsyncData: 'readonly',
  useColorMode: 'readonly',
  useHead: 'readonly',
  useRoute: 'readonly',
  useSeoMeta: 'readonly',
  useState: 'readonly',
  watch: 'readonly',
};

export default tseslint.config(
  {
    ignores: ['.nuxt/**', '.output/**', '.data/**', 'node_modules/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...nuxtGlobals },
      parserOptions: {
        parser: tseslint.parser,
        tsconfigRootDir: configDirectory,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier,
);
