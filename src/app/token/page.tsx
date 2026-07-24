import { redirect } from 'next/navigation';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Legacy /token → /sol?mode=mint */
export default async function TokenRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams({ mode: 'mint' });
  const prefix = first(sp.prefix);
  const suffix = first(sp.suffix);
  if (prefix) params.set('prefix', prefix);
  if (suffix) params.set('suffix', suffix);
  redirect(`/sol?${params.toString()}`);
}
