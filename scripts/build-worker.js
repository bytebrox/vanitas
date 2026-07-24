/**
 * Build script for the vanity worker
 * Compiles the TypeScript worker with @noble/ed25519 into a single JS file
 * Generates a SHA-256 integrity hash of the built worker
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

async function build() {
  const outfile = path.join(__dirname, '../public/vanity-worker.js');
  const hashFile = path.join(__dirname, '../public/worker-hash.json');

  try {
    await esbuild.build({
      entryPoints: [path.join(__dirname, '../src/workers/vanity.worker.source.ts')],
      bundle: true,
      outfile,
      format: 'iife',
      target: ['es2020'],
      minify: true,
      sourcemap: false,
    });
    console.log('Worker built successfully!');

    const workerContent = fs.readFileSync(outfile);
    const hash = crypto.createHash('sha256').update(workerContent).digest('hex');
    const hashData = {
      hash: `sha256-${hash}`,
      size: workerContent.length,
      built: new Date().toISOString(),
    };
    fs.writeFileSync(hashFile, JSON.stringify(hashData, null, 2));
    console.log(`Worker hash: sha256-${hash}`);
  } catch (error) {
    console.error('Worker build failed:', error);
    process.exit(1);
  }
}

build();
