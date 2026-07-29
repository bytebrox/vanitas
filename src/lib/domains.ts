/**
 * Domain suggestions — resolved entirely in the browser.
 *
 * Availability is not checked: .sol runs on SNS (Bonfida) and the AllDomains
 * TLDs use a separate registry, so the user confirms on the registrar page.
 * Keeping this client-side means the searched pattern never reaches a server.
 */

export interface DomainSuggestion {
  domain: string;
  tld: string;
  registrationUrl: string;
  provider: string;
}

const DOMAIN_OPTIONS = [
  { tld: '.sol', provider: 'SNS (Bonfida)' },
  { tld: '.solana', provider: 'AllDomains' },
  { tld: '.bonk', provider: 'AllDomains' },
  { tld: '.poor', provider: 'AllDomains' },
] as const;

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
  const fullDomain = `${name}${tld}`;
  return `https://alldomains.id/buy-domain?q=${encodeURIComponent(name)}&domain=${encodeURIComponent(fullDomain)}`;
}

export function domainSuggestions(pattern: string): DomainSuggestion[] {
  const name = normalizeDomainName(pattern);
  if (!name) return [];
  return DOMAIN_OPTIONS.map(({ tld, provider }) => ({
    domain: `${name}${tld}`,
    tld,
    provider,
    registrationUrl: registrationUrl(name, tld),
  }));
}
