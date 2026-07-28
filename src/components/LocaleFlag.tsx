import type { AppLocale } from '@/i18n/routing';

/** Real flag SVGs in `/public/flags` (lipis/flag-icons). Emoji flags fail on Windows. */
export function LocaleFlag({
  locale,
  className = 'w-5 h-3.5',
}: {
  locale: AppLocale;
  className?: string;
}) {
  return (
    <img
      src={`/flags/${locale}.svg`}
      alt=""
      width={20}
      height={15}
      decoding="async"
      draggable={false}
      aria-hidden
      className={`object-cover ${className}`}
    />
  );
}
