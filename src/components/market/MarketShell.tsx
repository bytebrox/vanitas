'use client';

import { useTranslations } from 'next-intl';
import { ContentWithSide, FadeIn, Footer, Navbar, PageIntro } from '@/components';
import { Link } from '@/i18n/navigation';
import { MARKET_ENABLED } from '@/lib/market-flag';
import { MarketProvider } from './MarketProvider';
import { TestnetBanner } from './MarketTrustNotice';
import { WalletConnectButton } from './WalletConnectButton';

const TABS = [
  { href: '/market', key: 'browse' },
  { href: '/market/forge', key: 'forge' },
  { href: '/market/me', key: 'mine' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** Shown when a deployment has not switched the marketplace on. */
function MarketUnavailable() {
  const t = useTranslations('market.unavailable');

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro eyebrow={t('eyebrow')} title={t('title')} description={t('body')} />
      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={t('caption')}>
          <p className="text-sm text-muted leading-relaxed">
            {t('forgesHint')}{' '}
            <Link href="/" className="text-ink border-b border-ink hover:text-accent hover:border-accent">
              {t('forgesLink')}
            </Link>
          </p>
        </ContentWithSide>
      </main>
      <Footer />
    </div>
  );
}

function Tabs({ active }: { active: TabKey }) {
  const t = useTranslations('market.nav');

  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-2">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`text-micro uppercase tracking-[0.16em] pb-0.5 transition-colors ${
            tab.key === active ? 'text-ink border-b border-ink' : 'text-muted hover:text-ink'
          }`}
        >
          {t(tab.key)}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Common frame for every /market page: provider, header, tab strip and footer.
 * Keeping it in one place means the wallet session is not torn down when
 * moving between browse, forge and account.
 *
 * `wide` drops the decorative side plate and the centre spine. A board of
 * addresses is a table in spirit, and the half width column the other pages
 * use turns it into a cramped list of two.
 */
export function MarketShell({
  active,
  title,
  description,
  wide = false,
  children,
}: {
  active: TabKey;
  title: string;
  description?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations('market.nav');

  if (!MARKET_ENABLED) return <MarketUnavailable />;

  if (wide) {
    return (
      <MarketProvider>
        <div className="min-h-screen flex flex-col">
          <div className="relative min-h-[4.5rem] bg-paper">
            <Navbar />
          </div>

          <main className="flex-1 w-full max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-20">
            <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pb-6 border-b border-ink/15">
              <div className="min-w-0">
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">
                  {t('eyebrow')}
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-[0.01em]">
                  {title}
                </h1>
                {description && (
                  <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              <WalletConnectButton />
            </header>

            <div className="py-5 border-b border-ink/15">
              <Tabs active={active} />
            </div>

            <FadeIn>
              <div className="pt-8 space-y-6">
                <TestnetBanner />
                {children}
              </div>
            </FadeIn>
          </main>

          <Footer />
        </div>
      </MarketProvider>
    );
  }

  return (
    <MarketProvider>
      <div className="min-h-screen flex flex-col">
        <PageIntro eyebrow={t('eyebrow')} title={title} description={description} />

        <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
          <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={t('caption')}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/15 pb-4 mb-8">
              <Tabs active={active} />
              <WalletConnectButton />
            </div>

            <FadeIn>
              <div className="space-y-6">
                <TestnetBanner />
                {children}
              </div>
            </FadeIn>
          </ContentWithSide>
        </main>

        <Footer />
      </div>
    </MarketProvider>
  );
}
