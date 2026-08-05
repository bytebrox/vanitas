import { handler, jsonOk } from '@/server/market/http';
import { clearSession } from '@/server/market/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handler(async () => {
  await clearSession();
  return jsonOk({ ok: true });
});
