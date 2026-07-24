import { redirect } from 'next/navigation';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Legacy /eth → /evm (preserve query params) */
export default async function EthRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  const mode = first(sp.mode);
  const prefix = first(sp.prefix);
  const suffix = first(sp.suffix);
  if (mode) params.set('mode', mode);
  if (prefix) params.set('prefix', prefix);
  if (suffix) params.set('suffix', suffix);
  const qs = params.toString();
  redirect(qs ? `/evm?${qs}` : '/evm');
}
