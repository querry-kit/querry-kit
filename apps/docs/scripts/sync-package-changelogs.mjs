import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDirectory = dirname(fileURLToPath(import.meta.url));
const contentDirectory = resolve(docsDirectory, '../content/docs');

await Promise.all(['nest', 'nuxt', 'nuxt-ui'].map(async directory => {
  const name = `@querry-kit/${directory}`;
  const source = resolve(docsDirectory, '../../../packages', directory, 'CHANGELOG.md');
  const changelog = (await readFile(source, 'utf8')).trimEnd();

  const firstVersion = changelog.split('\n').find(line => line.startsWith('## '));
  if (!changelog.startsWith(`# ${name}\n`) || !/^## \d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(firstVersion ?? '')) {
    throw new Error(`Unexpected package or version heading in ${source}`);
  }

  const destination = resolve(contentDirectory, directory, 'changelog.md');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${changelog}\n`);
  globalThis.console.log(`Synced ${name} changelog.`);
}));
