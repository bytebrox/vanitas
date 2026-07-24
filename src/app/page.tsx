import { redirect } from 'next/navigation';
import { LandingContent } from './LandingContent';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Landing at /. Legacy wallet query params redirect to /sol.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const prefix = first(sp.prefix);
  const suffix = first(sp.suffix);
  const mode = first(sp.mode);

  if (prefix || suffix || mode === 'wallet' || mode === 'mint') {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    params.set('mode', mode === 'mint' ? 'mint' : 'wallet');
    redirect(`/sol?${params.toString()}`);
  }

  return <LandingContent />;
}
