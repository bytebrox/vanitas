/**
 * Convert public PNGs to WebP and resize OG cards to 1200x630.
 * Keeps favicon as PNG (broader browser support).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

async function toWebp(inputPath, outputPath, opts = {}) {
  const { width, height, quality = 82 } = opts;
  let pipeline = sharp(inputPath);
  if (width && height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'cover',
      position: 'centre',
      background: { r: 245, g: 240, b: 232, alpha: 1 },
    });
  }
  await pipeline.webp({ quality, effort: 5 }).toFile(outputPath);
  const inStat = fs.statSync(inputPath);
  const outStat = fs.statSync(outputPath);
  console.log(
    `${path.relative(root, inputPath)} → ${path.relative(root, outputPath)} ` +
      `(${(inStat.size / 1024 / 1024).toFixed(2)}MB → ${(outStat.size / 1024 / 1024).toFixed(2)}MB)`
  );
}

async function walkPngs(dir, list = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkPngs(full, list);
    else if (name.toLowerCase().endsWith('.png')) list.push(full);
  }
  return list;
}

async function main() {
  // OG sources from Cursor assets (if present) + existing public OG
  const assets = path.join(
    process.env.USERPROFILE || '',
    '.cursor/projects/f-Projekte-VanityMine-repo/assets'
  );

  const ogMap = {
    'og-wallet.png': 'og-wallet.webp',
    'og-mint.png': 'og-mint.webp',
    'og-how.png': 'og-how.webp',
    'og-faq.png': 'og-faq.webp',
    'og-security.png': 'og-security.webp',
    'og-audit.png': 'og-audit.webp',
  };

  for (const [srcName, outName] of Object.entries(ogMap)) {
    const fromAssets = path.join(assets, srcName);
    const fromPublic = path.join(publicDir, srcName);
    const src = fs.existsSync(fromAssets)
      ? fromAssets
      : fs.existsSync(fromPublic)
        ? fromPublic
        : null;
    if (!src) {
      console.warn('missing OG source', srcName);
      continue;
    }
    await toWebp(src, path.join(publicDir, outName), {
      width: 1200,
      height: 630,
      quality: 84,
    });
  }

  // Convert all public PNGs except favicon (and skip already-handled og-*.png sources)
  const pngs = await walkPngs(publicDir);
  for (const png of pngs) {
    const base = path.basename(png);
    if (base === 'favicon.png') continue;
    if (base === 'logo.png') continue; // unused; delete later
    if (/^og-.*\.png$/i.test(base)) continue; // replaced by dedicated webp above

    const out = png.replace(/\.png$/i, '.webp');
    // plates may have transparency
    const isPlate = base.includes('-plate');
    await toWebp(png, out, { quality: isPlate ? 80 : 80 });
  }

  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
