import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const archives = resolve(process.argv[2]);
const ledger = JSON.parse(await readFile(join(archives, 'verified.json')));
const selected = process.argv[3];
for (const { name, archive } of ledger) {
  const id = name.split('/')[1];
  if (selected && id !== selected) continue;
  const variants =
    id === 'nuxt-ui'
      ? ['0.2.10', '1.0.0'].flatMap((v) =>
          ['14.4.0', '15.0.0'].map((u) => ({ '@querry-kit/nuxt': v, '@vueuse/core': u, '@vueuse/router': u })),
        )
      : [{}];
  for (const peers of variants) {
    const cwd = await mkdtemp(join(tmpdir(), `packed-${id}-`));
    const run = (cmd, args) =>
      execFileSync(cmd, args, {
        cwd,
        stdio: 'inherit',
        env: { ...process.env, NODE_PATH: '', NUXT_TELEMETRY_DISABLED: '1', EXPECT_PEERS: JSON.stringify(peers) },
      });
    const deps =
      id === 'nest'
        ? {
            '@nestjs/common': '12.6.0',
            '@nestjs/core': '12.6.0',
            '@nestjs/swagger': '12.1.2',
            'reflect-metadata': '0.2.2',
            rxjs: '7.8.2',
            zod: '4.6.7',
          }
        : {
            nuxt: '4.6.4',
            '@nuxt/kit': '4.6.4',
            vue: '3.5.46',
            'vue-router': '5.5.1',
            '@vueuse/core': '15.0.0',
            '@vueuse/router': '15.0.0',
            ...(id === 'nuxt-ui' ? { '@nuxt/ui': '4.13.0' } : {}),
            ...peers,
          };
    await cp(join(root, 'tests/packed', id), cwd, { recursive: true });
    const manifest = {
      name: 'external-consumer',
      private: true,
      type: 'module',
      dependencies: { ...deps, [name]: `file:${join(archives, archive)}`, typescript: '6.0.2' },
    };
    const install = async () => {
      await writeFile(join(cwd, 'package.json'), JSON.stringify(manifest));
      run('npm', ['install', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund', '--prefer-offline']);
    };
    await install();
    assert.ok((await realpath(join(cwd, 'node_modules', name))).startsWith(cwd + sep));
    run('node', ['probe.mjs']);
    if (id === 'nest') {
      Object.assign(manifest.dependencies, {
        'class-transformer': '0.5.1',
        'class-validator': '0.15.1',
        '@casl/ability': '7.1.3',
        '@casl/prisma': '2.2.0',
        '@prisma/client': '7.10.1',
      });
      await install();
    }
    const { exports } = JSON.parse(await readFile(join(cwd, 'node_modules', name, 'package.json')));
    const types = [];
    for (const [sub, targets] of Object.entries(exports)) {
      const spec = sub === '.' ? name : name + sub.slice(1);
      types.push(`import type * as Entry${types.length} from ${JSON.stringify(spec)};`);
      if (targets.import) run('node', ['--input-type=module', '-e', `await import(${JSON.stringify(spec)})`]);
      if (targets.require) run('node', ['-e', `require(${JSON.stringify(spec)})`]);
    }
    await writeFile(join(cwd, 'consumer.mts'), types.join('\n'));
    run(join(cwd, 'node_modules/.bin/tsc'), ['--module', 'nodenext', '--skipLibCheck', '--noEmit', 'consumer.mts']);
    console.log(`External consumer passed: ${name} ${JSON.stringify(peers)}`);
    await rm(cwd, { recursive: true });
  }
}
