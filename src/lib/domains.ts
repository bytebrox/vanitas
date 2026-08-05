/**
 * Domain suggestions — resolved entirely in the browser.
 *
 * Availability is not checked: .sol runs on SNS (Bonfida), AllDomains TLDs use
 * a separate registry, and .eth is ENS — the user confirms on the registrar page.
 * Keeping this client-side means the searched pattern never reaches a server.
 */

export type DomainChain = 'sol' | 'evm';

export interface DomainSuggestion {
  domain: string;
  tld: string;
  registrationUrl: string;
  provider: string;
}

const SOL_DOMAIN_OPTIONS = [
  { tld: '.sol', provider: 'SNS (Bonfida)' },
  { tld: '.solana', provider: 'AllDomains' },
  { tld: '.bonk', provider: 'AllDomains' },
  { tld: '.poor', provider: 'AllDomains' },
] as const;

const EVM_DOMAIN_OPTIONS = [{ tld: '.eth', provider: 'ENS' }] as const;

export const DOMAIN_NAME_MAX = 32;

/** Lowercase, alphanumeric only, capped at 32 chars. Returns '' when unusable. */
export function normalizeDomainName(pattern: string): string {
  return pattern
    .replace('...', '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, DOMAIN_NAME_MAX);
}

function registrationUrl(name: string, tld: string): string {
  if (tld === '.sol') {
    return `https://www.sns.id/search/single?search=${encodeURIComponent(name)}`;
  }
  if (tld === '.eth') {
    return `https://app.ens.domains/${encodeURIComponent(`${name}.eth`)}`;
  }
  const fullDomain = `${name}${tld}`;
  return `https://alldomains.id/buy-domain?q=${encodeURIComponent(name)}&domain=${encodeURIComponent(fullDomain)}`;
}

export function domainSuggestions(
  pattern: string,
  chain: DomainChain = 'sol'
): DomainSuggestion[] {
  const name = normalizeDomainName(pattern);
  if (!name) return [];
  const options = chain === 'evm' ? EVM_DOMAIN_OPTIONS : SOL_DOMAIN_OPTIONS;
  return options.map(({ tld, provider }) => ({
    domain: `${name}${tld}`,
    tld,
    provider,
    registrationUrl: registrationUrl(name, tld),
  }));
}
