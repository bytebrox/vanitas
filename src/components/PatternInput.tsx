'use client';

/**
 * Pattern fields — open ledger rows, no panel chrome
 */

import { useState, useEffect } from 'react';
import { validatePrefix, validateSuffix } from '@/lib/validation';

interface PatternInputProps {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onCaseSensitiveChange: (value: boolean) => void;
  disabled?: boolean;
}

export function PatternInput({
  prefix,
  suffix,
  caseSensitive,
  onPrefixChange,
  onSuffixChange,
  onCaseSensitiveChange,
  disabled = false,
}: PatternInputProps) {
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

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted pt-3">Prefix</span>
        <div>
          <input
            id="prefix"
            type="text"
            value={prefix}
            onChange={(e) => { onPrefixChange(e.target.value); }}
            placeholder="SOL"
            maxLength={8}
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2 text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          <p className="text-micro text-muted mt-2">Starts the address</p>
          {prefixError && <p className="text-micro text-accent mt-1">{prefixError}</p>}
        </div>
      </label>

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted pt-3">Suffix</span>
        <div>
          <input
            id="suffix"
            type="text"
            value={suffix}
            onChange={(e) => { onSuffixChange(e.target.value); }}
            placeholder="xyz"
            maxLength={8}
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2 text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          <p className="text-micro text-muted mt-2">Ends the address</p>
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-5 items-center">
        <span className="text-micro uppercase tracking-[0.18em] text-muted">Match</span>
        <label className={`flex items-center gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
          <input
            id="caseSensitive"
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => { onCaseSensitiveChange(e.target.checked); }}
            disabled={disabled}
            className="w-4 h-4 accent-ink"
          />
          <span className="text-sm text-ink">Case sensitive</span>
        </label>
      </div>

      <p className="py-4 text-micro text-muted">
        Base58 only — no <span className="text-accent">0 O I</span>. Alphabet:{' '}
        <span className="font-mono text-ink/70">1-9 A-H J-N P-Z a-k m-z</span>
      </p>
    </div>
  );
}
