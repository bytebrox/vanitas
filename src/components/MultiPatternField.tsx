'use client';

/**
 * Extra OR-targets beyond the primary prefix/suffix pair.
 * Cap at MAX_PATTERN_TARGETS including the primary (managed by the parent).
 */

import { useTranslations } from 'next-intl';
import {
  MAX_PATTERN_TARGETS,
  type PatternTarget,
} from '@/lib/patterns';

interface MultiPatternFieldProps {
  /** Alternatives only — index 1…n. Primary stays in the main PatternInput. */
  alternatives: PatternTarget[];
  onChange: (alternatives: PatternTarget[]) => void;
  disabled?: boolean;
  sanitize?: (value: string) => string;
  maxLength?: number;
  /** Show a leading 0x on prefix fields (EVM / Aptos / Sui). */
  show0x?: boolean;
}

export function MultiPatternField({
  alternatives,
  onChange,
  disabled = false,
  sanitize = (v) => v,
  maxLength = 8,
  show0x = false,
}: MultiPatternFieldProps) {
  const t = useTranslations('multiPattern');
  // primary + alternatives ≤ MAX
  const canAdd = alternatives.length < MAX_PATTERN_TARGETS - 1;

  const updateAt = (index: number, patch: Partial<PatternTarget>) => {
    onChange(
      alternatives.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const removeAt = (index: number) => {
    onChange(alternatives.filter((_, i) => i !== index));
  };

  const add = () => {
    if (!canAdd || disabled) return;
    onChange([...alternatives, { prefix: '', suffix: '' }]);
  };

  return (
    <div className="border-t border-ink/15 pt-4 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-micro uppercase tracking-[0.16em] text-muted">{t('title')}</p>
          <p className="text-micro text-muted mt-1 normal-case tracking-normal">{t('hint')}</p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={disabled || !canAdd}
          className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent disabled:opacity-40 disabled:border-transparent"
        >
          {t('add')}
        </button>
      </div>

      {alternatives.length > 0 && (
        <ul className="space-y-3">
          {alternatives.map((row, index) => (
            <li
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 sm:gap-3 items-end"
            >
              <label className="block">
                <span className="text-micro uppercase tracking-[0.14em] text-muted">
                  {t('altPrefix', { n: index + 2 })}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  {show0x && (
                    <span className="font-mono text-sm text-ink/35 select-none">0x</span>
                  )}
                  <input
                    type="text"
                    value={row.prefix}
                    maxLength={maxLength}
                    disabled={disabled}
                    spellCheck={false}
                    autoCapitalize="off"
                    onChange={(e) => {
                      updateAt(index, { prefix: sanitize(e.target.value) });
                    }}
                    className="w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-1.5 font-mono text-sm focus:outline-none focus:border-accent disabled:opacity-50"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-micro uppercase tracking-[0.14em] text-muted">
                  {t('altSuffix', { n: index + 2 })}
                </span>
                <input
                  type="text"
                  value={row.suffix}
                  maxLength={maxLength}
                  disabled={disabled}
                  spellCheck={false}
                  autoCapitalize="off"
                  onChange={(e) => {
                    updateAt(index, { suffix: sanitize(e.target.value) });
                  }}
                  className="mt-1 w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-1.5 font-mono text-sm focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  removeAt(index);
                }}
                disabled={disabled}
                className="text-micro uppercase tracking-[0.12em] text-muted hover:text-ink py-1.5 disabled:opacity-40"
              >
                {t('remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Keep primary as patterns[0] and replace the rest. */
export function mergePatternTargets(
  primary: PatternTarget,
  alternatives: PatternTarget[]
): PatternTarget[] {
  return [primary, ...alternatives];
}

export function patternAlternatives(
  patterns: PatternTarget[] | undefined
): PatternTarget[] {
  return (patterns ?? []).slice(1);
}
