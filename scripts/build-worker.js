/**
 * Build Solana + ETH + BTC + TRON + APTOS + SUI vanity workers and publish integrity hashes
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
  const hashFile = path.join(__dirname, '../public/worker-hash.json');
  const built = new Date().toISOString();

  try {
    const solana = await buildOne(
      path.join(__dirname, '../src/workers/vanity.worker.source.ts'),
      path.join(__dirname, '../public/vanity-worker.js')
    );
    console.log('Solana worker built successfully!');

    const eth = await buildOne(
      path.join(__dirname, '../src/workers/eth.worker.source.ts'),
      path.join(__dirname, '../public/eth-worker.js')
    );
    console.log('ETH worker built successfully!');

    const btc = await buildOne(
      path.join(__dirname, '../src/workers/btc.worker.source.ts'),
      path.join(__dirname, '../public/btc-worker.js')
    );
    console.log('BTC worker built successfully!');

    const tron = await buildOne(
      path.join(__dirname, '../src/workers/tron.worker.source.ts'),
      path.join(__dirname, '../public/tron-worker.js')
    );
    console.log('TRON worker built successfully!');

    const aptos = await buildOne(
      path.join(__dirname, '../src/workers/aptos.worker.source.ts'),
      path.join(__dirname, '../public/aptos-worker.js')
    );
    console.log('APTOS worker built successfully!');

    const sui = await buildOne(
      path.join(__dirname, '../src/workers/sui.worker.source.ts'),
      path.join(__dirname, '../public/sui-worker.js')
    );
    console.log('SUI worker built successfully!');

    const hashData = {
      hash: solana.hash,
      size: solana.size,
      built,
      eth: { hash: eth.hash, size: eth.size, built },
      btc: { hash: btc.hash, size: btc.size, built },
      tron: { hash: tron.hash, size: tron.size, built },
      aptos: { hash: aptos.hash, size: aptos.size, built },
      sui: { hash: sui.hash, size: sui.size, built },
    };
    fs.writeFileSync(hashFile, JSON.stringify(hashData, null, 2));
    console.log(`Solana: ${solana.hash}`);
    console.log(`ETH: ${eth.hash}`);
    console.log(`BTC: ${btc.hash}`);
    console.log(`TRON: ${tron.hash}`);
    console.log(`APTOS: ${aptos.hash}`);
    console.log(`SUI: ${sui.hash}`);
  } catch (error) {
    console.error('Worker build failed:', error);
    process.exit(1);
  }
}

build();
