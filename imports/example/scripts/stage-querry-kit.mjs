import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const vendor = fileURLToPath(new URL('../vendor', import.meta.url));
const siblingRoot = fileURLToPath(new URL('../../', import.meta.url));
const pins = JSON.parse(readFileSync(new URL('./querry-kit-sources.json', import.meta.url), 'utf8'));
const packages = ['nest', 'nuxt', 'nuxt-ui'];
const ownershipMarker = '.workboard-staged-source';
const args = process.argv.slice(2);
if (args.length > 1 || (args[0] !== undefined && args[0] !== '--local')) {
  throw new Error('Usage: node scripts/stage-querry-kit.mjs [--local]');
}
const local = args[0] === '--local';

/** Runs Git without a shell and returns trimmed output for provenance checks. */
function git(directory, ...args) {
  return execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' }).trim();
}

/** Fetches and verifies one exact commit from the package's canonical repository. */
function fetchPinnedSource(directory, name, revision) {
  if (typeof revision !== 'string' || !/^[a-f0-9]{40}$/.test(revision)) {
    throw new Error(`Expected a full Git commit SHA for ${name}.`);
  }

  mkdirSync(directory);
  git(directory, 'init', '--quiet');
  git(directory, 'fetch', '--quiet', '--depth=1', `https://github.com/querry-kit/${name}.git`, revision);
  if (git(directory, 'rev-parse', 'FETCH_HEAD') !== revision) {
    throw new Error(`Fetched unexpected revision for ${name}.`);
  }

  git(directory, 'checkout', '--quiet', '--detach', revision);
  rmSync(join(directory, '.git'), { recursive: true });
  return revision;
}

/** Copies tracked and unignored working-tree files without installing or modifying the sibling repository. */
function copyLocalSource(directory, name) {
  const key = `QUERRY_KIT_${name.toUpperCase().replaceAll('-', '_')}_SOURCE`;
  const requested = resolve(process.env[key] ?? join(siblingRoot, name));
  if (!lstatSync(requested, { throwIfNoEntry: false })) {
    throw new Error(`Missing ${name} source at ${requested}. Clone a sibling checkout or set ${key}.`);
  }

  const source = realpathSync(requested);
  if (
    source === vendor ||
    source.startsWith(`${vendor}${sep}`) ||
    git(source, 'rev-parse', '--show-toplevel') !== source
  ) {
    throw new Error(`${key} must point to a separate package repository root.`);
  }

  const files = execFileSync('git', ['-C', source, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8',
  });
  mkdirSync(directory);
  for (const path of new Set(files.split('\0').filter(Boolean))) {
    if (isLocalConfig(path)) continue;
    const original = join(source, path);
    const entry = lstatSync(original, { throwIfNoEntry: false });
    if (!entry) continue; // A tracked path can be deleted in the working tree.
    if (!entry.isFile() || !realpathSync(original).startsWith(`${source}${sep}`)) {
      throw new Error(`Cannot stage ${name}/${path}: expected a regular file inside the source repository.`);
    }
    const target = join(directory, path);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(original, target);
  }

  return `local:${git(source, 'rev-parse', 'HEAD')}`;
}

/** Keeps machine-local configuration and generated dependency directories out of source staging. */
function isLocalConfig(path) {
  return path.split('/').some(
    /** Checks each path segment rather than matching package or source names by substring. */
    (part) =>
      part === '.npmrc' ||
      part.startsWith('.env') ||
      ['.git', 'node_modules', 'dist', '.nuxt', '.output'].includes(part),
  );
}

/** Checks package identity and keeps the staged Nuxt UI build on the workspace Nuxt. */
function normalizeManifest(directory, name) {
  const path = join(directory, 'package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  if (manifest.name !== `@querry-kit/${name}`) {
    throw new Error(`Unexpected package identity for ${name}: ${manifest.name}`);
  }

  if (name === 'nuxt-ui') {
    // The upstream peer accepts local Nuxt 1.x, but its standalone build-time range selects npm 0.x.
    if (!manifest.devDependencies?.['@querry-kit/nuxt']) {
      throw new Error('Expected the Nuxt UI build-time Nuxt dependency.');
    }

    manifest.devDependencies['@querry-kit/nuxt'] = 'workspace:*';
    writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

/** Refuses to overwrite anything outside directories produced by this script. */
function assertOwnedTarget(target) {
  const entry = lstatSync(target, { throwIfNoEntry: false });
  if (
    entry &&
    (!entry.isDirectory() || !lstatSync(join(target, ownershipMarker), { throwIfNoEntry: false })?.isFile())
  ) {
    throw new Error(`Refusing to overwrite unmanaged path: ${target}`);
  }
}

/** Stages and checks every package before replacing the prior workspace sources. */
function stageSources() {
  const existingVendor = lstatSync(vendor, { throwIfNoEntry: false });
  if (existingVendor && !existingVendor.isDirectory()) {
    throw new Error(`Expected a workspace-owned staging directory: ${vendor}`);
  }

  mkdirSync(vendor, { recursive: true });
  const incoming = mkdtempSync(join(vendor, '.incoming-'));
  try {
    for (const name of packages) {
      assertOwnedTarget(join(vendor, name));
      const source = join(incoming, name);
      const revision = local ? copyLocalSource(source, name) : fetchPinnedSource(source, name, pins[name]);
      normalizeManifest(source, name);
      writeFileSync(join(source, ownershipMarker), `${revision}\n`);
    }

    for (const name of packages) {
      const target = join(vendor, name);
      assertOwnedTarget(target);
      rmSync(target, { recursive: true, force: true });
      renameSync(join(incoming, name), target);
      const revision = readFileSync(join(target, ownershipMarker), 'utf8').trim();
      console.log(`Staged @querry-kit/${name} (${revision})`);
    }
  } finally {
    rmSync(incoming, { recursive: true, force: true });
  }
}

stageSources();
