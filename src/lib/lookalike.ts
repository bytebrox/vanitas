/**
 * Pattern lookalike / alphabet collision checks (client-side).
 * Returns structured finding codes — UI translates via tools.lookalike.findings.*
 */

import { BASE58_ALPHABET, XRPL_BASE58_ALPHABET, BECH32_ALPHABET } from '@/lib/address-encoding';

export type LookalikeChain =
  | 'sol'
  | 'evm'
  | 'btc-legacy'
  | 'btc-bech32'
  | 'tron'
  | 'aptos'
  | 'sui'
  | 'ton'
  | 'cardano'
  | 'xrp';

export type LookalikeFindingParams = Record<string, string | number>;

export interface LookalikeFinding {
  severity: 'error' | 'warn' | 'info';
  code: string;
  params?: LookalikeFindingParams;
  positions?: number[];
}

const HEX = '0123456789abcdefABCDEF';
const TON_B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Confusable pairs often mixed by humans — noteKey maps to tools.lookalike.pairNotes.* */
const LOOKALIKE_PAIRS: { a: string; b: string; noteKey: string }[] = [
  { a: '0', b: 'O', noteKey: 'zeroO' },
  { a: '0', b: 'o', noteKey: 'zeroo' },
  { a: '1', b: 'l', noteKey: 'oneL' },
  { a: '1', b: 'I', noteKey: 'oneI' },
  { a: '1', b: 'i', noteKey: 'onei' },
  { a: '5', b: 'S', noteKey: 'fiveS' },
  { a: '8', b: 'B', noteKey: 'eightB' },
];

export const LOOKALIKE_CHAINS: {
  id: LookalikeChain;
  alphabet: string;
}[] = [
  { id: 'sol', alphabet: BASE58_ALPHABET },
  { id: 'evm', alphabet: HEX },
  { id: 'btc-legacy', alphabet: BASE58_ALPHABET },
  { id: 'btc-bech32', alphabet: BECH32_ALPHABET },
  { id: 'tron', alphabet: BASE58_ALPHABET },
  { id: 'aptos', alphabet: HEX },
  { id: 'sui', alphabet: HEX },
  { id: 'ton', alphabet: TON_B64URL },
  { id: 'cardano', alphabet: BECH32_ALPHABET },
  { id: 'xrp', alphabet: XRPL_BASE58_ALPHABET },
];

function positionsOf(pattern: string, chars: string): number[] {
  const set = new Set(chars.split(''));
  const out: number[] = [];
  for (let i = 0; i < pattern.length; i++) {
    if (set.has(pattern[i]!)) out.push(i);
  }
  return out;
}

export function analyzeLookalike(
  pattern: string,
  chain: LookalikeChain
): LookalikeFinding[] {
  const findings: LookalikeFinding[] = [];
  const raw = pattern.replace(/^0x/i, '');
  if (!raw) {
    findings.push({ severity: 'info', code: 'empty' });
    return findings;
  }

  const meta = LOOKALIKE_CHAINS.find((c) => c.id === chain)!;
  const alphabet = meta.alphabet;
  const invalid: { ch: string; i: number }[] = [];
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (chain === 'evm' || chain === 'aptos' || chain === 'sui') {
      if (!HEX.includes(ch)) invalid.push({ ch, i });
    } else if (!alphabet.includes(ch)) {
      invalid.push({ ch, i });
    }
  }

  if (invalid.length) {
    const uniq = [...new Set(invalid.map((x) => x.ch))].join(' ');
    findings.push({
      severity: 'error',
      code: 'invalidAlphabet',
      params: { chars: uniq, chain },
      positions: invalid.map((x) => x.i),
    });
  }

  // Bitcoin Base58 / Solana / Tron: banned lookalikes
  if (chain === 'sol' || chain === 'btc-legacy' || chain === 'tron') {
    const banned = positionsOf(raw, '0Oil');
    if (banned.length) {
      findings.push({
        severity: 'error',
        code: 'base58Banned',
        positions: banned,
      });
    }
  }

  // XRPL vs Bitcoin Base58
  if (chain === 'xrp') {
    const btcOnly = [...raw].filter((c) => BASE58_ALPHABET.includes(c) && !XRPL_BASE58_ALPHABET.includes(c));
    const xrplOnlyHint = [...raw].filter(
      (c) => XRPL_BASE58_ALPHABET.includes(c) && !BASE58_ALPHABET.includes(c)
    );
    if (btcOnly.length) {
      findings.push({
        severity: 'error',
        code: 'xrplVsBtc',
        params: { chars: [...new Set(btcOnly)].join(' ') },
        positions: positionsOf(raw, btcOnly.join('')),
      });
    }
    if (xrplOnlyHint.length) {
      findings.push({
        severity: 'info',
        code: 'xrplCharset',
        params: { chars: [...new Set(xrplOnlyHint)].join(' ') },
      });
    }
    const allInBtc = [...raw].every((c) => BASE58_ALPHABET.includes(c));
    const allInXrpl = [...raw].every((c) => XRPL_BASE58_ALPHABET.includes(c));
    if (allInBtc && allInXrpl) {
      findings.push({ severity: 'info', code: 'sharedGlyphs' });
    }
  }

  if (chain === 'sol' || chain === 'btc-legacy') {
    const wouldBeXrplIssue = [...raw].some(
      (c) => !XRPL_BASE58_ALPHABET.includes(c) && BASE58_ALPHABET.includes(c)
    );
    if (wouldBeXrplIssue) {
      findings.push({ severity: 'info', code: 'notXrpl' });
    }
  }

  // Tron case traps
  if (chain === 'tron') {
    const lower = positionsOf(raw, 'abcdefghijklmnopqrstuvwxyz');
    if (lower.length && raw.length <= 4) {
      findings.push({
        severity: 'warn',
        code: 'tronCase',
        positions: lower,
      });
    }
    if (raw.startsWith('t')) {
      findings.push({
        severity: 'warn',
        code: 'tronLeadingT',
        positions: [0],
      });
    }
  }

  // Generic lookalike warnings
  for (const pair of LOOKALIKE_PAIRS) {
    const hasA = raw.includes(pair.a);
    const hasB = raw.includes(pair.b);
    if (hasA || hasB) {
      const inAlphaA = alphabet.includes(pair.a) || (HEX === alphabet && HEX.includes(pair.a));
      const inAlphaB = alphabet.includes(pair.b) || (HEX === alphabet && HEX.includes(pair.b));
      if (inAlphaA && inAlphaB && hasA && hasB) {
        findings.push({
          severity: 'warn',
          code: 'pair',
          params: { a: pair.a, b: pair.b, noteKey: pair.noteKey },
          positions: [...positionsOf(raw, pair.a), ...positionsOf(raw, pair.b)],
        });
      } else if (hasA && !inAlphaA) {
        // already covered by invalid
      } else if ((hasA && !inAlphaB) || (hasB && !inAlphaA)) {
        const present = hasA ? pair.a : pair.b;
        const absent = hasA ? pair.b : pair.a;
        if (!alphabet.includes(absent) && alphabet.includes(present)) {
          findings.push({
            severity: 'info',
            code: 'safe',
            params: { present, absent, noteKey: pair.noteKey },
          });
        }
      }
    }
  }

  if (chain === 'evm' || chain === 'aptos' || chain === 'sui') {
    if (/[A-F]/.test(raw) && /[a-f]/.test(raw)) {
      findings.push({ severity: 'info', code: 'hexCase' });
    }
  }

  if (chain === 'ton' && /[A-Z]/.test(raw) && /[a-z]/.test(raw)) {
    findings.push({ severity: 'warn', code: 'tonCase' });
  }

  if (findings.length === 0) {
    findings.push({
      severity: 'info',
      code: 'clean',
      params: { chain },
    });
  }

  return findings;
}

/** Highlight pattern with finding positions */
export function markPattern(pattern: string, positions: number[] = []): { ch: string; hot: boolean }[] {
  const raw = pattern.replace(/^0x/i, '');
  const set = new Set(positions);
  return [...raw].map((ch, i) => ({ ch, hot: set.has(i) }));
}
