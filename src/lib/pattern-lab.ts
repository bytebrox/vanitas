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
import {
  combineOrDifficulty,
  normalizePatterns,
  type PatternTarget,
} from '@/lib/patterns';

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
  /** All OR targets (primary first). */
  patterns: PatternTarget[];
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

type PatternScore = {
  difficulty: number;
  difficultyLabel: string;
  etaFn: (d: number, rate: number) => string;
};

function scoreOnePattern(
  chain: LabChain,
  prefix: string,
  suffix: string,
  caseSensitive: boolean,
  mode: string | undefined,
  errors: string[],
  warnings: string[],
): PatternScore {
  let difficulty = 1;
  let difficultyLabel = '~1 attempts';
  let etaFn = estimateTime;

  switch (chain) {
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
      break;
    }
    case 'evm': {
      const np = normalizeEthPattern(prefix);
      const ns = normalizeEthPattern(suffix);
      const p = validateEthPrefix(np);
      const s = validateEthSuffix(ns);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      difficulty = estimateEthDifficulty(np, ns);
      difficultyLabel = formatEthDifficulty(difficulty);
      etaFn = estimateEthTime;
      if (mode === 'create2-salt' || mode === 'create2-deployer') {
        warnings.push('CREATE2 difficulty is the same math as EOA — salt/deployer search changes tooling, not odds.');
      }
      break;
    }
    case 'btc': {
      const btcMode = (mode || 'legacy') as BtcMode;
      const p = validateBtcPrefix(prefix, btcMode, caseSensitive);
      const s = validateBtcSuffix(suffix, btcMode);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      difficulty = estimateBtcDifficulty(prefix, suffix, btcMode, caseSensitive);
      difficultyLabel = formatBtcDifficulty(difficulty);
      etaFn = estimateBtcTime;
      break;
    }
    case 'tron': {
      const p = validateTronPrefix(prefix, caseSensitive);
      const s = validateTronSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      difficulty = estimateTronDifficulty(prefix, suffix, caseSensitive);
      difficultyLabel = formatTronDifficulty(difficulty);
      etaFn = estimateTronTime;
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
      const tonMode = (mode || 'non-bounceable') as TonMode;
      const p = validateTonPrefix(prefix);
      const s = validateTonSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
      difficulty = estimateTonDifficulty(prefix, suffix, tonMode);
      difficultyLabel = formatTonDifficulty(difficulty);
      etaFn = estimateTonTime;
      break;
    }
    case 'cardano': {
      const p = validateCardanoPrefix(prefix);
      const s = validateCardanoSuffix(suffix);
      if (!p.valid && p.error) errors.push(p.error);
      if (!s.valid && s.error) errors.push(s.error);
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
      difficulty = estimateXrpDifficulty(prefix, suffix, caseSensitive);
      difficultyLabel = formatXrpDifficulty(difficulty);
      etaFn = estimateXrpTime;
      break;
    }
  }

  return { difficulty, difficultyLabel, etaFn };
}

export function analyzeLabPattern(input: {
  chain: LabChain;
  prefix: string;
  suffix: string;
  patterns?: PatternTarget[];
  mode?: string;
  caseSensitive?: boolean;
}): LabAnalysis {
  const meta = LAB_CHAINS.find((c) => c.id === input.chain)!;
  const caseSensitive = Boolean(input.caseSensitive);
  const errors: string[] = [];
  const warnings: string[] = [];
  let mode = input.mode;

  const rawPatterns =
    input.patterns && input.patterns.length > 0
      ? input.patterns
      : [{ prefix: input.prefix || '', suffix: input.suffix || '' }];
  const patterns = normalizePatterns(rawPatterns);
  const prefix = patterns[0]?.prefix ?? '';
  const suffix = patterns[0]?.suffix ?? '';

  if (patterns.length === 0) {
    errors.push('Enter at least a prefix or suffix.');
  }

  if (input.chain === 'sol') mode = mode || 'wallet';
  if (input.chain === 'evm') mode = mode || 'wallet';
  if (input.chain === 'btc') mode = mode || 'legacy';
  if (input.chain === 'ton') mode = mode || 'non-bounceable';

  const diffs: number[] = [];
  let etaFn = estimateTime;
  let primaryLabel = '~1 attempts';

  for (let i = 0; i < patterns.length; i++) {
    const pt = patterns[i]!;
    const beforeErr = errors.length;
    const score = scoreOnePattern(
      input.chain,
      pt.prefix,
      pt.suffix,
      caseSensitive,
      mode,
      errors,
      i === 0 ? warnings : [],
    );
    if (errors.length > beforeErr && patterns.length > 1) {
      const tagged = errors.splice(beforeErr).map((e) => `Pattern ${i + 1}: ${e}`);
      errors.push(...tagged);
    }
    diffs.push(score.difficulty);
    if (i === 0) {
      etaFn = score.etaFn;
      primaryLabel = score.difficultyLabel;
    }
  }

  const difficulty = patterns.length <= 1 ? (diffs[0] ?? 1) : combineOrDifficulty(diffs);
  const difficultyLabel =
    patterns.length <= 1
      ? primaryLabel
      : `~${oneInLabel(difficulty).replace(/^1 in ~?/, '')} attempts (OR)`;

  if (patterns.length > 1) {
    warnings.push(`OR match across ${patterns.length} patterns — combined odds assume non-overlapping hits.`);
  }

  const valid = errors.length === 0 && patterns.length > 0;
  const empty = patterns.length === 0;
  const gauge: LabAnalysis['gauge'] = empty
    ? 'empty'
    : !valid || difficulty >= IMPOSSIBLE_DIFFICULTY
      ? 'impossible'
      : 'ok';

  const forgeHref = buildForgeHref(input.chain, patterns, mode, caseSensitive);

  return {
    chain: input.chain,
    label: meta.label,
    prefix,
    suffix,
    patterns,
    mode,
    valid,
    gauge,
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
    difficulty,
    difficultyLabel,
    rarityLabel: rarityFromDifficulty(difficulty),
    alphabet: meta.alphabet,
    alphabetSize: meta.alphabetSize,
    forgeHref,
    timeRows: meta.defaultRates.map((rate) => ({
      rate,
      rateLabel: formatRate(rate),
      eta: etaFn(difficulty, rate),
    })),
  };
}

export function buildForgeHref(
  chain: LabChain,
  patternsOrPrefix: PatternTarget[] | string,
  suffixOrMode?: string,
  modeOrCs?: string | boolean,
  caseSensitiveLegacy?: boolean,
): string {
  const meta = LAB_CHAINS.find((c) => c.id === chain)!;
  const params = new URLSearchParams();

  let patterns: PatternTarget[];
  let mode: string | undefined;
  let caseSensitive = false;

  if (typeof patternsOrPrefix === 'string') {
    patterns = normalizePatterns([{ prefix: patternsOrPrefix, suffix: suffixOrMode || '' }]);
    mode = typeof modeOrCs === 'string' ? modeOrCs : undefined;
    caseSensitive = Boolean(caseSensitiveLegacy);
  } else {
    patterns = normalizePatterns(patternsOrPrefix);
    mode = typeof suffixOrMode === 'string' ? suffixOrMode : undefined;
    caseSensitive = Boolean(modeOrCs);
  }

  const primary = patterns[0];
  if (primary?.prefix) params.set('prefix', primary.prefix);
  if (primary?.suffix) params.set('suffix', primary.suffix);
  for (let i = 1; i < patterns.length; i++) {
    const pt = patterns[i]!;
    if (pt.prefix) params.set(`p${i}`, pt.prefix);
    if (pt.suffix) params.set(`s${i}`, pt.suffix);
  }
  if (mode) params.set('mode', mode);
  if (caseSensitive) {
    if (chain === 'sol' || chain === 'btc' || chain === 'tron') params.set('cs', '1');
    if (chain === 'xrp') params.set('case', '1');
  }
  const q = params.toString();
  return q ? `${meta.forgePath}?${q}` : meta.forgePath;
}
