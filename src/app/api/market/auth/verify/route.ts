/** Verify a wallet signature and open a session cookie. */

import { verifyMessage } from 'viem';
import { ApiError, assertMarketEnabled, handler, jsonOk, readJson } from '@/server/market/http';
import {
  consumeNonce,
  issueSession,
  normalizeAddress,
  toSessionView,
  upsertUser,
} from '@/server/market/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface VerifyBody {
  nonce?: string;
  signature?: string;
}

export const POST = handler(async (request: Request) => {
  assertMarketEnabled();

  const body = await readJson<VerifyBody>(request);
  if (typeof body.signature !== 'string' || !/^0x[0-9a-fA-F]+$/.test(body.signature)) {
    throw new ApiError('invalid_signature', 400);
  }

  const { address, message } = await consumeNonce(body.nonce as string);

  const valid = await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: body.signature as `0x${string}`,
  });
  if (!valid) throw new ApiError('invalid_signature', 401, 'Signature does not match the address');

  const user = await upsertUser(normalizeAddress(address));
  await issueSession(user.id, user.address);

  return jsonOk(toSessionView(user));
});
