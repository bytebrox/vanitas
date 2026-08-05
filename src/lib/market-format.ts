/** Formatting helpers shared by the marketplace UI. */

const WEI_PER_ETH = 10n ** 18n;

export function shortAddress(address: string, lead = 6, tail = 4): string {
  if (address.length <= lead + tail + 2) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

/** Wei to a trimmed decimal ETH string, without floating point rounding. */
export function formatEth(wei: string | bigint, maxDecimals = 6): string {
  const value = typeof wei === 'bigint' ? wei : BigInt(wei || '0');
  const negative = value < 0n;
  const abs = negative ? -value : value;

  const whole = abs / WEI_PER_ETH;
  const fraction = (abs % WEI_PER_ETH).toString().padStart(18, '0').slice(0, maxDecimals);
  const trimmed = fraction.replace(/0+$/, '');

  return `${negative ? '-' : ''}${whole}${trimmed ? `.${trimmed}` : ''}`;
}

/**
 * Parse a user-entered ETH amount into wei. Returns null for anything that is
 * not a plain positive decimal, so the caller can show a validation error
 * rather than silently sending the wrong number.
 */
export function parseEth(input: string): bigint | null {
  const trimmed = input.trim();
  if (!/^\d*(\.\d*)?$/.test(trimmed) || trimmed === '' || trimmed === '.') return null;

  const [whole, fraction = ''] = trimmed.split('.');
  if (fraction.length > 18) return null;

  const padded = fraction.padEnd(18, '0');
  return BigInt(whole || '0') * WEI_PER_ETH + BigInt(padded || '0');
}

/**
 * What the seller ends up with: the full price, less only the network fee for
 * the transfer that delivers it. The platform takes no cut.
 */
export function netOfGas(priceWei: bigint, reserveWei: string | null): bigint {
  const reserve = reserveWei ? BigInt(reserveWei) : 0n;
  return priceWei > reserve ? priceWei - reserve : 0n;
}

export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return '0:00';
  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
