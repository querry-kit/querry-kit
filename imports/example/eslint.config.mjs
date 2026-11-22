import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { vueLayoutRules } from './config/vue-style.mjs';

const typeScriptFiles = ['**/*.ts', '**/*.vue'];
const documentation = [
  'ArrowFunctionExpression',
  'CallExpression > ArrowFunctionExpression',
  'NewExpression > ArrowFunctionExpression',
  'ReturnStatement > ArrowFunctionExpression',
  'ArrayExpression > ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression:not(MethodDefinition > FunctionExpression)',
  'MethodDefinition',
  'ExportNamedDeclaration > TSInterfaceDeclaration',
  'ExportNamedDeclaration > TSTypeAliasDeclaration',
  'ExportNamedDeclaration > TSEnumDeclaration',
  'ExportNamedDeclaration > ClassDeclaration',
];

export default [
  {
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/generated/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'vendor/**',
      'dockerdata/**',
      '.agents/**',
      '.specify/**',
    ],
  },
  { ...js.configs.recommended, files: ['**/*.{js,mjs,cjs}'] },
  ...tseslint.configs.recommended.map(
    /** Limits TypeScript's parser presets to TS and SFC sources. */
    (config) => ({ ...config, files: typeScriptFiles }),
  ),
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: { globals: globals.node },
    plugins: { jsdoc },
    settings: { jsdoc: { mode: 'typescript' } },
    rules: {
      'jsdoc/check-tag-names': 'error',
      'jsdoc/require-jsdoc': ['error', { contexts: documentation, enableFixer: false }],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: { ...vueLayoutRules, 'vue/multi-word-component-names': 'off' },
  },
];
