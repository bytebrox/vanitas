/**
 * Render the PWA icon set from the brand mark.
 *
 * Maskable variants get the paper-coloured ground and a safe-zone inset so
 * Android's adaptive-icon crop never clips the mark.
 *
 * Run: npm run build:icons
 */
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const source = path.join(root, 'public', 'logo-light.png');
const outDir = path.join(root, 'public', 'icons');

const PAPER = { r: 245, g: 240, b: 232, alpha: 1 };

async function plain(size) {
  const out = path.join(outDir, `icon-${size}.png`);
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: { ...PAPER, alpha: 0 } })
    .png()
    .toFile(out);
  return out;
}

async function maskable(size) {
  // 20% safe-zone inset on each side per the maskable icon spec.
  const inner = Math.round(size * 0.6);
  const mark = await sharp(source)
    .resize(inner, inner, { fit: 'contain', background: { ...PAPER, alpha: 0 } })
    .toBuffer();

  const out = path.join(outDir, `icon-maskable-${size}.png`);
  await sharp({
    create: { width: size, height: size, channels: 4, background: PAPER },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toFile(out);
  return out;
}

async function main() {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });

  for (const size of [192, 512]) {
    console.log(path.relative(root, await plain(size)));
    console.log(path.relative(root, await maskable(size)));
  }
  // Apple touch icon wants an opaque ground.
  const apple = path.join(outDir, 'apple-touch-icon.png');
  const mark = await sharp(source)
    .resize(150, 150, { fit: 'contain', background: { ...PAPER, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: PAPER } })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toFile(apple);
  console.log(path.relative(root, apple));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
