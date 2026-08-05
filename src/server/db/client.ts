/**
 * Neon serverless Postgres over HTTP.
 *
 * The driver is stateless per query, which suits Vercel functions: there is no
 * connection pool to keep warm and no socket to leak between invocations.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { ConfigError } from '../errors';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

export function db(): Db {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new ConfigError('DATABASE_URL');
  cached = drizzle(neon(url), { schema });
  return cached;
}

export { schema };
