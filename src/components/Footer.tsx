'use client';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 px-5 sm:px-8 lg:px-12 py-10 border-t border-ink/15">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="font-bold uppercase tracking-[0.16em] text-ink text-sm mb-2">Vanitas</p>
          <p className="text-micro text-muted max-w-sm leading-relaxed normal-case tracking-normal">
            Client-side Solana vanity tooling. No project token. No key leaves this device.
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
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-micro uppercase tracking-[0.16em] text-muted">
          <a href="/security" className="hover:text-ink">Security</a>
          <a href="/audit" className="hover:text-ink">Audit</a>
          <a href="/faq" className="hover:text-ink">FAQ</a>
          <a href="/how-it-works" className="hover:text-ink">How</a>
          <span>© {year}</span>
        </div>
      </div>
    </footer>
  );
}
