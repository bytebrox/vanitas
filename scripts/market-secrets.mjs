/**
 * Generate a fresh set of marketplace secrets for a deployment.
 *
 * Writes `.env.vercel.local` (gitignored, and not a name Next.js auto-loads)
 * so the values can be pasted into the hosting panel without ever passing
 * through a terminal transcript or a chat window.
 *
 *   node scripts/market-secrets.mjs
 *
 * Rotating MARKET_MASTER_KEY makes every already stored key unrecoverable, so
 * only run this against a deployment whose listings table is empty.
 */

import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const OUT = path.join(process.cwd(), '.env.vercel.local');
const hex = (bytes) => randomBytes(bytes).toString('hex');

if (fs.existsSync(OUT)) {
  console.error(`${OUT} already exists. Delete it first if you mean to rotate.`);
  process.exit(1);
}

const body = `# Generated ${new Date().toISOString()} by scripts/market-secrets.mjs
# Paste these into the Vercel project as Production environment variables.
# Keep no other copy. Rotating MARKET_MASTER_KEY orphans every stored key.

# 32 bytes. Encrypts server key halves and finished private keys at rest.
MARKET_MASTER_KEY=${hex(32)}

# 32 bytes. Signs the session cookie.
MARKET_SESSION_SECRET=${hex(32)}

# 64 bytes. BIP32 master seed for the per-order deposit addresses, which also
# sign the onward transfer to the seller. Losing this strands buyer funds.
MARKET_HD_SEED=${hex(64)}

# Bearer token the settlement cron has to present.
CRON_SECRET=${hex(32)}
`;

fs.writeFileSync(OUT, body, { mode: 0o600 });
console.log(`Wrote ${OUT}`);
console.log('Copy the four values into Vercel, then delete the file.');
