import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

function qident(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function buildInsert(tableName, columns, row) {
  const colList = columns.map((c) => qident(c.column_name)).join(', ');
  const values = columns.map((c) => row[c.column_name]);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  return {
    text: `INSERT INTO ${qident(tableName)} (${colList}) VALUES (${placeholders})`,
    values,
  };
}

async function getTables(client) {
  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return res.rows.map((r) => r.table_name);
}

async function getColumns(client, tableName) {
  const res = await client.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
    `,
    [tableName]
  );
  return res.rows;
}

async function getDependencyOrder(client, tables) {
  const fkRes = await client.query(`
    SELECT
      tc.table_name AS child,
      ccu.table_name AS parent
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.constraint_schema = tc.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `);

  const tableSet = new Set(tables);
  const parents = new Map();
  const children = new Map();
  const indegree = new Map();

  for (const t of tables) {
    parents.set(t, new Set());
    children.set(t, new Set());
    indegree.set(t, 0);
  }

  for (const row of fkRes.rows) {
    const child = row.child;
    const parent = row.parent;
    if (!tableSet.has(child) || !tableSet.has(parent) || child === parent) {
      continue;
    }
    if (!parents.get(child).has(parent)) {
      parents.get(child).add(parent);
      children.get(parent).add(child);
      indegree.set(child, indegree.get(child) + 1);
    }
  }

  const queue = [];
  for (const [t, deg] of indegree.entries()) {
    if (deg === 0) queue.push(t);
  }

  const ordered = [];
  while (queue.length > 0) {
    const current = queue.shift();
    ordered.push(current);
    for (const ch of children.get(current)) {
      const d = indegree.get(ch) - 1;
      indegree.set(ch, d);
      if (d === 0) queue.push(ch);
    }
  }

  if (ordered.length !== tables.length) {
    const remaining = tables.filter((t) => !ordered.includes(t));
    return [...ordered, ...remaining];
  }
  return ordered;
}

async function main() {
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

  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL for Neon target');
  }
  if (!process.env.DB_NAME || !process.env.DB_USER) {
    throw new Error('Missing local DB source settings (DB_NAME/DB_USER)');
  }

  await source.connect();
  await target.connect();

  try {
    const sourceTables = await getTables(source);
    const targetTables = new Set(await getTables(target));
    const common = sourceTables.filter((t) => targetTables.has(t));

    if (common.length === 0) {
      throw new Error('No common tables found between source and Neon target');
    }

    const orderedTables = await getDependencyOrder(source, common);
    const truncateOrder = [...orderedTables].reverse();

    console.log('Tables to migrate:', orderedTables.join(', '));

    await target.query('BEGIN');
    await target.query('SET CONSTRAINTS ALL DEFERRED');

    for (const table of truncateOrder) {
      await target.query(`TRUNCATE TABLE ${qident(table)} RESTART IDENTITY CASCADE`);
    }

    const summary = [];
    for (const table of orderedTables) {
      const columns = await getColumns(source, table);
      const srcRows = await source.query(`SELECT * FROM ${qident(table)}`);

      let inserted = 0;
      for (const row of srcRows.rows) {
        const ins = buildInsert(table, columns, row);
        await target.query(ins.text, ins.values);
        inserted += 1;
      }

      const tgtCount = await target.query(`SELECT COUNT(*)::int AS c FROM ${qident(table)}`);
      summary.push({ table, source: srcRows.rowCount, target: tgtCount.rows[0].c, inserted });
      console.log(`Migrated ${table}: source=${srcRows.rowCount}, target=${tgtCount.rows[0].c}`);
    }

    await target.query('COMMIT');

    console.log('\nMigration summary:');
    for (const row of summary) {
      console.log(`${row.table}: source=${row.source}, inserted=${row.inserted}, target=${row.target}`);
    }
  } catch (error) {
    await target.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
