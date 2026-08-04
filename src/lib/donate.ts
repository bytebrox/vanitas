/** Contract address tip jar — set NEXT_PUBLIC_DONATE_CA in Vercel / .env.local */
export const DONATE_CA = (process.env.NEXT_PUBLIC_DONATE_CA ?? '').trim();
