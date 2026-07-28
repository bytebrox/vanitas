import type { Viewport } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import {
  THEME_BOOT_SCRIPT,
  THEME_CRITICAL_CSS,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/theme';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F0E8' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1A18' },
  ],
};

/** Root shell — html lang is set in [locale]/layout via suppressHydrationWarning sync. */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const raw = jar.get(THEME_STORAGE_KEY)?.value;
  const initialTheme: ThemeMode = raw === 'dark' ? 'dark' : 'light';
  const isDark = initialTheme === 'dark';

  return (
    <html
      lang="en"
      className={isDark ? 'dark' : undefined}
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: THEME_CRITICAL_CSS }} />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Script
          id="vanitas-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
