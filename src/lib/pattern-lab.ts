/**
 * Pattern Lab — unified difficulty / alphabet analysis for all forges
 */

import {
  estimateDifficulty,
  formatDifficulty,
  estimateTime,
  validatePrefix,
  validateSuffix,
} from '@/lib/validation';
import {
  estimateEthDifficulty,
  formatEthDifficulty,
  estimateEthTime,
  validateEthPrefix,
  validateEthSuffix,
  normalizeEthPattern,
} from '@/lib/eth-validation';
import {
  estimateBtcDifficulty,
  formatBtcDifficulty,
  estimateBtcTime,
  validateBtcPrefix,
  validateBtcSuffix,
} from '@/lib/btc-validation';
import type { BtcMode } from '@/types/btc';
import {
  estimateTronDifficulty,
  formatTronDifficulty,
  estimateTronTime,
  validateTronPrefix,
  validateTronSuffix,
} from '@/lib/tron-validation';
import {
  estimateAptosDifficulty,
  formatAptosDifficulty,
  estimateAptosTime,
  validateAptosPrefix,
  validateAptosSuffix,
} from '@/lib/aptos-validation';
import {
  estimateSuiDifficulty,
  formatSuiDifficulty,
  estimateSuiTime,
  validateSuiPrefix,
  validateSuiSuffix,
} from '@/lib/sui-validation';
import {
  estimateTonDifficulty,
  formatTonDifficulty,
  estimateTonTime,
  validateTonPrefix,
  validateTonSuffix,
} from '@/lib/ton-validation';
import type { TonMode } from '@/types/ton';
import {
  estimateCardanoDifficulty,
  formatCardanoDifficulty,
  estimateCardanoTime,
  validateCardanoPrefix,
  validateCardanoSuffix,
} from '@/lib/cardano-validation';
import {
  estimateXrpDifficulty,
  formatXrpDifficulty,
  estimateXrpTime,
  validateXrpPrefix,
  validateXrpSuffix,
} from '@/lib/xrp-validation';

export type LabChain =
  | 'sol'
  | 'evm'
  | 'btc'
  | 'tron'
  | 'aptos'
  | 'sui'
  | 'ton'
  | 'cardano'
  | 'xrp';

export const LAB_CHAINS: {
  id: LabChain;
  label: string;
  forgePath: string;
  alphabet: string;
  alphabetSize: number;
  defaultRates: number[];
}[] = [
  { id: 'sol', label: 'Solana', forgePath: '/sol', alphabet: 'Base58', alphabetSize: 58, defaultRates: [20_000, 50_000, 100_000] },
  { id: 'evm', label: 'EVM', forgePath: '/evm', alphabet: 'Hex (16)', alphabetSize: 16, defaultRates: [5_000, 20_000, 80_000] },
  { id: 'btc', label: 'Bitcoin', forgePath: '/btc', alphabet: 'Base58 / Bech32', alphabetSize: 58, defaultRates: [3_000, 15_000, 40_000] },
  { id: 'tron', label: 'Tron', forgePath: '/tron', alphabet: 'Base58', alphabetSize: 58, defaultRates: [5_000, 20_000, 60_000] },
  { id: 'aptos', label: 'Aptos', forgePath: '/aptos', alphabet: 'Hex (16)', alphabetSize: 16, defaultRates: [8_000, 30_000, 80_000] },
  { id: 'sui', label: 'Sui', forgePath: '/sui', alphabet: 'Hex (16)', alphabetSize: 16, defaultRates: [8_000, 30_000, 80_000] },
  { id: 'ton', label: 'TON', forgePath: '/ton', alphabet: 'Base64url', alphabetSize: 64, defaultRates: [2_000, 8_000, 20_000] },
  { id: 'cardano', label: 'Cardano', forgePath: '/cardano', alphabet: 'Bech32', alphabetSize: 32, defaultRates: [5_000, 20_000, 50_000] },
  { id: 'xrp', label: 'XRP', forgePath: '/xrp', alphabet: 'XRPL Base58', alphabetSize: 58, defaultRates: [4_000, 15_000, 40_000] },
];

export interface LabAnalysis {
  chain: LabChain;
  label: string;
  prefix: string;
  suffix: string;
  mode?: string;
  valid: boolean;
  /** empty = no input · ok = forgeable · impossible = beyond extreme / rejected as too hard */
  gauge: 'empty' | 'ok' | 'impossible';
  errors: string[];
  warnings: string[];
  difficulty: number;
  difficultyLabel: string;
  rarityLabel: string;
  alphabet: string;
  alphabetSize: number;
  forgeHref: string;
  timeRows: { rate: number; rateLabel: string; eta: string }[];
}

/** Past this on the log scale the dial sits at Extreme / Impossible */
const IMPOSSIBLE_DIFFICULTY = 1e15;

function rarityFromDifficulty(d: number): string {
  if (!Number.isFinite(d) || d >= IMPOSSIBLE_DIFFICULTY) return 'Impossible';
  if (d <= 1) return 'Any address';
  if (d < 100) return 'Very common';
  if (d < 10_000) return 'Common';
  if (d < 1_000_000) return 'Uncommon';
  if (d < 1_000_000_000) return 'Rare';
  if (d < 1_000_000_000_000) return 'Very rare';
  return 'Extremely rare';
}

function formatRate(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M/s`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k/s`;
  return `${n}/s`;
}

function oneInLabel(d: number): string {
  if (d <= 1) return '1 in 1';
  if (d < 1_000) return `1 in ~${Math.round(d)}`;
  if (d < 1_000_000) return `1 in ~${(d / 1_000).toFixed(1)}K`;
  if (d < 1_000_000_000) return `1 in ~${(d / 1_000_000).toFixed(1)}M`;
  if (d < 1_000_000_000_000) return `1 in ~${(d / 1_000_000_000).toFixed(1)}B`;
  return `1 in ~${(d / 1_000_000_000_000).toFixed(1)}T`;
}

export function analyzeLabPattern(input: {
  chain: LabChain;
  prefix: string;
  suffix: string;
  mode?: string;
  caseSensitive?: boolean;
}): LabAnalysis {
  const meta = LAB_CHAINS.find((c) => c.id === input.chain)!;
  const prefix = (input.prefix || '').trim();
  const suffix = (input.suffix || '').trim();
  const caseSensitive = Boolean(input.caseSensitive);
  const errors: string[] = [];
  const warnings: string[] = [];
  let difficulty = 1;
  let difficultyLabel = '~1 attempts';
  let etaFn = estimateTime;
  let mode = input.mode;

  if (!prefix && !suffix) {
    errors.push('Enter at least a prefix or suffix.');
  }

  switch (input.chain) {
    case 'sol': {
      const p = validatePrefix(prefix, caseSensitive);
      const s = validateSuffix(suffix, caseSensitive);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      if (!caseSensitive) warnings.push('Case-insensitive matching shrinks effective alphabet (~34).');
      if (/[0Oil]/.test(prefix + suffix)) {
        warnings.push('Base58 never contains 0, O, I, or l.');
      }
      difficulty = estimateDifficulty(prefix, suffix, caseSensitive);
      difficultyLabel = formatDifficulty(difficulty);
      mode = mode || 'wallet';
      break;
    }
    case 'evm': {
      const np = normalizeEthPattern(prefix);
      const ns = normalizeEthPattern(suffix);
      const p = validateEthPrefix(np);
      const s = validateEthSuffix(ns);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      warnings.push('Matching is hex-only (0-9, a-f), case-insensitive.');
      difficulty = estimateEthDifficulty(np, ns);
      difficultyLabel = formatEthDifficulty(difficulty);
      etaFn = estimateEthTime;
      mode = mode || 'wallet';
      break;
    }
    case 'btc': {
      const btcMode = (mode as BtcMode) || 'segwit';
      const p = validateBtcPrefix(prefix, btcMode, caseSensitive);
      const s = validateBtcSuffix(suffix, btcMode);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      if (btcMode === 'legacy') {
        warnings.push('Legacy addresses start with 1 — auto-prepended if omitted.');
      } else if (btcMode === 'taproot') {
        warnings.push('Taproot HRP bc1p is fixed; pattern matches the body.');
      } else {
        warnings.push('SegWit HRP bc1q is fixed; pattern matches the body.');
      }
      difficulty = estimateBtcDifficulty(prefix, suffix, btcMode, caseSensitive);
      difficultyLabel = formatBtcDifficulty(difficulty);
      etaFn = estimateBtcTime;
      mode = btcMode;
      break;
    }
    case 'tron': {
      const p = validateTronPrefix(prefix, caseSensitive);
      const s = validateTronSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      warnings.push('Leading T is auto-added. Case-sensitive lowercase after T is often impossible.');
      difficulty = estimateTronDifficulty(prefix, suffix, caseSensitive);
      difficultyLabel = formatTronDifficulty(difficulty);
      etaFn = estimateTronTime;
      mode = mode || 'wallet';
      break;
    }
    case 'aptos': {
      const p = validateAptosPrefix(prefix);
      const s = validateAptosSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      difficulty = estimateAptosDifficulty(prefix, suffix);
      difficultyLabel = formatAptosDifficulty(difficulty);
      etaFn = estimateAptosTime;
      break;
    }
    case 'sui': {
      const p = validateSuiPrefix(prefix);
      const s = validateSuiSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      difficulty = estimateSuiDifficulty(prefix, suffix);
      difficultyLabel = formatSuiDifficulty(difficulty);
      etaFn = estimateSuiTime;
      break;
    }
    case 'ton': {
      const tonMode = (mode as TonMode) || 'non-bounceable';
      const p = validateTonPrefix(prefix);
      const s = validateTonSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      warnings.push('TON addresses are case-sensitive (UQ / EQ).');
      difficulty = estimateTonDifficulty(prefix, suffix, tonMode);
      difficultyLabel = formatTonDifficulty(difficulty);
      etaFn = estimateTonTime;
      mode = tonMode;
      break;
    }
    case 'cardano': {
      const p = validateCardanoPrefix(prefix);
      const s = validateCardanoSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      warnings.push('Enterprise addr1… — body after HRP; first body char is constrained.');
      difficulty = estimateCardanoDifficulty(prefix, suffix);
      difficultyLabel = formatCardanoDifficulty(difficulty);
      etaFn = estimateCardanoTime;
      break;
    }
    case 'xrp': {
      const p = validateXrpPrefix(prefix);
      const s = validateXrpSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      warnings.push('Classic r… — leading r auto-handled; XRPL Base58 ≠ Bitcoin Base58.');
      difficulty = estimateXrpDifficulty(prefix, suffix, caseSensitive);
      difficultyLabel = formatXrpDifficulty(difficulty);
      etaFn = estimateXrpTime;
      break;
    }
  }

  const qs = new URLSearchParams();
  if (prefix) qs.set('prefix', prefix);
  if (suffix) qs.set('suffix', suffix);
  if (mode && mode !== 'wallet') qs.set('mode', mode);
  const forgeHref = qs.toString() ? `${meta.forgePath}?${qs}` : meta.forgePath;

  const hasPattern = Boolean(prefix || suffix);
  const tooHardError = errors.some((e) =>
    /too long|impossible|effectively impossible/i.test(e)
  );
  const beyondExtreme =
    !Number.isFinite(difficulty) || difficulty >= IMPOSSIBLE_DIFFICULTY || tooHardError;
  const gauge: LabAnalysis['gauge'] = !hasPattern
    ? 'empty'
    : beyondExtreme
      ? 'impossible'
      : 'ok';

  const rarityWord = rarityFromDifficulty(
    beyondExtreme ? IMPOSSIBLE_DIFFICULTY : difficulty
  );
  const rarityLabel =
    gauge === 'impossible'
      ? 'Impossible · beyond extreme'
      : `${rarityWord} · ${oneInLabel(difficulty)}`;

  const safeDifficulty = Number.isFinite(difficulty) ? difficulty : IMPOSSIBLE_DIFFICULTY;

  return {
    chain: input.chain,
    label: meta.label,
    prefix,
    suffix,
    mode,
    valid: errors.length === 0 && hasPattern,
    gauge,
    errors,
    warnings,
    difficulty: safeDifficulty,
    difficultyLabel:
      gauge === 'impossible'
        ? 'impossible'
        : difficultyLabel,
    rarityLabel,
    alphabet: meta.alphabet,
    alphabetSize: meta.alphabetSize,
    forgeHref,
    timeRows: meta.defaultRates.map((rate) => ({
      rate,
      rateLabel: formatRate(rate),
      eta: gauge === 'impossible' ? '—' : etaFn(safeDifficulty, rate),
    })),
  };
}

export function buildForgeHref(chain: LabChain, prefix: string, suffix: string, mode?: string): string {
  return analyzeLabPattern({ chain, prefix, suffix, mode }).forgeHref;
}
