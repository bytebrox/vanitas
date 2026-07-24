'use client';

interface FooterProps {
  /** Tighter padding for single-viewport landing */
  compact?: boolean;
}

export function Footer({ compact = false }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`px-4 sm:px-8 lg:px-12 border-t border-ink/15 ${
        compact
          ? 'py-3 sm:py-5'
          : 'mt-14 sm:mt-20 py-8 sm:py-10 pb-[max(2rem,env(safe-area-inset-bottom))]'
      }`}
    >
      <div
        className={`flex flex-col md:flex-row md:items-end md:justify-between ${
          compact ? 'gap-2.5 sm:gap-3' : 'gap-5 sm:gap-6'
        }`}
      >
        <div>
          <p className="font-display font-semibold normal-case tracking-tight text-ink text-base sm:text-lg mb-1 sm:mb-2">
            Vanitas
          </p>
          <p
            className={`text-micro text-muted max-w-sm leading-relaxed normal-case tracking-normal ${
              compact ? 'line-clamp-2' : ''
            }`}
          >
            Client-side Solana & ETH vanity tooling. No project token. No key leaves this device.
            {' '}Dev’d by{' '}
            <a
              href="https://x.com/bytebrox"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2 decoration-ink/30 hover:decoration-ink"
            >
              Bytebrox
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-micro uppercase tracking-[0.14em] sm:tracking-[0.16em] text-muted">
          <a href="/" className="hover:text-ink py-1">Home</a>
          <a href="/sol" className="hover:text-ink py-1">SOL</a>
          <a href="/evm" className="hover:text-ink py-1">EVM</a>
          <a href="/security" className="hover:text-ink py-1">Security</a>
          <a href="/audit" className="hover:text-ink py-1">Audit</a>
          <a href="/faq" className="hover:text-ink py-1">FAQ</a>
          <a href="/how-it-works" className="hover:text-ink py-1">How</a>
          <a
            href="https://github.com/bytebrox/vanitas"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink py-1"
          >
            GitHub
          </a>
          <span className="py-1">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
