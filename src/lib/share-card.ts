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

const PAPER = {
  bg: '#f5f0e8',
  ink: '#2c2a27',
  muted: '#6b6560',
  accent: '#8b7355',
  rule: 'rgba(44,42,39,0.15)',
};

const INK = {
  bg: '#2c2a27',
  ink: '#f5f0e8',
  muted: 'rgba(245,240,232,0.55)',
  accent: '#f5f0e8',
  rule: 'rgba(245,240,232,0.2)',
};

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

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  // subtle left accent bar
  ctx.fillStyle = c.accent;
  ctx.fillRect(0, 0, 10, H);

  const padX = 72;
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
  ctx.lineTo(W - padX, y);
  ctx.stroke();

  y += 64;
  const address = displayAddress(input.chain, input.address);
  ctx.fillStyle = c.ink;
  ctx.font = '400 36px "IBM Plex Mono", ui-monospace, monospace';
  const lines = wrapMono(ctx, address, W - padX * 2);
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
