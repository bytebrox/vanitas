'use client';

/**
 * Sui hex pattern fields — ledger rows
 */

import { useState, useEffect } from 'react';
import { validateSuiPrefix, validateSuiSuffix } from '@/lib/sui-validation';
import { PatternTemplates, HEX_TEMPLATES } from './PatternTemplates';

interface SuiPatternInputProps {
  prefix: string;
  suffix: string;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  disabled?: boolean;
}

export function SuiPatternInput({
  prefix,
  suffix,
  onPrefixChange,
  onSuffixChange,
  disabled = false,
}: SuiPatternInputProps) {
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);
  const [strippedHint, setStrippedHint] = useState<string | null>(null);

  useEffect(() => {
    const result = validateSuiPrefix(prefix);
    setPrefixError(result.valid ? null : result.error || null);
  }, [prefix]);

  useEffect(() => {
    const result = validateSuiSuffix(suffix);
    setSuffixError(result.valid ? null : result.error || null);
  }, [suffix]);

  const sanitize = (value: string) => {
    const withoutOx = value.replace(/^0x/i, '');
    const cleaned = withoutOx.replace(/[^0-9a-fA-F]/g, '').slice(0, 8);
    const removed = withoutOx
      .replace(/[0-9a-fA-F]/g, '')
      .replace(/\s/g, '');
    if (removed.length > 0) {
      const unique = [...new Set(removed.split(''))].join(' ');
      setStrippedHint(unique);
    }
    return cleaned.toLowerCase();
  };

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <p className="text-micro leading-relaxed" style={{ color: '#B42318' }}>
          Sui addresses are hex only — digits <span className="font-mono">0–9</span> and letters{' '}
          <span className="font-mono">a–f</span>. Letters{' '}
          <span className="font-mono font-bold">g–z</span> (and any other characters) cannot appear
          in an address and are ignored when you type them.
        </p>
        {strippedHint && (
          <p className="text-micro mt-2 font-mono" style={{ color: '#B42318' }}>
            Ignored: {strippedHint}
          </p>
        )}
      </div>

      <PatternTemplates
        templates={HEX_TEMPLATES}
        disabled={disabled}
        onSelect={(p) => {
          onPrefixChange(sanitize(p));
        }}
      />

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Prefix</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl text-ink/35 select-none">0x</span>
            <input
              id="sui-prefix"
              type="text"
              value={prefix}
              onChange={(e) => {
                onPrefixChange(sanitize(e.target.value));
              }}
              placeholder="cafe"
              maxLength={8}
              spellCheck={false}
              autoCapitalize="off"
              disabled={disabled}
              className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 sm:py-2 text-xl sm:text-2xl font-mono tracking-wide lowercase
                placeholder:text-ink/20 focus:outline-none focus:border-accent
                ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
            />
          </div>
          <p className="text-micro text-muted mt-2">Starts after 0x</p>
          {prefixError && <p className="text-micro text-accent mt-1">{prefixError}</p>}
        </div>
      </label>

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Suffix</span>
        <div>
          <input
            id="sui-suffix"
            type="text"
            value={suffix}
            onChange={(e) => {
              onSuffixChange(sanitize(e.target.value));
            }}
            placeholder="dead"
            maxLength={8}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 sm:py-2 text-xl sm:text-2xl font-mono tracking-wide lowercase
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          <p className="text-micro text-muted mt-2">Ends the address</p>
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>

      <p className="py-4 text-micro text-muted">
        Matching is case-insensitive. Longer patterns take exponentially longer (16 possibilities per
        character).
      </p>
    </div>
  );
}
