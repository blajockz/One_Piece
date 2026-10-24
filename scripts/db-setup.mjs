// Creates / updates the database tables and game functions (db/schema.sql).
// Runs automatically before every build (Vercel or local). Never deletes data.
import { readFileSync, existsSync } from 'node:fs';
import pg from 'pg';

// Local: read .env.local / .env (Vercel already provides the variables)
for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.warn('⚠️  db-setup: DATABASE_URL is not set, database setup skipped.');
  process.exit(0);
}

const local = /localhost|127\.0\.0\.1|host=\//.test(url);
const client = new pg.Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(readFileSync('db/schema.sql', 'utf8'));
  const { rows } = await client.query('select count(*)::int as n from teams');
  console.log(`✅ db-setup: database ready (${rows[0].n} teams).`);
} catch (err) {
  console.error('❌ db-setup failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
