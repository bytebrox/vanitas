'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { domainSuggestions, normalizeDomainName } from '@/lib/domains';

interface DomainSuggestionsProps {
  pattern: string;
}

export function DomainSuggestions({ pattern }: DomainSuggestionsProps) {
  const t = useTranslations('domains');
  const [expanded, setExpanded] = useState(false);

  const name = useMemo(() => normalizeDomainName(pattern), [pattern]);
  const suggestions = useMemo(() => domainSuggestions(pattern), [pattern]);

  if (name.length < 2) {
    return null;
  }

  return (
    <div className="border-y border-ink/15 py-5">
      <button
        type="button"
        onClick={() => { setExpanded(!expanded); }}
        className="w-full flex items-center justify-between text-left gap-4"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1">
            {t('label')}
          </p>
          <p className="text-sm text-ink">{t('matching', { name })}</p>
        </div>
        <span
          className={`text-muted text-micro transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="mt-5 space-y-3">
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {suggestions.map((suggestion) => (
              <li key={suggestion.domain}>
                <a
                  href={suggestion.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 py-3 hover:text-accent transition-colors"
                >
                  <div>
                    <p className="font-mono text-ink">{suggestion.domain}</p>
                    <p className="text-micro text-muted">
                      {t('via', { provider: suggestion.provider })}
                    </p>
                  </div>
                  <span className="text-micro uppercase tracking-[0.14em] text-muted shrink-0">
                    {t('check')} →
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-micro text-muted">{t('note')}</p>
        </div>
      )}
    </div>
  );
}
