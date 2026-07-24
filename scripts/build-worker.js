/**
 * Build Solana + ETH vanity workers and publish integrity hashes
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

async function buildOne(entry, outfile) {
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile,
    format: 'iife',
    target: ['es2020'],
    minify: true,
    sourcemap: false,
  });

  const workerContent = fs.readFileSync(outfile);
  const hash = crypto.createHash('sha256').update(workerContent).digest('hex');
  return {
    hash: `sha256-${hash}`,
    size: workerContent.length,
  };
}

async function build() {
  const solanaOut = path.join(__dirname, '../public/vanity-worker.js');
  const ethOut = path.join(__dirname, '../public/eth-worker.js');
  const hashFile = path.join(__dirname, '../public/worker-hash.json');

  try {
    const solana = await buildOne(
      path.join(__dirname, '../src/workers/vanity.worker.source.ts'),
      solanaOut
    );
    console.log('Solana worker built successfully!');

    const eth = await buildOne(
      path.join(__dirname, '../src/workers/eth.worker.source.ts'),
      ethOut
    );
    console.log('ETH worker built successfully!');

    const built = new Date().toISOString();
    const hashData = {
      hash: solana.hash,
      size: solana.size,
      built,
      eth: {
        hash: eth.hash,
        size: eth.size,
        built,
      },
    };
    fs.writeFileSync(hashFile, JSON.stringify(hashData, null, 2));
    console.log(`Solana worker hash: ${solana.hash}`);
    console.log(`ETH worker hash: ${eth.hash}`);
  } catch (error) {
    console.error('Worker build failed:', error);
    process.exit(1);
  }
}

build();
