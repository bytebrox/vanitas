/**
 * Scheduled settlement.
 *
 * Vercel calls this with the CRON_SECRET as a bearer token. The same secret
 * lets an operator trigger a pass by hand if a payout needs a nudge.
 */

import { requiredEnv } from '@/server/market/config';
import { constantTimeEquals } from '@/server/market/crypto';
import { ApiError, assertMarketEnabled, handler, jsonOk } from '@/server/market/http';
import { runSettlement } from '@/server/market/settlement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorize(request: Request): void {
  const provided = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const expected = requiredEnv('CRON_SECRET');
  if (
    !provided ||
    !constantTimeEquals(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'))
  ) {
    throw new ApiError('unauthorized', 401);
  }
}

export const GET = handler(async (request: Request) => {
  assertMarketEnabled();
  authorize(request);
  return jsonOk(await runSettlement());
});

export const POST = GET;
