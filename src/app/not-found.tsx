import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import NotFoundPage from './[locale]/not-found';

/**
 * Root 404 — used when `notFound()` runs outside a valid locale layout
 * (e.g. invalid `[locale]` param). Reuses the Vanitas not-found UI with i18n.
 */
export default async function RootNotFound() {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundPage />
    </NextIntlClientProvider>
  );
}
