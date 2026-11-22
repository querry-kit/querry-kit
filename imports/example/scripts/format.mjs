import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

import { Linter } from 'eslint';
import vue from 'eslint-plugin-vue';
import * as prettier from 'prettier';
import tseslint from 'typescript-eslint';
import * as vueParser from 'vue-eslint-parser';

import { vueLayoutRules } from '../config/vue-style.mjs';

const write = process.argv.includes('--write');
const linter = new Linter();

/** Finishes Vue block and tag layout after Prettier without invoking semantic autofixes. */
function formatVue(text, filename) {
  const result = linter.verifyAndFix(
    text,
    [
      {
        files: ['**/*.vue'],
        languageOptions: { parser: vueParser, parserOptions: { parser: tseslint.parser } },
        plugins: { vue },
        rules: vueLayoutRules,
      },
    ],
    { filename },
  );
  if (result.messages.length) {
    const messages = result.messages.map(/** Describes the remaining rule failure. */ (issue) => issue.message);
    throw new Error(`${filename}: ${messages.join('; ')}`);
  }

  return result.output;
}

/** Returns the canonical formatting for supported, non-ignored workspace files. */
async function getFormattedFile(filename) {
  const info = await prettier.getFileInfo(filename, { ignorePath: '.prettierignore' });
  if (info.ignored || !info.inferredParser) {
    return undefined;
  }

  const original = await readFile(filename, 'utf8');
  const settings = await prettier.resolveConfig(filename);
  const formatted = await prettier.format(original, { ...settings, filepath: filename });
  const expected = filename.endsWith('.vue') ? formatVue(formatted, filename) : formatted;
  return { original, expected };
}

/** Compares or writes project formatting while leaving ignored and generated files untouched. */
async function formatWorkspace() {
  const candidates = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8',
  });
  let changed = 0;
  for (const filename of new Set(candidates.split('\0').filter(Boolean))) {
    const result = await getFormattedFile(filename).catch(
      /** Ignores tracked files deleted from the working tree, not formatting errors. */
      (error) => {
        if (error.code === 'ENOENT') return undefined;
        throw error;
      },
    );
    if (!result || result.original === result.expected) continue;

    changed++;
    console.log(filename);
    if (write) await writeFile(filename, result.expected);
  }

  if (!write && changed) {
    console.error(`${changed} file(s) need formatting. Run pnpm format:fix.`);
    process.exitCode = 1;
  }
}

await formatWorkspace();
