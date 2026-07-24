import { NextResponse } from 'next/server';

// Domain suggestions with registration links
// Note: We don't check availability as .sol uses Bonfida SNS (different system)
// and API checks can be unreliable. Users check directly on the registration site.

interface DomainSuggestion {
  domain: string;
  tld: string;
  registrationUrl: string;
  provider: string;
}

// Popular TLDs with their providers
const DOMAIN_OPTIONS = [
  { tld: '.sol', provider: 'SNS (Bonfida)' },
  { tld: '.solana', provider: 'AllDomains' },
  { tld: '.bonk', provider: 'AllDomains' },
  { tld: '.poor', provider: 'AllDomains' },
];

/**
 * GET /api/domains?name=doge
 * Returns domain suggestions with registration links
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || name.length < 1 || name.length > 32) {
      return NextResponse.json(
        { error: 'Invalid domain name. Must be 1-32 characters.' },
        { status: 400 }
      );
    }

    // Sanitize name: lowercase, alphanumeric only
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (sanitizedName.length === 0) {
      return NextResponse.json(
        { error: 'Name must contain at least one alphanumeric character.' },
        { status: 400 }
      );
    }

    // Generate suggestions for each TLD
    const suggestions: DomainSuggestion[] = DOMAIN_OPTIONS.map(({ tld, provider }) => ({
      domain: `${sanitizedName}${tld}`,
      tld,
      provider,
      registrationUrl: getRegistrationUrl(sanitizedName, tld),
    }));

    return NextResponse.json({
      name: sanitizedName,
      suggestions,
    });
  } catch (error) {
    console.error('Domain suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate domain suggestions.' },
      { status: 500 }
    );
  }
}

/**
 * Get the registration URL for a domain
 */
function getRegistrationUrl(name: string, tld: string): string {
  // Full domain for AllDomains URL (e.g., "yol.abc")
  const fullDomain = `${name}${tld}`;
  
  switch (tld) {
    case '.sol':
      return `https://www.sns.id/search/single?search=${name}`;
    case '.solana':
    case '.bonk':
    case '.poor':
      return `https://alldomains.id/buy-domain?q=${name}&domain=${fullDomain}`;
    default:
      return `https://alldomains.id/buy-domain?q=${name}&domain=${fullDomain}`;
  }
}
