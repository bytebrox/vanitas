'use client';

interface PatternTemplate {
  label: string;
  prefix: string;
  hint?: string;
}

interface PatternTemplatesProps {
  templates: PatternTemplate[];
  disabled?: boolean;
  onSelect: (prefix: string) => void;
}

export function PatternTemplates({ templates, disabled = false, onSelect }: PatternTemplatesProps) {
  if (templates.length === 0) return null;

  return (
    <div className="py-4 border-b border-ink/15">
      <p className="text-micro uppercase tracking-[0.18em] text-muted mb-3">Try a pattern</p>
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.label}
            type="button"
            disabled={disabled}
            title={t.hint}
            onClick={() => { onSelect(t.prefix); }}
            className={`text-micro uppercase tracking-[0.12em] px-3 py-2 border border-ink/25
              hover:border-ink hover:text-ink text-muted transition-colors
              ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Safe short Base58-ish demos (no 0/O/I/l) */
export const SOL_TEMPLATES: PatternTemplate[] = [
  { label: 'Lucky 3', prefix: 'Ace', hint: '~3 characters · seconds' },
  { label: 'Moon', prefix: 'Moon', hint: 'Longer · minutes+' },
  { label: 'Dao', prefix: 'Dao' },
];

export const EVM_TEMPLATES: PatternTemplate[] = [
  { label: 'Lucky 3', prefix: 'abc', hint: 'Hex only' },
  { label: 'Cafe', prefix: 'cafe' },
  { label: 'Dead', prefix: 'dead' },
];

/** Shared hex demos for Aptos / Sui (and other 0x bodies) */
export const HEX_TEMPLATES: PatternTemplate[] = [
  { label: 'Lucky 3', prefix: 'abc', hint: 'Hex only · ~seconds' },
  { label: 'Cafe', prefix: 'cafe' },
  { label: 'Dead', prefix: 'dead' },
];

export const BTC_LEGACY_TEMPLATES: PatternTemplate[] = [
  { label: 'Lucky 2', prefix: 'Ab', hint: 'After leading 1' },
  { label: 'Fun', prefix: 'Fun' },
  { label: 'Sat', prefix: 'Sat' },
];

export const BTC_SEGWIT_TEMPLATES: PatternTemplate[] = [
  { label: 'Lucky 3', prefix: 'abc', hint: 'Bech32 body after bc1q' },
  { label: 'Cafe', prefix: 'cafe' },
  { label: 'Dead', prefix: 'dead' },
];

export const TRON_TEMPLATES: PatternTemplate[] = [
  { label: 'Lucky 2', prefix: 'Ace', hint: 'Case sensitive off recommended' },
  { label: 'Fun', prefix: 'Fun' },
  { label: 'Xyz', prefix: 'Xyz' },
];
