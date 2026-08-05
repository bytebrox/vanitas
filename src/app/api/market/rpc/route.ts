/**
 * Read-only JSON-RPC proxy.
 *
 * The site ships with `connect-src 'self'`, so the browser must not talk to an
 * upstream provider directly. Proxying keeps the policy intact and keeps the
 * provider API key on the server. Only read methods are forwarded.
 */

import { rpcUrl } from '@/server/market/chain';
import { ApiError, handler, jsonOk, readJson } from '@/server/market/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_METHODS = new Set([
  'eth_chainId',
  'eth_blockNumber',
  'eth_getBalance',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_getBlockByNumber',
  'eth_gasPrice',
  'eth_maxPriorityFeePerGas',
]);

interface RpcRequest {
  jsonrpc?: string;
  id?: number | string;
  method?: string;
  params?: unknown[];
}

export const POST = handler(async (request: Request) => {
  const body = await readJson<RpcRequest>(request);
  const method = body.method;

  if (typeof method !== 'string' || !ALLOWED_METHODS.has(method)) {
    throw new ApiError('method_not_allowed', 400, 'RPC method is not proxied');
  }
  if (body.params && !Array.isArray(body.params)) {
    throw new ApiError('invalid_params', 400);
  }
  if (body.params && body.params.length > 4) {
    throw new ApiError('invalid_params', 400);
  }

  const upstream = await fetch(rpcUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: body.id ?? 1,
      method,
      params: body.params ?? [],
    }),
  });

  if (!upstream.ok) {
    throw new ApiError('upstream_unavailable', 502);
  }

  return jsonOk(await upstream.json());
});
