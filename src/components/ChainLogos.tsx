'use client';

/**
 * Official chain marks (SVG) for Solana & Ethereum
 */

import { useId } from 'react';

interface LogoProps {
  className?: string;
  title?: string;
}

/** Official Solana logomark — three angled bars with brand gradient */
export function SolanaLogo({ className = 'w-5 h-5', title = 'Solana' }: LogoProps) {
  const gid = `solana-grad-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 397.7 311.7"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gid} x1="360.8791" y1="351.4553" x2="141.213" y2="-69.2936" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid})`}
        d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"
      />
      <path
        fill={`url(#${gid})`}
        d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"
      />
      <path
        fill={`url(#${gid})`}
        d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"
      />
    </svg>
  );
}

/** Official Ethereum logomark — diamond (Ξ glyph geometry) */
export function EthereumLogo({ className = 'w-5 h-5', title = 'Ethereum' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 256 417"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
      <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
      <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
      <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z" />
      <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z" />
      <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z" />
    </svg>
  );
}
