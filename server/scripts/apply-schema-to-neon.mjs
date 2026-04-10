import fs from 'fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL');
  }

  const sql = await fs.readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');

  const target = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await target.connect();
  try {
    await target.query(sql);
    console.log('Schema applied successfully to Neon.');
  } finally {
    await target.end();
  }
}

main().catch((err) => {
  console.error('Schema apply failed:', err.message);
  process.exit(1);
});
