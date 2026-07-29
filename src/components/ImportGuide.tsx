'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { resolvePostFindProfile, type PostFindContext } from '@/lib/post-find';
import { RichText } from '@/lib/rich-text';

type Props = Pick<PostFindContext, 'chain' | 'mode'>;

export function ImportGuide({ chain, mode }: Props) {
  const profile = resolvePostFindProfile(chain, mode);
  const t = useTranslations(`postFind.import.${profile.importId}`);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-y border-ink/15 py-5">
      <button
        type="button"
        onClick={() => {
          setExpanded((v) => !v);
        }}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1">{t('eyebrow')}</p>
          <p className="text-sm text-ink">{t('summary')}</p>
        </div>
        <span className={`text-muted text-micro transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="mt-5 space-y-5 border-t border-ink/10 pt-5">
          <div>
            <p className="text-micro uppercase tracking-[0.14em] text-muted mb-2 font-mono">
              {t('formatLabel')}
            </p>
            <p className="text-sm text-muted leading-relaxed">
              <RichText
                text={t('formatBody')}
                codeClassName="font-mono text-ink text-[0.9em]"
                boldClassName="text-ink font-medium"
              />
            </p>
          </div>
          <div>
            <p className="text-micro uppercase tracking-[0.14em] text-muted mb-2 font-mono">
              {t('walletsLabel')}
            </p>
            <p className="text-sm text-ink leading-relaxed">{t('wallets')}</p>
          </div>
          <p className="text-micro text-muted leading-relaxed">
            <RichText text={t('hint')} codeClassName="font-mono text-ink text-[0.9em]" />
          </p>
        </div>
      )}
    </div>
  );
}
