import { Pool } from 'pg';

/**
 * Postgres connection (Neon on Vercel). Vercel's Neon integration sets DATABASE_URL automatically.
 * One small pool per serverless instance.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

function connectionString(): string {
  const vars = process.env;
  const url = vars['DATABASE_URL'] || vars['POSTGRES_URL'];
  if (!url) throw new Error('DATABASE_URL is not set (connect a Neon database to the Vercel project).');
  return url;
}

export function pool(): Pool {
  if (!globalForDb.pool) {
    const url = connectionString();
    const local = /localhost|127\.0\.0\.1|host=\//.test(url);
    globalForDb.pool = new Pool({
      connectionString: url,
      ssl: local ? undefined : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
    });
  }
  return globalForDb.pool;
}

/** Calls one of the game functions (db/schema.sql) and returns its JSON result. */
export async function callFn<T>(fn: 'get_state' | 'start_game' | 'reset_game' | 'undo_last' | 'register_checkin', args: unknown[] = []): Promise<T> {
  const placeholders = args.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool().query(`select ${fn}(${placeholders}) as v`, args);
  return rows[0].v as T;
}
