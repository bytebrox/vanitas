'use client';

import { useState, useEffect } from 'react';
import { validateTronPrefix, validateTronSuffix } from '@/lib/tron-validation';
import { TRON_BASE58 } from '@/types/tron';

interface TronPatternInputProps {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onCaseSensitiveChange: (value: boolean) => void;
  disabled?: boolean;
}

export function TronPatternInput({
  prefix,
  suffix,
  caseSensitive,
  onPrefixChange,
  onSuffixChange,
  onCaseSensitiveChange,
  disabled = false,
}: TronPatternInputProps) {
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);

  useEffect(() => {
    const r = validateTronPrefix(prefix);
    setPrefixError(r.valid ? null : r.error || null);
  }, [prefix]);

  useEffect(() => {
    const r = validateTronSuffix(suffix);
    setSuffixError(r.valid ? null : r.error || null);
  }, [suffix]);

  const sanitize = (value: string) =>
    [...value].filter((c) => TRON_BASE58.includes(c)).join('').slice(0, 12);

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <p className="text-micro leading-relaxed text-muted">
          Tron addresses start with <span className="font-mono">T</span> — type RON to search for TRON…
          (the leading T is added automatically). No 0, O, I, or l.
        </p>
      </div>

      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Prefix</span>
        <div>
          <input
            type="text"
            value={prefix}
            onChange={(e) => { onPrefixChange(sanitize(e.target.value)); }}
            placeholder="RON"
            maxLength={12}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl sm:text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
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
            placeholder="tron"
            maxLength={12}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl sm:text-2xl font-mono tracking-wide
              placeholder:text-ink/20 focus:outline-none focus:border-accent
              ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>

      <label className="flex items-center gap-3 py-4 cursor-pointer">
        <input
          type="checkbox"
          checked={caseSensitive}
          disabled={disabled}
          onChange={(e) => { onCaseSensitiveChange(e.target.checked); }}
          className="accent-ink"
        />
        <span className="text-micro uppercase tracking-[0.16em] text-muted">Case sensitive</span>
      </label>
    </div>
  );
}
