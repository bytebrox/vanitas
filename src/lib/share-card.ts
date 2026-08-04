/**
 * Client-side vanity share card (1200×630 PNG). Never includes private keys.
 */

import { splitMatchedPattern, type ProofChain } from '@/lib/proof-of-find';
import { tryChecksumAddress } from '@/lib/eip55';

export interface ShareCardInput {
  chain: ProofChain;
  address: string;
  matchedPattern: string;
  attempts?: number;
  duration?: number;
  mode?: string;
  chainLabel?: string;
}

const W = 1200;
const H = 630;

/** Brand hero (1536×1024) — cropped cover into OG frame. */
const SHARE_BG_SRC = '/ascii/page-brand-wide.webp';

const PAPER = {
  bg: '#f5f0e8',
  bgRgb: '245, 240, 232',
  ink: '#2c2a27',
  muted: '#6b6560',
  accent: '#8b7355',
  rule: 'rgba(44,42,39,0.18)',
};

const INK = {
  bg: '#2c2a27',
  bgRgb: '44, 42, 39',
  ink: '#f5f0e8',
  muted: 'rgba(245,240,232,0.6)',
  accent: '#c4a882',
  rule: 'rgba(245,240,232,0.22)',
};

let bgPromise: Promise<HTMLImageElement> | null = null;

function loadShareBackground(): Promise<HTMLImageElement> {
  if (typeof Image === 'undefined') {
    return Promise.reject(new Error('Image unavailable'));
  }
  if (!bgPromise) {
    bgPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => {
        bgPromise = null;
        reject(new Error('Share card background failed to load'));
      };
      img.src = SHARE_BG_SRC;
    });
  }
  return bgPromise;
}

/** Draw image covering a rect (center-crop). */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): void {
  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

async function paintBrandedGround(
  ctx: CanvasRenderingContext2D,
  dark: boolean,
  c: typeof PAPER | typeof INK
): Promise<void> {
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  try {
    const img = await loadShareBackground();

    // Full-bleed classical plate — Vanitas print texture behind the proof.
    drawImageCover(ctx, img, 0, 0, W, H);

    // Soft paper/ink veil so engraving reads as print, not a photo dump.
    ctx.fillStyle = dark
      ? `rgba(${c.bgRgb}, 0.62)`
      : `rgba(${c.bgRgb}, 0.72)`;
    ctx.fillRect(0, 0, W, H);

    // Stronger reading wash on the left (where type lives).
    const wash = ctx.createLinearGradient(0, 0, W * 0.72, 0);
    wash.addColorStop(0, `rgba(${c.bgRgb}, 0.94)`);
    wash.addColorStop(0.45, `rgba(${c.bgRgb}, 0.72)`);
    wash.addColorStop(0.75, `rgba(${c.bgRgb}, 0.28)`);
    wash.addColorStop(1, `rgba(${c.bgRgb}, 0)`);
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    // Gentle bottom fade so footer stays quiet.
    const foot = ctx.createLinearGradient(0, H * 0.62, 0, H);
    foot.addColorStop(0, `rgba(${c.bgRgb}, 0)`);
    foot.addColorStop(1, `rgba(${c.bgRgb}, 0.55)`);
    ctx.fillStyle = foot;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);
  } catch {
    /* solid paper/ink fallback if the asset fails */
  }
}

function wrapMono(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = text.split('');
  const lines: string[] = [];
  let line = '';
  for (const ch of chars) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function formatAttempts(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function formatDurationMs(ms: number | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return '';
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}m ${rem}s`;
}

async function ensureFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load('600 64px Cinzel'),
      document.fonts.load('400 28px "IBM Plex Mono"'),
      document.fonts.load('500 22px "IBM Plex Sans"'),
    ]);
  } catch {
    /* fall back to system fonts */
  }
}

function displayAddress(chain: ProofChain, address: string): string {
  if (chain === 'evm') return tryChecksumAddress(address) ?? address;
  return address;
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob> {
  await ensureFonts();

  const dark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const c = dark ? INK : PAPER;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  await paintBrandedGround(ctx, dark, c);

  // Accent spine — brand mark from the ledger UI
  ctx.fillStyle = c.accent;
  ctx.fillRect(0, 0, 10, H);

  const padX = 72;
  const textMax = Math.min(W - padX * 2, W * 0.62);
  let y = 72;

  ctx.fillStyle = c.accent;
  ctx.font = '600 28px Cinzel, "Times New Roman", serif';
  ctx.fillText('VANITAS', padX, y);

  y += 48;
  ctx.fillStyle = c.muted;
  ctx.font = '500 20px "IBM Plex Sans", system-ui, sans-serif';
  const meta = [input.chainLabel || input.chain.toUpperCase(), input.mode]
    .filter(Boolean)
    .join('  ·  ')
    .toUpperCase();
  ctx.fillText(meta, padX, y);

  y += 28;
  ctx.strokeStyle = c.rule;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(padX + textMax, y);
  ctx.stroke();

  y += 64;
  const address = displayAddress(input.chain, input.address);
  ctx.fillStyle = c.ink;
  ctx.font = '400 36px "IBM Plex Mono", ui-monospace, monospace';
  const lines = wrapMono(ctx, address, textMax);
  for (const line of lines.slice(0, 3)) {
    ctx.fillText(line, padX, y);
    y += 48;
  }

  y += 24;
  const { prefix, suffix } = splitMatchedPattern(input.matchedPattern);
  ctx.font = '400 28px "IBM Plex Mono", ui-monospace, monospace';
  const pre = prefix || '·';
  const suf = suffix || '·';
  ctx.fillStyle = c.accent;
  ctx.fillText(pre, padX, y);
  const preW = ctx.measureText(pre).width;
  ctx.fillStyle = c.muted;
  ctx.fillText(' … ', padX + preW, y);
  const midW = ctx.measureText(' … ').width;
  ctx.fillStyle = c.accent;
  ctx.fillText(suf, padX + preW + midW, y);

  const stats = [
    formatAttempts(input.attempts) ? `${formatAttempts(input.attempts)} attempts` : '',
    formatDurationMs(input.duration),
  ]
    .filter(Boolean)
    .join('  ·  ');

  if (stats) {
    y += 48;
    ctx.fillStyle = c.muted;
    ctx.font = '500 18px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillText(stats, padX, y);
  }

  // footer
  ctx.strokeStyle = c.rule;
  ctx.beginPath();
  ctx.moveTo(padX, H - 72);
  ctx.lineTo(W - padX, H - 72);
  ctx.stroke();

  ctx.fillStyle = c.muted;
  ctx.font = '500 18px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillText('vanitas.fun', padX, H - 40);
  ctx.textAlign = 'right';
  ctx.fillText('Proof without keys', W - padX, H - 40);
  ctx.textAlign = 'left';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode share card'));
      },
      'image/png',
      1
    );
  });
}
