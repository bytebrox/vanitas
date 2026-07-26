'use client';

/**
 * Chain marks from official brand / token assets in /public/chains
 */

interface LogoProps {
  className?: string;
  title?: string;
}

function ChainImg({
  src,
  title,
  className = 'w-5 h-5',
}: {
  src: string;
  title: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand assets from /public
    <img
      src={src}
      alt={title}
      title={title}
      className={`object-contain ${className}`}
      width={20}
      height={20}
      draggable={false}
    />
  );
}

/** Official Solana logomark (gradient bars) */
export function SolanaLogo({ className = 'w-5 h-5', title = 'Solana' }: LogoProps) {
  return <ChainImg src="/chains/solana.svg" title={title} className={className} />;
}

/** Ethereum token mark */
export function EthereumLogo({ className = 'w-5 h-5', title = 'Ethereum' }: LogoProps) {
  return <ChainImg src="/chains/ethereum.svg" title={title} className={className} />;
}

/** BNB Smart Chain token mark */
export function BnbLogo({ className = 'w-5 h-5', title = 'BNB Smart Chain' }: LogoProps) {
  return <ChainImg src="/chains/bnb.svg" title={title} className={className} />;
}

/** Base network icon */
export function BaseLogo({ className = 'w-5 h-5', title = 'Base' }: LogoProps) {
  return <ChainImg src="/chains/base.png" title={title} className={className} />;
}

/** Arbitrum icon */
export function ArbitrumLogo({ className = 'w-5 h-5', title = 'Arbitrum' }: LogoProps) {
  return <ChainImg src="/chains/arbitrum.svg" title={title} className={className} />;
}

/** Optimism token / avatar mark */
export function OptimismLogo({ className = 'w-5 h-5', title = 'Optimism' }: LogoProps) {
  return <ChainImg src="/chains/optimism.svg" title={title} className={className} />;
}

/** Bitcoin token mark */
export function BitcoinLogo({ className = 'w-5 h-5', title = 'Bitcoin' }: LogoProps) {
  return <ChainImg src="/chains/bitcoin.svg" title={title} className={className} />;
}

/** Tron token mark */
export function TronLogo({ className = 'w-5 h-5', title = 'Tron' }: LogoProps) {
  return <ChainImg src="/chains/tron.svg" title={title} className={className} />;
}

/** Official Aptos logomark */
export function AptosLogo({ className = 'w-5 h-5', title = 'Aptos' }: LogoProps) {
  return <ChainImg src="/chains/aptos.svg" title={title} className={className} />;
}

/** Official Sui logomark */
export function SuiLogo({ className = 'w-5 h-5', title = 'Sui' }: LogoProps) {
  return <ChainImg src="/chains/sui.svg" title={title} className={className} />;
}

/** Official TON logomark */
export function TonLogo({ className = 'w-5 h-5', title = 'TON' }: LogoProps) {
  return <ChainImg src="/chains/ton.svg" title={title} className={className} />;
}

/** Official Cardano logomark */
export function CardanoLogo({ className = 'w-5 h-5', title = 'Cardano' }: LogoProps) {
  return <ChainImg src="/chains/cardano.svg" title={title} className={className} />;
}

/** XRP Ledger mark */
export function XrpLogo({ className = 'w-5 h-5', title = 'XRP' }: LogoProps) {
  return <ChainImg src="/chains/xrp.svg" title={title} className={className} />;
}

const EVM_MARKS = [
  { src: '/chains/ethereum.svg', title: 'Ethereum' },
  { src: '/chains/bnb.svg', title: 'BNB Smart Chain' },
  { src: '/chains/base.png', title: 'Base' },
  { src: '/chains/arbitrum.svg', title: 'Arbitrum' },
  { src: '/chains/optimism.svg', title: 'Optimism' },
] as const;

/** Compact row of EVM chain marks for landing & hero */
export function EvmChainLogos({ className = '' }: { className?: string }) {
  const mark = 'w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5';
  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2 ${className}`} aria-hidden>
      {EVM_MARKS.map((m) => (
        <ChainImg key={m.src} src={m.src} title={m.title} className={mark} />
      ))}
    </span>
  );
}
