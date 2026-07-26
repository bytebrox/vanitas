'use client';

import { useState, useEffect } from 'react';
import {
  validateTonPrefix,
  validateTonSuffix,
  tonAddressTag,
  tonUserPrefix,
} from '@/lib/ton-validation';
import { PatternTemplates, TON_TEMPLATES } from './PatternTemplates';
import { TON_BASE64URL, type TonMode } from '@/types/ton';

interface Props {
  prefix: string;
  suffix: string;
  mode: TonMode;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  disabled?: boolean;
}

export function TonPatternInput({
  prefix,
  suffix,
  mode,
  onPrefixChange,
  onSuffixChange,
  disabled = false,
}: Props) {
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [suffixError, setSuffixError] = useState<string | null>(null);
  const tag = tonAddressTag(mode);

  useEffect(() => {
    const r = validateTonPrefix(prefix);
    setPrefixError(r.valid ? null : r.error || null);
  }, [prefix]);

  useEffect(() => {
    const r = validateTonSuffix(suffix);
    setSuffixError(r.valid ? null : r.error || null);
  }, [suffix]);

  const sanitizePrefix = (value: string) => {
    let v = [...value].filter((c) => TON_BASE64URL.includes(c)).join('');
    if (v.startsWith('UQ') || v.startsWith('EQ')) v = v.slice(2);
    return v.slice(0, 8);
  };

  const sanitizeSuffix = (value: string) =>
    [...value].filter((c) => TON_BASE64URL.includes(c)).join('').slice(0, 8);

  return (
    <div className="space-y-0 divide-y divide-ink/15 border-y border-ink/15">
      <div className="py-4">
        <p className="text-micro leading-relaxed text-muted">
          Wallet v4R2 addresses always start with <span className="font-mono">{tag}</span> in this
          mode. Type the vanity part after that (base64url, case-sensitive).
        </p>
      </div>
      <PatternTemplates
        templates={TON_TEMPLATES}
        disabled={disabled}
        onSelect={(p) => {
          onPrefixChange(sanitizePrefix(p));
        }}
      />
      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 sm:py-5 items-start cursor-text">
        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-3">Prefix</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl text-ink/35 select-none">{tag}</span>
            <input
              type="text"
              value={tonUserPrefix(prefix, mode)}
              onChange={(e) => {
                onPrefixChange(sanitizePrefix(e.target.value));
              }}
              placeholder="Ab"
              maxLength={8}
              spellCheck={false}
              autoCapitalize="off"
              disabled={disabled}
              className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl font-mono tracking-wide placeholder:text-ink/20 focus:outline-none focus:border-accent ${prefixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
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
            placeholder=""
            maxLength={8}
            spellCheck={false}
            autoCapitalize="off"
            disabled={disabled}
            className={`w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-xl font-mono tracking-wide placeholder:text-ink/20 focus:outline-none focus:border-accent ${suffixError ? 'border-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
          />
          {suffixError && <p className="text-micro text-accent mt-1">{suffixError}</p>}
        </div>
      </label>
    </div>
  );
}
