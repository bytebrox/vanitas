'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { routing, type AppLocale } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LocaleFlag } from './LocaleFlag';

const localeLabels: Record<AppLocale, string> = {
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

export function LanguageSwitcher({
  className = '',
}: {
  className?: string;
}) {
  const t = useTranslations('nav');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const onSelect = (next: AppLocale) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label = localeLabels[locale] ?? localeLabels.en;

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center min-h-11 min-w-11 text-ink/80 hover:text-ink"
        aria-label={t('language')}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={label}
      >
        <LocaleFlag locale={locale} className="w-[1.35rem] h-[1rem] rounded-[1px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('language')}
          className="absolute right-0 top-full mt-1 z-50 flex flex-col gap-0.5 border border-ink/15 bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-1 min-w-[2.75rem]"
        >
          {routing.locales.map((code) => {
            const active = code === locale;
            const itemLabel = localeLabels[code];
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                aria-label={itemLabel}
                title={itemLabel}
                disabled={pending}
                onClick={() => onSelect(code)}
                className={`inline-flex items-center justify-center min-h-10 min-w-10 ${
                  active ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]'
                }`}
              >
                <LocaleFlag
                  locale={code}
                  className="w-[1.35rem] h-[1rem] rounded-[1px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
