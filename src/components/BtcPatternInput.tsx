'use client';

import { useState, useEffect } from 'react';
import { validateBtcPrefix, validateBtcSuffix } from '@/lib/btc-validation';
import type { BtcMode } from '@/types/btc';
import { BTC_BASE58, BTC_BECH32 } from '@/types/btc';
import type { PatternTarget } from '@/lib/patterns';
import {
  MultiPatternField,
  mergePatternTargets,
  patternAlternatives,
} from './MultiPatternField';
import {
  PatternTemplates,
  BTC_LEGACY_TEMPLATES,
  BTC_SEGWIT_TEMPLATES,
} from './PatternTemplates';

interface BtcPatternInputProps {
  prefix: string;
  suffix: string;
  mode: BtcMode;
  caseSensitive: boolean;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onCaseSensitiveChange: (value: boolean) => void;
  disabled?: boolean;
  patterns?: PatternTarget[];
  onPatternsChange?: (patterns: PatternTarget[]) => void;
}

export function BtcPatternInput({
  prefix,
  suffix,
  mode,
  caseSensitive,
  onPrefixChange,
  onSuffixChange,
  onCaseSensitiveChange,
  disabled = false,
  patterns,
  onPatternsChange,
}: BtcPatternInputProps) {
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);
  const isBech = mode === 'segwit' || mode === 'taproot';

  useEffect(() => {
    const r = validateBtcPrefix(prefix, mode, caseSensitive);
    setPrefixError(r.valid ? null : r.error || null);
  }, [prefix, mode, caseSensitive]);

  useEffect(() => {
    const r = validateBtcSuffix(suffix, mode);
    setSuffixError(r.valid ? null : r.error || null);
  }, [suffix, mode]);

  const sanitize = (value: string) => {
    if (isBech) {
      return value.toLowerCase().replace(new RegExp(`[^${BTC_BECH32}bc1]`, 'g'), '').slice(0, 20);
    }
    return [...value].filter((c) => BTC_BASE58.includes(c)).join('').slice(0, 12);
  };

  const hint =
    mode === 'taproot'
      ? 'Taproot addresses start with bc1p — type a body like “cafe”, or the full bc1p… prefix.'
      : mode === 'segwit'
        ? 'SegWit addresses start with bc1q — type a body like “cafe”, or the full bc1q… prefix.'
        : 'Legacy addresses start with 1 — type BTC to search for 1BTC… (the leading 1 is added automatically).';

  const templates =
    mode === 'legacy'
      ? BTC_LEGACY_TEMPLATES
      : BTC_SEGWIT_TEMPLATES;

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <p className="text-micro leading-relaxed text-muted">{hint}</p>
      </div>

      <PatternTemplates
        templates={templates}
        disabled={disabled}
        onSelect={(p) => { onPrefixChange(sanitize(p)); }}
      />

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Prefix</span>
        <div>
          <input
            type="text"
            value={prefix}
            onChange={(e) => { onPrefixChange(sanitize(e.target.value)); }}
            placeholder={isBech ? 'cafe' : 'BTC'}
            maxLength={20}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl sm:text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}
              ${isBech ? 'lowercase' : ''}`}
          />
          {prefixError && <p className="text-micro text-accent mt-1">{prefixError}</p>}
        </div>
      </label>

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Suffix</span>
        <div>
          <input
            type="text"
            value={suffix}
            onChange={(e) => { onSuffixChange(sanitize(e.target.value)); }}
            placeholder={isBech ? 'dead' : 'sat'}
            maxLength={12}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl sm:text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}
              ${isBech ? 'lowercase' : ''}`}
          />
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>

      {mode === 'legacy' && (
        <label className="flex items-start gap-3 py-4 cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            disabled={disabled}
            onChange={(e) => { onCaseSensitiveChange(e.target.checked); }}
            className="accent-ink mt-0.5"
          />
          <span>
            <span className="text-micro uppercase tracking-[0.16em] text-muted block">Case sensitive</span>
            <span className="text-micro text-muted normal-case tracking-normal leading-relaxed block mt-1">
              Off (recommended for lowercase patterns): after 1, lowercase is extremely rare when
              Case sensitive is on.
            </span>
          </span>
        </label>
      )}

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
