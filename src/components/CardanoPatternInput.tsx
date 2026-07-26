'use client';

import { useState, useEffect } from 'react';
import {
  validateCardanoPrefix,
  validateCardanoSuffix,
  stripCardanoHrp,
} from '@/lib/cardano-validation';
import { PatternTemplates, CARDANO_TEMPLATES } from './PatternTemplates';

interface Props {
  prefix: string;
  suffix: string;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  disabled?: boolean;
}

export function CardanoPatternInput({
  prefix,
  suffix,
  onPrefixChange,
  onSuffixChange,
  disabled = false,
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

  const sanitize = (value: string) =>
    stripCardanoHrp(value)
      .replace(/[^qpzry9x8gf2tvdw0s3jn54khce6mua7l]/gi, '')
      .slice(0, 8)
      .toLowerCase();

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <p className="text-micro leading-relaxed text-muted">
          Enterprise mainnet addresses start with <span className="font-mono">addr1</span>. Pattern
          matches the Bech32 body after that. Alphabet: qpzry9x8gf2tvdw0s3jn54khce6mua7l.
        </p>
      </div>
      <PatternTemplates
        templates={CARDANO_TEMPLATES}
        disabled={disabled}
        onSelect={(p) => {
          onPrefixChange(sanitize(p));
        }}
      />
      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Prefix</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl text-ink/35 select-none">addr1</span>
            <input
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
              onSuffixChange(sanitize(e.target.value));
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
    </div>
  );
}
