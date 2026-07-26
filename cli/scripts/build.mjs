import * as esbuild from 'esbuild';
import { chmodSync, mkdirSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

mkdirSync(dist, { recursive: true });

const shared = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  sourcemap: false,
  minify: false,
  packages: 'bundle',
};

await esbuild.build({
  ...shared,
  entryPoints: [join(root, 'src/index.ts')],
  outfile: join(dist, 'index.js'),
  banner: { js: '#!/usr/bin/env node' },
});

await esbuild.build({
  ...shared,
  entryPoints: [join(root, 'src/mine-worker.ts')],
  outfile: join(dist, 'mine-worker.js'),
});

try {
  chmodSync(join(dist, 'index.js'), 0o755);
} catch {
  /* windows */
}

const licenseSrc = join(root, '..', 'LICENSE');
if (existsSync(licenseSrc)) {
  copyFileSync(licenseSrc, join(root, 'LICENSE'));
} else {
  writeFileSync(join(root, 'LICENSE'), 'MIT License\n\nCopyright (c) bytebrox\n');
}

console.log('CLI built → dist/index.js + dist/mine-worker.js');
