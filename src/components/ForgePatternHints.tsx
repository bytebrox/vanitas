'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  analyzeLookalike,
  type LookalikeChain,
  type LookalikeFinding,
} from '@/lib/lookalike';

function formatFinding(
  f: LookalikeFinding,
  chain: LookalikeChain,
  t: ReturnType<typeof useTranslations<'tools.lookalike'>>
) {
  const noteKey = f.params?.noteKey;
  const note =
    typeof noteKey === 'string' && t.has(`pairNotes.${noteKey}`)
      ? t(`pairNotes.${noteKey}` as 'pairNotes.zeroO')
      : '';
  const values = { ...f.params, note };
  const title = t.has(`findings.${f.code}.title`)
    ? t(`findings.${f.code}.title` as 'findings.empty.title', values)
    : f.code;
  const detail = t.has(`findings.${f.code}.detail`)
    ? t(`findings.${f.code}.detail` as 'findings.empty.detail', values)
    : '';
  return { title, detail, severity: f.severity };
}

/**
 * Inline lookalike warnings above the forge controls.
 * Links out to Lab / full Lookalike tool for deeper analysis.
 */
export function ForgePatternHints({
  chain,
  prefix = '',
  suffix = '',
  pattern,
  labHref = '/lab',
  lookalikeHref = '/lookalike',
}: {
  chain: LookalikeChain;
  prefix?: string;
  suffix?: string;
  /** Single pattern field (used if prefix/suffix omitted) */
  pattern?: string;
  labHref?: string;
  lookalikeHref?: string;
}) {
  const t = useTranslations('tools.lookalike');
  const tf = useTranslations('forge.hints');

  const findings = useMemo(() => {
    const parts = pattern != null ? [pattern] : [prefix, suffix];
    const out: LookalikeFinding[] = [];
    for (const part of parts) {
      const raw = part.trim();
      if (!raw) continue;
      out.push(
        ...analyzeLookalike(raw, chain).filter((f) => f.severity === 'error' || f.severity === 'warn')
      );
    }
    // Dedupe by code+title-ish
    const seen = new Set<string>();
    return out.filter((f) => {
      const k = `${f.code}:${JSON.stringify(f.params ?? {})}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [pattern, prefix, suffix, chain]);

  if (findings.length === 0) return null;

  const rows = findings.slice(0, 4).map((f) => formatFinding(f, chain, t));
  const hasError = findings.some((f) => f.severity === 'error');

  return (
    <div
      className={`border px-3 py-3 sm:px-4 space-y-2 ${
        hasError ? 'border-accent/40 bg-accent/[0.04]' : 'border-ink/15 bg-ink/[0.02]'
      }`}
      role="status"
    >
      <p className="text-micro uppercase tracking-[0.14em] text-muted">{tf('title')}</p>
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.title} className="text-sm text-ink leading-snug">
            <span className={row.severity === 'error' ? 'text-accent' : ''}>{row.title}</span>
            {row.detail ? <span className="text-muted"> — {row.detail}</span> : null}
          </li>
        ))}
      </ul>
      <p className="text-micro text-muted flex flex-wrap gap-x-3 gap-y-1 pt-1">
        <Link href={lookalikeHref} className="hover:text-ink underline-offset-2 hover:underline">
          {tf('openLookalike')}
        </Link>
        <Link href={labHref} className="hover:text-ink underline-offset-2 hover:underline">
          {tf('openLab')}
        </Link>
      </p>
    </div>
  );
}
