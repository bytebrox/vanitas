'use client';

import { useTranslations } from 'next-intl';

interface PatternTemplate {
  labelKey: string;
  prefix: string;
  hintKey?: string;
}

interface PatternTemplatesProps {
  templates: PatternTemplate[];
  disabled?: boolean;
  onSelect: (prefix: string) => void;
}

export function PatternTemplates({ templates, disabled = false, onSelect }: PatternTemplatesProps) {
  const t = useTranslations('common');
  const tt = useTranslations('templates');
  if (templates.length === 0) return null;

  return (
    <div className="py-4 border-b border-ink/15">
      <p className="text-micro uppercase tracking-[0.18em] text-muted mb-3">{t('tryPattern')}</p>
      <div className="flex flex-wrap gap-2">
        {templates.map((item) => {
          let label = item.labelKey;
          let hint: string | undefined;
          try {
            label = tt(item.labelKey as 'lucky3');
          } catch {
            /* missing key → raw */
          }
          if (item.hintKey) {
            try {
              hint = tt(item.hintKey as 'hintSeconds');
            } catch {
              hint = undefined;
            }
          }
          return (
            <button
              key={`${item.labelKey}-${item.prefix}`}
              type="button"
              disabled={disabled}
              title={hint}
              onClick={() => {
                onSelect(item.prefix);
              }}
              className={`text-micro uppercase tracking-[0.12em] px-3 py-2 border border-ink/25
              hover:border-ink hover:text-ink text-muted transition-colors
              ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Safe short Base58-ish demos (no 0/O/I/l) */
export const SOL_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky3', prefix: 'Ace', hintKey: 'hintSeconds' },
  { labelKey: 'moon', prefix: 'Moon', hintKey: 'hintMinutes' },
  { labelKey: 'dao', prefix: 'Dao' },
];

export const EVM_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky3', prefix: 'abc', hintKey: 'hintHex' },
  { labelKey: 'cafe', prefix: 'cafe' },
  { labelKey: 'dead', prefix: 'dead' },
];

export const HEX_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky3', prefix: 'abc', hintKey: 'hintHexSeconds' },
  { labelKey: 'cafe', prefix: 'cafe' },
  { labelKey: 'dead', prefix: 'dead' },
];

export const BTC_LEGACY_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky2', prefix: 'Ab', hintKey: 'hintAfter1' },
  { labelKey: 'fun', prefix: 'Fun' },
  { labelKey: 'sat', prefix: 'Sat' },
];

export const BTC_SEGWIT_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky3', prefix: 'abc', hintKey: 'hintBech32' },
  { labelKey: 'cafe', prefix: 'cafe' },
  { labelKey: 'dead', prefix: 'dead' },
];

export const TRON_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky2', prefix: 'Ace', hintKey: 'hintCaseOff' },
  { labelKey: 'fun', prefix: 'Fun' },
  { labelKey: 'xyz', prefix: 'Xyz' },
];

export const CARDANO_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky1', prefix: 'y', hintKey: 'hintCardanoFirst' },
  { labelKey: 'cafe', prefix: 'ycafe' },
  { labelKey: 'dead', prefix: '9dead' },
];

export const XRP_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky3', prefix: 'Ace', hintKey: 'hintAfterR' },
  { labelKey: 'xrp', prefix: 'Xrp' },
  { labelKey: 'fun', prefix: 'Fun' },
];

export const TON_TEMPLATES: PatternTemplate[] = [
  { labelKey: 'lucky2', prefix: 'Ab', hintKey: 'hintTon' },
  { labelKey: 'fun', prefix: 'Fun' },
  { labelKey: 'dao', prefix: 'Dao' },
];
