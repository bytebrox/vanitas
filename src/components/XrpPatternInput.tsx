'use client';

import { useState, useEffect } from 'react';
import { validateXrpPrefix, validateXrpSuffix, xrpPrefixBody } from '@/lib/xrp-validation';
import { PatternTemplates, XRP_TEMPLATES } from './PatternTemplates';
import { XRP_BASE58 } from '@/types/xrp';

interface Props {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onCaseSensitiveChange: (value: boolean) => void;
  disabled?: boolean;
}

export function XrpPatternInput({
  prefix,
  suffix,
  caseSensitive,
  onPrefixChange,
  onSuffixChange,
  onCaseSensitiveChange,
  disabled = false,
}: Props) {
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);

  useEffect(() => {
    const r = validateXrpPrefix(prefix);
    setPrefixError(r.valid ? null : r.error || null);
  }, [prefix]);

  useEffect(() => {
    const r = validateXrpSuffix(suffix);
    setSuffixError(r.valid ? null : r.error || null);
  }, [suffix]);

  const sanitize = (value: string) =>
    [...value]
      .filter((c) => XRP_BASE58.includes(c))
      .join('')
      .replace(/^r+/, '')
      .slice(0, 10);

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <p className="text-micro leading-relaxed text-muted">
          Classic XRPL addresses always start with <span className="font-mono">r</span>. Type the
          vanity part after that. Alphabet differs from Bitcoin Base58.
        </p>
      </div>
      <PatternTemplates
        templates={XRP_TEMPLATES}
        disabled={disabled}
        onSelect={(p) => {
          onPrefixChange(sanitize(p));
        }}
      />
      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Prefix</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl text-ink/35 select-none">r</span>
            <input
              type="text"
              value={xrpPrefixBody(prefix)}
              onChange={(e) => {
                onPrefixChange(sanitize(e.target.value));
              }}
              placeholder="Ace"
              maxLength={10}
              spellCheck={false}
              autoCapitalize="off"
              disabled={disabled}
              className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl font-mono tracking-wide placeholder:text-ink/20 focus:outline-none focus:border-accent ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''} ${caseSensitive ? '' : 'lowercase'}`}
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
              onSuffixChange(sanitize(e.target.value));
            }}
            placeholder=""
            maxLength={10}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl font-mono tracking-wide placeholder:text-ink/20 focus:outline-none focus:border-accent ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''} ${caseSensitive ? '' : 'lowercase'}`}
          />
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>
      <label className="flex items-center gap-3 py-4 cursor-pointer">
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => {
            onCaseSensitiveChange(e.target.checked);
          }}
          disabled={disabled}
          className="accent-ink"
        />
        <span className="text-micro uppercase tracking-[0.16em] text-muted">
          Case sensitive
        </span>
      </label>
    </div>
  );
}
