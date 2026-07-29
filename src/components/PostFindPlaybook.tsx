'use client';

import { useTranslations } from 'next-intl';
import { resolvePostFindProfile, shortAddress, type PostFindContext } from '@/lib/post-find';
import { RichText } from '@/lib/rich-text';

type Props = Pick<PostFindContext, 'chain' | 'mode' | 'address'>;

export function PostFindPlaybook({ chain, mode, address }: Props) {
  const profile = resolvePostFindProfile(chain, mode);
  const t = useTranslations(`postFind.playbook.${profile.playbookId}`);
  const steps = t.raw('steps') as string[];
  const short = shortAddress(address);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-micro uppercase tracking-[0.2em] text-accent mb-2">{t('eyebrow')}</p>
        <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink normal-case tracking-[0.02em]">
          {t('title')}
        </h3>
      </div>
      <ol className="space-y-5 list-none p-0 m-0">
        {steps.map((step, i) => (
          <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-3 sm:gap-4">
            <span className="font-mono text-micro text-accent tabular-nums pt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              <RichText
                text={step.replaceAll('{short}', short)}
                boldClassName="text-ink font-medium"
                codeClassName="font-mono text-ink text-[0.9em]"
                linkClassName="text-accent hover:text-ink"
              />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
