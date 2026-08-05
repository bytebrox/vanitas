/** Issue the EIP-4361 message a wallet has to sign to open a session. */

import { activeChain } from '@/server/market/chain';
import {
  assertMarketEnabled,
  handler,
  jsonOk,
  readJson,
  requestOrigin,
} from '@/server/market/http';
import { createNonce, normalizeAddress } from '@/server/market/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handler(async (request: Request) => {
  assertMarketEnabled();

  const body = await readJson<{ address?: string }>(request);
  const address = normalizeAddress(body.address);
  const { domain, uri } = requestOrigin(request);

  const { nonce, message, expiresAt } = await createNonce({
    address,
    domain,
    uri,
    chainId: activeChain().id,
  });

  return jsonOk({ nonce, message, expiresAt: expiresAt.toISOString() });
});
