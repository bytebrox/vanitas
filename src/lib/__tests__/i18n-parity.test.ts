/**
 * Guards the translation files against drift.
 *
 * Thirteen locales are currently key-for-key identical. That state is easy to
 * lose and hard to notice — a missing key only shows up as a raw key string on
 * a page nobody on the team reads — so it is asserted here instead.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

type Messages = Record<string, unknown>;

function load(locale: string): Messages {
  return JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), 'utf8')) as Messages;
}

/** Dotted key paths; arrays count as leaves so their length can be compared. */
function flatten(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value as Messages).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key)
  );
}

function leafAt(messages: Messages, dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as Messages)[key];
  }, messages);
}

const reference = load(routing.defaultLocale);
const referenceKeys = flatten(reference);
const others = routing.locales.filter((l) => l !== routing.defaultLocale);

describe('i18n parity', () => {
  it('ships a file for every configured locale', () => {
    const onDisk = fs
      .readdirSync(MESSAGES_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort();
    expect(onDisk).toEqual([...routing.locales].sort());
  });

  it.each(others)('%s has exactly the keys of the default locale', (locale) => {
    const keys = new Set(flatten(load(locale)));
    const missing = referenceKeys.filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !referenceKeys.includes(k));

    expect({ locale, missing, extra }).toEqual({ locale, missing: [], extra: [] });
  });

  it.each(others)('%s keeps array lengths in step with the default locale', (locale) => {
    const messages = load(locale);
    const mismatched = referenceKeys
      .filter((key) => Array.isArray(leafAt(reference, key)))
      .filter((key) => {
        const expectedLength = (leafAt(reference, key) as unknown[]).length;
        const actual = leafAt(messages, key);
        return !Array.isArray(actual) || actual.length !== expectedLength;
      });

    expect(mismatched).toEqual([]);
  });

  it.each(others)('%s leaves no value empty', (locale) => {
    const messages = load(locale);
    const blank = referenceKeys.filter((key) => {
      const value = leafAt(messages, key);
      return typeof value === 'string' && value.trim() === '';
    });

    expect(blank).toEqual([]);
  });

  it.each(others)('%s uses the same ICU placeholders as the default locale', (locale) => {
    const messages = load(locale);
    const placeholders = (value: unknown): string[] =>
      typeof value === 'string' ? [...value.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort() : [];

    const mismatched = referenceKeys.filter((key) => {
      const expected = placeholders(leafAt(reference, key));
      if (expected.length === 0) return false;
      return placeholders(leafAt(messages, key)).join(',') !== expected.join(',');
    });

    expect(mismatched).toEqual([]);
  });
});
