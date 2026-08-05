/** Typed client for the /api/market endpoints. */

import type {
  ForgeSessionResponse,
  ForgeSubmitRequest,
  ListingPage,
  ListingSummary,
  MarketConfigResponse,
  MarketSession,
  OrderKeyResponse,
  OrderView,
} from '@/types/market';

export class MarketApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    detail?: string
  ) {
    super(detail || code);
    this.name = 'MarketApiError';
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/market${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const body = (payload ?? {}) as { error?: string; detail?: string };
    throw new MarketApiError(body.error || 'request_failed', response.status, body.detail);
  }

  return payload as T;
}

function body(data: unknown): RequestInit {
  return { method: 'POST', body: JSON.stringify(data) };
}

export const marketApi = {
  config: () => call<MarketConfigResponse>('/config'),

  session: () => call<MarketSession | null>('/auth/session'),

  requestNonce: (address: string) =>
    call<{ nonce: string; message: string; expiresAt: string }>('/auth/nonce', body({ address })),

  verifySignature: (nonce: string, signature: string) =>
    call<MarketSession>('/auth/verify', body({ nonce, signature })),

  logout: () => call<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  setPayoutAddress: (payoutAddress: string) =>
    call<MarketSession>('/auth/session', {
      method: 'PATCH',
      body: JSON.stringify({ payoutAddress }),
    }),

  openForgeSession: (pattern: string) =>
    call<ForgeSessionResponse>('/forge/session', body({ pattern })),

  submitForge: (payload: ForgeSubmitRequest) =>
    call<ListingSummary>('/forge/submit', body(payload)),

  listings: (params: {
    status?: string;
    sort?: string;
    q?: string;
    mine?: boolean;
    offset?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);
    if (params.q) query.set('q', params.q);
    if (params.mine) query.set('mine', '1');
    if (params.offset) query.set('offset', String(params.offset));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString();
    return call<ListingPage>(`/listings${suffix ? `?${suffix}` : ''}`);
  },

  listing: (id: string) => call<ListingSummary>(`/listings/${id}`),

  updateListing: (id: string, patch: { priceWei?: string; status?: string }) =>
    call<ListingSummary>(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  createOrder: (listingId: string) => call<OrderView>('/orders', body({ listingId })),

  myOrders: () => call<OrderView[]>('/orders'),

  order: (id: string) => call<OrderView>(`/orders/${id}`),

  checkOrder: (id: string) => call<OrderView>(`/orders/${id}/check`, { method: 'POST' }),

  orderKey: (id: string) => call<OrderKeyResponse>(`/orders/${id}/key`, { method: 'POST' }),
};
