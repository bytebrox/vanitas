/**
 * Convert generated hero PNGs from Cursor assets → public/ascii/*.webp (1536×1024).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const ASSETS =
  process.env.HERO_ASSETS ||
  path.join(
    process.env.USERPROFILE || '',
    '.cursor/projects/c-Users-t-weise-Desktop-Repos-vanitas-repo/assets'
  );
const OUT = path.join(ROOT, 'public', 'ascii');

const FILES = [
  'hero-btc-wide.png',
  'hero-evm-wide.png',
  'hero-tron-wide.png',
  'hero-aptos-wide.png',
  'hero-sui-wide.png',
  'hero-ton-wide.png',
  'hero-cardano-wide.png',
  'hero-xrp-wide.png',
  'hero-landing-wide.png',
  'page-lab-wide.png',
  'page-lookalike-wide.png',
  'page-create2-wide.png',
  'page-brand-wide.png',
];

async function main() {
  for (const name of FILES) {
    const src = path.join(ASSETS, name);
    if (!fs.existsSync(src)) {
      console.warn('missing', src);
      continue;
    }
    const dest = path.join(OUT, name.replace(/\.png$/i, '.webp'));
    await sharp(src)
      .resize(1536, 1024, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82, effort: 5 })
      .toFile(dest);
    const st = fs.statSync(dest);
    console.log('ok', path.basename(dest), `${(st.size / 1024).toFixed(0)}KB`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
