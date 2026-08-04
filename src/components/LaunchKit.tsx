'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  buildEmbedProofUrl,
  buildProofUrl,
  splitMatchedPattern,
} from '@/lib/proof-of-find';
import { resolvePostFindProfile, shortAddress, type PostFindContext } from '@/lib/post-find';
import { ShareCardButton } from './ShareCardButton';

type Props = PostFindContext;

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch {
      /* ignore */
    }
  };
  return { copied, copy };
}

function CopyRow({
  label,
  value,
  id,
  copied,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  id: string;
  copied: string | null;
  onCopy: (text: string, id: string) => void;
  mono?: boolean;
}) {
  const t = useTranslations('postFind.launch');
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-micro uppercase tracking-[0.14em] text-muted">{label}</p>
        <button
          type="button"
          onClick={() => {
            void onCopy(value, id);
          }}
          className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink shrink-0"
        >
          {copied === id ? t('copied') : t('copy')}
        </button>
      </div>
      <p
        className={`text-sm text-ink leading-relaxed whitespace-pre-wrap break-all ${
          mono ? 'font-mono text-[0.85em]' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function LaunchKit({
  chain,
  mode,
  address,
  matchedPattern,
  attempts,
  duration,
}: Props) {
  const profile = resolvePostFindProfile(chain, mode);
  const t = useTranslations('postFind.launch');
  const { copied, copy } = useCopy();
  const full = profile.launch === 'full';
  const [urls, setUrls] = useState({ proofUrl: '', iframe: '' });

  useEffect(() => {
    const { prefix, suffix } = splitMatchedPattern(matchedPattern);
    const payload = {
      chain,
      address,
      prefix: prefix || undefined,
      suffix: suffix || undefined,
      mode,
      attempts,
      duration,
    };
    const origin = window.location.origin;
    const proofUrl = buildProofUrl(origin, payload);
    const embedUrl = buildEmbedProofUrl(origin, payload);
    const iframe = `<iframe src="${embedUrl}" title="Vanitas proof" loading="lazy" style="width:100%;max-width:420px;height:220px;border:0;background:transparent"></iframe>`;
    setUrls({ proofUrl, iframe });
  }, [address, attempts, chain, duration, matchedPattern, mode]);

  const vars = {
    address,
    pattern: matchedPattern,
    short: shortAddress(address),
    proofUrl: urls.proofUrl || 'https://vanitas.fun/proof',
  };

  const blurbShort = t('blurbShort', vars);
  const blurbLaunchpad = t('blurbLaunchpad', vars);
  const blurbDiscord = t('blurbDiscord', vars);

  return (
    <section className="bg-beige/50 dark:bg-beige/30 px-4 sm:px-5 py-6 sm:py-7">
      <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">{t('eyebrow')}</p>
      <h3 className="font-display text-lg sm:text-xl font-semibold text-ink normal-case tracking-[0.02em] mb-2">
        {full ? t('fullTitle') : t('compactTitle')}
      </h3>
      <p className="text-sm text-muted leading-relaxed mb-5">{t('intro')}</p>

      <div className="space-y-5">
        {full ? (
          <>
            <CopyRow
              label={t('labelLaunchpad')}
              value={blurbLaunchpad}
              id="launchpad"
              copied={copied}
              onCopy={copy}
            />
            <CopyRow
              label={t('labelDiscord')}
              value={blurbDiscord}
              id="discord"
              copied={copied}
              onCopy={copy}
            />
            <CopyRow
              label={t('labelProof')}
              value={urls.proofUrl || vars.proofUrl}
              id="proof"
              copied={copied}
              onCopy={copy}
              mono
            />
            <CopyRow
              label={t('labelEmbed')}
              value={urls.iframe || t('embedPlaceholder')}
              id="embed"
              copied={copied}
              onCopy={copy}
              mono
            />
            <div className="pt-1">
              <ShareCardButton
                chain={chain}
                address={address}
                matchedPattern={matchedPattern}
                attempts={attempts ?? 0}
                duration={duration ?? 0}
                mode={mode}
                className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
              />
            </div>
            <p className="text-micro text-muted pt-1">
              <Link href="/brand" className="text-accent hover:text-ink">
                {t('brandLink')}
              </Link>
              {' · '}
              {t('noKeys')}
            </p>
          </>
        ) : (
          <>
            <CopyRow
              label={t('labelBlurb')}
              value={blurbShort}
              id="blurb"
              copied={copied}
              onCopy={copy}
            />
            <CopyRow
              label={t('labelProof')}
              value={urls.proofUrl || vars.proofUrl}
              id="proof"
              copied={copied}
              onCopy={copy}
              mono
            />
            <p className="text-micro text-muted pt-1">{t('noKeys')}</p>
          </>
        )}
      </div>
    </section>
  );
}
