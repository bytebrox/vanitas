import { defineRouting } from 'next-intl/routing';

export const locales = [
  'en',
  'de',
  'es',
  'pt',
  'fr',
  'it',
  'tr',
  'id',
  'vi',
  'th',
  'zh',
  'ja',
  'ko',
] as const;
export type AppLocale = (typeof locales)[number];

export const localeNames: Record<AppLocale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  it: 'Italiano',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: true,
});
