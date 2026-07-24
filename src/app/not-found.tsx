import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components';

export const metadata: Metadata = {
  title: '404 — Not found',
  description: 'This page does not exist on Vanitas.',
  robots: {
    index: false,
    follow: true,
  },
};

const links = [
  { href: '/sol', label: 'SOL forge' },
  { href: '/evm', label: 'EVM forge' },
  { href: '/btc', label: 'BTC forge' },
  { href: '/tron', label: 'TRON forge' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pt-28 sm:pt-32 pb-16">
        <div className="relative">
          <div
            className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-[2] hidden lg:flex -translate-x-1/2 flex-col items-center gap-3 pt-6"
            aria-hidden="true"
          >
            <span className="side-spine__rule" />
            <p className="side-spine__caption">Fig. — Absent</p>
          </div>

          <div className="grid lg:grid-cols-2 items-start gap-0">
            <div className="relative z-[1] min-w-0 lg:pr-10 xl:pr-14 flex lg:justify-end">
              <div className="w-full max-w-xl xl:max-w-2xl">
                <p className="text-micro uppercase tracking-[0.2em] text-accent mb-3">
                  Error 404
                </p>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink normal-case leading-tight mb-4">
                  This address was never forged
                </h1>
                <p className="text-base sm:text-lg text-muted leading-relaxed mb-10 max-w-md">
                  The page you asked for is not on Vanitas. It may have moved,
                  or it never existed.
                </p>

                <div className="border-y border-ink/15 divide-y divide-ink/15">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between gap-4 py-4 text-micro uppercase tracking-[0.16em] text-ink hover:text-accent transition-colors group"
                    >
                      <span>{link.label}</span>
                      <span className="text-muted group-hover:text-accent" aria-hidden>
                        →
                      </span>
                    </a>
                  ))}
                </div>

                <p className="mt-8 text-micro text-muted normal-case tracking-normal">
                  Or return to the{' '}
                  <a href="/" className="text-ink border-b border-ink/30 hover:border-accent hover:text-accent">
                    home forge
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="relative hidden lg:flex lg:pl-10 xl:pl-14 justify-start min-h-0 self-stretch mt-4 lg:mt-0">
              <aside className="side-plate" aria-hidden="true">
                <div className="side-plate__press">
                  <img
                    src="/ascii/side-temple-plate.webp?v=5"
                    alt=""
                    className="side-plate__img"
                    loading="eager"
                    decoding="async"
                  />
                  <span className="side-plate__grain" />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
