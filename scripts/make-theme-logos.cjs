const sharp = require('sharp');

function isBg(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum > 235 && chroma < 18) return true;
  if (lum > 245 && chroma < 30) return true;
  return false;
}

async function process(src, dest) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const c = info.channels;
  const out = Buffer.from(data);
  const seen = new Uint8Array(w * h);
  const q = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (seen[i]) return;
    const o = i * c;
    if (!isBg(data[o], data[o + 1], data[o + 2])) return;
    seen[i] = 1;
    q.push(i);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  for (let qi = 0; qi < q.length; qi++) {
    const i = q[qi];
    const x = i % w;
    const y = (i / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  for (let i = 0; i < w * h; i++) {
    if (seen[i]) out[i * c + 3] = 0;
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 2 })
    .resize(256, 256, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.nearest,
    })
    .png()
    .toFile(dest);

  const { data: d2, info: i2 } = await sharp(dest)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let t = 0;
  for (let i = 3; i < d2.length; i += 4) if (d2[i] < 8) t += 1;
  console.log(
    dest,
    `${i2.width}x${i2.height}`,
    'trans%',
    ((100 * t) / (i2.width * i2.height)).toFixed(1),
    'cornerA',
    d2[3]
  );
}

const base =
  'C:/Users/t.weise/.cursor/projects/c-Users-t-weise-Desktop-Repos-vanitas-repo/assets';

(async () => {
  await process(`${base}/logo-light-ai.png`, 'public/logo-light.png');
  await process(`${base}/logo-dark-ai.png`, 'public/logo.png');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
