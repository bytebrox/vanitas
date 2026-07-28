'use client';

import { useEffect } from 'react';

/** Keeps <html lang> in sync with the active locale (root layout can't read [locale]). */
export function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
