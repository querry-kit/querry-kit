import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDirectory = dirname(fileURLToPath(import.meta.url));
const contentDirectory = resolve(docsDirectory, '../content/docs');

const packages = [
  { directory: 'nest', name: '@querry-kit/nest', repository: 'querry-kit/nest' },
  { directory: 'nuxt', name: '@querry-kit/nuxt', repository: 'querry-kit/nuxt' },
  { directory: 'nuxt-ui', name: '@querry-kit/nuxt-ui', repository: 'querry-kit/nuxt-ui' },
];

await Promise.all(packages.map(async ({ directory, name, repository }) => {
  const response = await globalThis.fetch(`https://raw.githubusercontent.com/${repository}/main/CHANGELOG.md`);

  if (!response.ok) {
    throw new Error(`Unable to load ${name} changelog: ${response.status} ${response.statusText}`);
  }

  const changelog = (await response.text()).trimEnd();

  if (!changelog.startsWith(`# ${name}\n`)) {
    throw new Error(`The ${name} changelog has an unexpected title.`);
  }

  const destination = resolve(contentDirectory, directory, 'changelog.md');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${changelog}\n`);
  globalThis.console.log(`Synced ${name} changelog.`);
}));
