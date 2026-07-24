/**
 * Smoke verification for BTC + Tron address encoding and vanity matching.
 * Run: node scripts/verify-btc-tron.mjs
 */

import { build } from 'esbuild';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outfile = path.join(os.tmpdir(), `vanitas-verify-${Date.now()}.mjs`);

await build({
  entryPoints: [path.join(__dirname, 'verify-btc-tron-entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  target: ['node20'],
});

const mod = await import(pathToFileURL(outfile).href);
await mod.run();
fs.unlinkSync(outfile);
