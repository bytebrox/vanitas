'use client';

import { useState, useEffect } from 'react';

interface DomainSuggestion {
  domain: string;
  tld: string;
  registrationUrl: string;
  provider: string;
}

interface DomainSuggestionsProps {
  pattern: string;
}

export function DomainSuggestions({ pattern }: DomainSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<DomainSuggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const cleanName = pattern
    .replace('...', '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 32);

  useEffect(() => {
    if (!cleanName || cleanName.length < 2) {
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/domains?name=${encodeURIComponent(cleanName)}`);
        if (!response.ok) {
          throw new Error('Failed to get suggestions');
        }
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (err) {
        console.error('Domain suggestion error:', err);
        setError('Could not load domain suggestions');
      } finally {
        setLoading(false);
      }
    };

    void fetchSuggestions();
  }, [cleanName]);

  if (!cleanName || cleanName.length < 2) {
    return null;
  }

  return (
    <div className="border-y border-ink/15 py-5">
      <button
        type="button"
        onClick={() => { setExpanded(!expanded); }}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1">Domains</p>
          <p className="text-sm text-ink">
            {loading
              ? 'Loading…'
              : error
                ? error
                : suggestions
                  ? `Matching names for “${cleanName}”`
                  : 'View domain options'}
          </p>
        </div>
        <span className={`text-muted text-micro transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-sm text-muted">Loading suggestions…</p>
          ) : error ? (
            <p className="text-sm text-accent">{error}</p>
          ) : suggestions ? (
            <>
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
                        <p className="text-micro text-muted">via {suggestion.provider}</p>
                      </div>
                      <span className="text-micro uppercase tracking-[0.14em] text-muted shrink-0">
                        Check →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-micro text-muted">
                Domains make the address easier to share.
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
