import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pg;

const source = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const target = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await source.connect();
  await target.connect();

  const q = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
    ORDER BY table_name
  `;

  const s = await source.query(q);
  const t = await target.query(q);

  console.log('SOURCE_TABLES:', s.rows.map((r) => r.table_name).join(', ') || '(none)');
  console.log('TARGET_TABLES:', t.rows.map((r) => r.table_name).join(', ') || '(none)');
} catch (e) {
  console.error('CHECK_FAIL:', e.message);
  process.exit(1);
} finally {
  await source.end().catch(() => {});
  await target.end().catch(() => {});
}
