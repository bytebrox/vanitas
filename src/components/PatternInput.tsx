'use client';

/**
 * Pattern fields — open ledger rows, no panel chrome
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { validatePrefix, validateSuffix } from '@/lib/validation';
import { RichParagraph } from '@/lib/rich-text';
import type { PatternTarget } from '@/lib/patterns';
import {
  MultiPatternField,
  mergePatternTargets,
  patternAlternatives,
} from './MultiPatternField';

interface PatternInputProps {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  patterns?: PatternTarget[];
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onCaseSensitiveChange: (value: boolean) => void;
  onPatternsChange?: (patterns: PatternTarget[]) => void;
  disabled?: boolean;
}

export function PatternInput({
  prefix,
  suffix,
  caseSensitive,
  patterns,
  onPrefixChange,
  onSuffixChange,
  onCaseSensitiveChange,
  onPatternsChange,
  disabled = false,
}: PatternInputProps) {
  const t = useTranslations('common');
  const tForge = useTranslations('forge.pattern');
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);

  useEffect(() => {
    const result = validatePrefix(prefix, caseSensitive);
    setPrefixError(result.valid ? null : result.error || null);
  }, [prefix, caseSensitive]);

  useEffect(() => {
    const result = validateSuffix(suffix, caseSensitive);
    setSuffixError(result.valid ? null : result.error || null);
  }, [suffix, caseSensitive]);

  const setPrimary = (nextPrefix: string, nextSuffix: string) => {
    onPrefixChange(nextPrefix);
    onSuffixChange(nextSuffix);
    onPatternsChange?.(
      mergePatternTargets(
        { prefix: nextPrefix, suffix: nextSuffix },
        patternAlternatives(patterns)
      )
    );
  };

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">{t('prefix')}</span>
        <div>
          <input
            id="prefix"
            type="text"
            value={prefix}
            onChange={(e) => {
              setPrimary(e.target.value, suffix);
            }}
            placeholder={tForge('solPrefixPh')}
            maxLength={8}
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 sm:py-2 text-xl sm:text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          <p className="text-micro text-muted mt-2">{t('startsAddress')}</p>
          {prefixError && <p className="text-micro text-accent mt-1">{prefixError}</p>}
        </div>
      </label>

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">{t('suffix')}</span>
        <div>
          <input
            id="suffix"
            type="text"
            value={suffix}
            onChange={(e) => {
              setPrimary(prefix, e.target.value);
            }}
            placeholder={tForge('solSuffixPh')}
            maxLength={8}
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 sm:py-2 text-xl sm:text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          <p className="text-micro text-muted mt-2">{t('endsAddress')}</p>
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-center">
        <span className="text-micro uppercase tracking-[0.18em] text-muted">{t('match')}</span>
        <label className={`flex items-center gap-3 min-h-11 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
          <input
            id="caseSensitive"
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => {
              onCaseSensitiveChange(e.target.checked);
            }}
            disabled={disabled}
            className="w-5 h-5 sm:w-4 sm:h-4 accent-ink"
          />
          <span className="text-sm text-ink">{t('caseSensitive')}</span>
        </label>
      </div>

      <RichParagraph text={tForge('solAlphabet')} className="py-4 text-micro text-muted" />

      {onPatternsChange && (
        <div className="py-4">
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
