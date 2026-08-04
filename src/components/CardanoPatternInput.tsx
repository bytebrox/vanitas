'use client';

import { useState, useEffect } from 'react';
import {
  validateCardanoPrefix,
  validateCardanoSuffix,
  cardanoUserPrefix,
  stripCardanoHrp,
} from '@/lib/cardano-validation';
import { PatternTemplates, CARDANO_TEMPLATES } from './PatternTemplates';
import type { PatternTarget } from '@/lib/patterns';
import {
  MultiPatternField,
  mergePatternTargets,
  patternAlternatives,
} from './MultiPatternField';

interface Props {
  prefix: string;
  suffix: string;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  disabled?: boolean;
  patterns?: PatternTarget[];
  onPatternsChange?: (patterns: PatternTarget[]) => void;
}

export function CardanoPatternInput({
  prefix,
  suffix,
  onPrefixChange,
  onSuffixChange,
  disabled = false,
  patterns,
  onPatternsChange,
}: Props) {
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);

  useEffect(() => {
    const r = validateCardanoPrefix(prefix);
    setPrefixError(r.valid ? null : r.error || null);
  }, [prefix]);

  useEffect(() => {
    const r = validateCardanoSuffix(suffix);
    setSuffixError(r.valid ? null : r.error || null);
  }, [suffix]);

  const sanitizePrefix = (value: string) =>
    cardanoUserPrefix(value)
      .replace(/[^qpzry9x8gf2tvdw0s3jn54khce6mua7l]/gi, '')
      .slice(0, 8)
      .toLowerCase();

  const sanitizeSuffix = (value: string) =>
    stripCardanoHrp(value)
      .replace(/[^qpzry9x8gf2tvdw0s3jn54khce6mua7l]/gi, '')
      .slice(0, 8)
      .toLowerCase();

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <p className="text-micro leading-relaxed text-muted">
          Enterprise mainnet addresses always start with{' '}
          <span className="font-mono">addr1v</span>, then{' '}
          <span className="font-mono">y</span>/<span className="font-mono">9</span>/
          <span className="font-mono">x</span>/<span className="font-mono">8</span>. Type the
          vanity part from there. Alphabet: qpzry9x8gf2tvdw0s3jn54khce6mua7l.
        </p>
      </div>
      <PatternTemplates
        templates={CARDANO_TEMPLATES}
        disabled={disabled}
        onSelect={(p) => {
          onPrefixChange(sanitizePrefix(p));
        }}
      />
      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Prefix</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl text-ink/35 select-none">addr1v</span>
            <input
              type="text"
              value={cardanoUserPrefix(prefix)}
              onChange={(e) => {
                onPrefixChange(sanitizePrefix(e.target.value));
              }}
              placeholder="ycafe"
              maxLength={8}
              spellCheck={false}
              autoCapitalize="off"
              disabled={disabled}
              className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl font-mono tracking-wide lowercase placeholder:text-ink/20 focus:outline-none focus:border-accent ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
            />
          </div>
          {prefixError && <p className="text-micro text-accent mt-1">{prefixError}</p>}
        </div>
      </label>
      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Suffix</span>
        <div>
          <input
            type="text"
            value={suffix}
            onChange={(e) => {
              onSuffixChange(sanitizeSuffix(e.target.value));
            }}
            placeholder="dead"
            maxLength={8}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl font-mono tracking-wide lowercase placeholder:text-ink/20 focus:outline-none focus:border-accent ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>

      {onPatternsChange && (
        <div className="py-4 border-t border-ink/15">
          <MultiPatternField
            alternatives={patternAlternatives(patterns)}
            disabled={disabled}
            onChange={(alts) => {
              onPatternsChange(mergePatternTargets({ prefix, suffix }, alts));
            }}
          />
        </div>
      )}
    </div>
  );
}
