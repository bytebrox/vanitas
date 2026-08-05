/**
 * Shared vanity pattern targets — one forge run can OR-match several.
 */

export interface PatternTarget {
  prefix: string;
  suffix: string;
}

/** Collapse scalar prefix/suffix and optional patterns[] into a clean list. */
export function normalizePatterns(
  input:
    | { patterns?: PatternTarget[]; prefix?: string; suffix?: string }
    | PatternTarget[]
    | null
    | undefined
): PatternTarget[] {
  if (Array.isArray(input)) {
    return input
      .map((p) => ({ prefix: (p.prefix || '').trim(), suffix: (p.suffix || '').trim() }))
      .filter((p) => p.prefix || p.suffix);
  }
  if (!input) return [];

  const prefix = (input.prefix || '').trim();
  const suffix = (input.suffix || '').trim();
  const hasPrimary = Boolean(prefix || suffix);
  const rest = (input.patterns ?? []).slice(hasPrimary ? 1 : 0);

  if (hasPrimary) {
    return normalizePatterns([{ prefix, suffix }, ...rest]);
  }
  return normalizePatterns(rest);
}

export function formatMatchedPattern(target: PatternTarget): string {
  return `${target.prefix}...${target.suffix}`;
}

/** OR difficulty: 1 / Σ(1/d_i). Empty → Infinity. */
export function combineOrDifficulty(difficulties: number[]): number {
  const valid = difficulties.filter((d) => Number.isFinite(d) && d > 0);
  if (valid.length === 0) return Infinity;
  let sum = 0;
  for (const d of valid) sum += 1 / d;
  return sum > 0 ? 1 / sum : Infinity;
}

export const MAX_PATTERN_TARGETS = 8;

/** True when any prefix/suffix (scalar or patterns[]) is non-empty. */
export function hasAnyPattern(
  input:
    | { patterns?: PatternTarget[]; prefix?: string; suffix?: string }
    | PatternTarget[]
    | null
    | undefined
): boolean {
  return normalizePatterns(input).length > 0;
}

/** Read primary + OR alternatives from forge/lab share query (`prefix`/`suffix` + `p1`/`s1`…). */
export function patternsFromSearchParams(
  params: URLSearchParams | { get(name: string): string | null }
): PatternTarget[] {
  const raw: PatternTarget[] = [
    {
      prefix: params.get('prefix') || '',
      suffix: params.get('suffix') || '',
    },
  ];
  for (let i = 1; i < MAX_PATTERN_TARGETS; i++) {
    const p = params.get(`p${i}`);
    const s = params.get(`s${i}`);
    if (p == null && s == null) break;
    raw.push({ prefix: p || '', suffix: s || '' });
  }
  return normalizePatterns(raw);
}

/** Write primary + alternatives onto a URLSearchParams (does not clear unrelated keys). */
export function writePatternsToSearchParams(
  params: URLSearchParams,
  patterns: PatternTarget[] | { patterns?: PatternTarget[]; prefix?: string; suffix?: string }
): void {
  const list = normalizePatterns(patterns);
  const primary = list[0];
  if (primary?.prefix) params.set('prefix', primary.prefix);
  if (primary?.suffix) params.set('suffix', primary.suffix);
  for (let i = 1; i < list.length; i++) {
    const pt = list[i]!;
    if (pt.prefix) params.set(`p${i}`, pt.prefix);
    if (pt.suffix) params.set(`s${i}`, pt.suffix);
  }
}

