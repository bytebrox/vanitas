/**
 * Catches the failure mode where a message declares an ICU placeholder but the
 * call site passes no values. next-intl does not throw in that case — it prints
 * the raw key onto the page, which looks like nothing more than an odd label
 * and survives every type check.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';

const SRC = path.join(process.cwd(), 'src');
const messages = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'messages', `${routing.defaultLocale}.json`), 'utf8')
) as Record<string, unknown>;

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function lookup(dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[key];
  }, messages);
}

/** ICU argument names, ignoring the `'{'` escape form. */
function placeholders(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(/(?<!')\{\s*(\w+)/g)].map((m) => m[1]);
}

/** Keys used without a values argument, as `namespace.key` paths. */
function bareCalls(source: string): string[] {
  // Map each local binding to its namespace, so a file holding both
  // `const t = useTranslations('tools.seed')` and `const tc = useTranslations('common')`
  // resolves each call against the right one.
  const namespaces = new Map<string, string>();
  for (const m of source.matchAll(/(?:const|let)\s+(\w+)\s*=\s*useTranslations\(\s*'([^']*)'/g)) {
    namespaces.set(m[1], m[2]);
  }
  if (namespaces.size === 0) return [];

  const binding = [...namespaces.keys()].join('|');
  // The trailing group captures whether a comma — and therefore values — follows.
  const calls = source.matchAll(new RegExp(`\\b(${binding})\\(\\s*'([^']+)'\\s*(,?)`, 'g'));

  return [...calls]
    .filter(([, , , comma]) => comma !== ',')
    .map(([, name, key]) => {
      const namespace = namespaces.get(name)!;
      return namespace ? `${namespace}.${key}` : key;
    });
}

describe('i18n placeholders', () => {
  it('detects a call site that drops its values', () => {
    const source = `
      const t = useTranslations('tools.seed');
      const tc = useTranslations('common');
      t('pathIntro');
      t('startIndexHint', { path });
      tc('copy');
    `;
    expect(bareCalls(source)).toEqual(['tools.seed.pathIntro', 'common.copy']);
  });

  it('reads messages that actually declare placeholders', () => {
    expect(placeholders(lookup('tools.seed.pathIntro'))).toEqual(['i']);
    expect(placeholders(lookup('tools.seed.sectionPatternTitle'))).toEqual([]);
  });

  it('passes values for every message that declares a placeholder', () => {
    const offenders = sourceFiles(SRC).flatMap((file) => {
      const rel = path.relative(process.cwd(), file);
      return bareCalls(fs.readFileSync(file, 'utf8'))
        .map((dotted) => ({ dotted, declared: placeholders(lookup(dotted)) }))
        .filter(({ declared }) => declared.length > 0)
        .map(({ dotted, declared }) => `${rel}: ${dotted} needs {${declared.join('}, {')}}`);
    });

    expect(offenders).toEqual([]);
  });
});
