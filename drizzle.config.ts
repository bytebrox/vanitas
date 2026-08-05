import type { Config } from 'drizzle-kit';

// Next loads .env.local on its own, drizzle-kit does not.
try {
  process.loadEnvFile('.env.local');
} catch {
  // Fine on Vercel, where the variables are already in the environment.
}

export default {
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Migrations run DDL over a real session, which does not survive
    // pgbouncer's transaction pooling, so prefer the direct endpoint. Both
    // names come from the Vercel Neon integration as they are.
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '',
  },
} satisfies Config;
