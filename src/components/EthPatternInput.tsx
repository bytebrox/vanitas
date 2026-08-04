'use client';

/**
 * ETH hex pattern fields — ledger rows
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { validateEthPrefix, validateEthSuffix } from '@/lib/eth-validation';
import { RichParagraph } from '@/lib/rich-text';
import type { PatternTarget } from '@/lib/patterns';
import { suggestPatternCasings } from '@/lib/eip55';
import {
  MultiPatternField,
  mergePatternTargets,
  patternAlternatives,
} from './MultiPatternField';

interface EthPatternInputProps {
  prefix: string;
  suffix: string;
  patterns?: PatternTarget[];
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onPatternsChange?: (patterns: PatternTarget[]) => void;
  disabled?: boolean;
}

export function EthPatternInput({
  prefix,
  suffix,
  patterns,
  onPrefixChange,
  onSuffixChange,
  onPatternsChange,
  disabled = false,
}: EthPatternInputProps) {
  const t = useTranslations('common');
  const tForge = useTranslations('forge.pattern');
  const tEip = useTranslations('eip55');
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);
  const [strippedHint, setStrippedHint] = useState<string | null>(null);

  useEffect(() => {
    const result = validateEthPrefix(prefix);
    setPrefixError(result.valid ? null : result.error || null);
  }, [prefix]);

  useEffect(() => {
    const result = validateEthSuffix(suffix);
    setSuffixError(result.valid ? null : result.error || null);
  }, [suffix]);

  const sanitize = (value: string) => {
    const withoutOx = value.replace(/^0x/i, '');
    const cleaned = withoutOx.replace(/[^0-9a-fA-F]/g, '').slice(0, 8);
    const removed = withoutOx.replace(/[0-9a-fA-F]/g, '').replace(/\s/g, '');
    if (removed.length > 0) {
      const unique = [...new Set(removed.split(''))].join(' ');
      setStrippedHint(unique);
    }
    return cleaned;
  };

  const setPrimary = (nextPrefix: string, nextSuffix: string) => {
    onPrefixChange(nextPrefix);
    onSuffixChange(nextSuffix);
    onPatternsChange?.(
      mergePatternTargets({ prefix: nextPrefix, suffix: nextSuffix }, patternAlternatives(patterns))
    );
  };

  const prefixCasings = useMemo(
    () => (prefix && !prefixError ? suggestPatternCasings(prefix) : []),
    [prefix, prefixError]
  );
  const suffixCasings = useMemo(
    () => (suffix && !suffixError ? suggestPatternCasings(suffix) : []),
    [suffix, suffixError]
  );

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <RichParagraph
          text={tForge('ethHexNote')}
          className="text-micro leading-relaxed"
          codeClassName="font-mono"
          boldClassName="font-mono font-bold text-ink"
        />
        {strippedHint && (
          <p className="text-micro mt-2 font-mono" style={{ color: '#B42318' }}>
            {tForge('ethIgnored', { chars: strippedHint })}
          </p>
        )}
      </div>

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">{t('prefix')}</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl text-ink/35 select-none">0x</span>
            <input
              id="eth-prefix"
              type="text"
              value={prefix}
              onChange={(e) => {
                setPrimary(sanitize(e.target.value), suffix);
              }}
              placeholder={tForge('ethPrefixPh')}
              maxLength={8}
              spellCheck={false}
              autoCapitalize="off"
              disabled={disabled}
              className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 sm:py-2 text-xl sm:text-2xl font-mono tracking-wide
                placeholder:text-ink/20 focus:outline-none focus:border-accent
                ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
            />
          </div>
          <p className="text-micro text-muted mt-2">{tForge('ethAfter0x')}</p>
          {prefixError && <p className="text-micro text-accent mt-1">{prefixError}</p>}
          {prefixCasings.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-micro uppercase tracking-[0.12em] text-muted">{tEip('casings')}</span>
              {prefixCasings.map((c) => (
                <button
                  key={`p-${c}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setPrimary(c, suffix);
                  }}
                  className="font-mono text-micro text-ink/80 hover:text-accent border-b border-ink/20 hover:border-accent pb-0.5"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </label>

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">{t('suffix')}</span>
        <div>
          <input
            id="eth-suffix"
            type="text"
            value={suffix}
            onChange={(e) => {
              setPrimary(prefix, sanitize(e.target.value));
            }}
            placeholder={tForge('ethSuffixPh')}
            maxLength={8}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 sm:py-2 text-xl sm:text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          <p className="text-micro text-muted mt-2">{t('endsAddress')}</p>
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
          {suffixCasings.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-micro uppercase tracking-[0.12em] text-muted">{tEip('casings')}</span>
              {suffixCasings.map((c) => (
                <button
                  key={`s-${c}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setPrimary(prefix, c);
                  }}
                  className="font-mono text-micro text-ink/80 hover:text-accent border-b border-ink/20 hover:border-accent pb-0.5"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </label>

      <div className="py-4 space-y-2">
        <RichParagraph text={tForge('ethCaseNote')} className="text-micro text-muted" />
        <p className="text-micro text-muted leading-relaxed">{tEip('preFindNote')}</p>
      </div>

      {onPatternsChange && (
        <div className="py-4">
          <MultiPatternField
            alternatives={patternAlternatives(patterns)}
            disabled={disabled}
            show0x
            sanitize={sanitize}
            onChange={(alts) => {
              onPatternsChange(mergePatternTargets({ prefix, suffix }, alts));
            }}
          />
        </div>
      )}
    </div>
  );
}
