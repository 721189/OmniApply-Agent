import { Pool } from 'pg';
import { Database as SqlJsDatabase } from 'sql.js';

export interface MigrationRecord {
  version: number;
  name: string;
  appliedAt: string;
}

export interface MigrationDefinition {
  version: number;
  name: string;
  pgUp: string;
  sqliteUp: string[];
}

export const MIGRATIONS: MigrationDefinition[] = [
  {
    version: 1,
    name: '001_initial_core_schema',
    pgUp: `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_verified INT NOT NULL DEFAULT 0,
        title VARCHAR(255),
        location VARCHAR(255),
        avatar_url TEXT,
        verification_code VARCHAR(255),
        verification_code_expires_at TIMESTAMPTZ,
        token_version INT NOT NULL DEFAULT 1,
        password_hash TEXT,
        password_salt TEXT,
        saved_urls TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_tokens (
        token VARCHAR(512) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS candidate_analyses (
        user_id VARCHAR(255) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        data_json TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_applications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        target_platform VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        data_json TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_tasks (
        task_id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        data_json TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        sender VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        topic VARCHAR(255),
        referenced_job_id VARCHAR(255),
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        ip_address VARCHAR(255),
        meta_json TEXT,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
    sqliteUp: [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        is_verified INTEGER NOT NULL DEFAULT 0,
        title TEXT,
        location TEXT,
        avatar_url TEXT,
        verification_code TEXT,
        verification_code_expires_at TEXT,
        token_version INTEGER NOT NULL DEFAULT 1,
        password_hash TEXT,
        password_salt TEXT,
        saved_urls TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS user_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS candidate_analyses (
        user_id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        job_title TEXT NOT NULL,
        company_name TEXT NOT NULL,
        target_platform TEXT NOT NULL,
        status TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS agent_tasks (
        task_id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        topic TEXT,
        referenced_job_id TEXT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        category TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT,
        meta_json TEXT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ],
  },
  {
    version: 2,
    name: '002_performance_indexes',
    pgUp: `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON job_applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id);
    `,
    sqliteUp: [
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON job_applications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id)`,
    ],
  },
  {
    version: 3,
    name: '003_timestamptz_and_security_columns',
    pgUp: `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;

      DO $$ BEGIN
        BEGIN
          ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE user_tokens ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE candidate_analyses ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE job_applications ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE job_applications ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE agent_tasks ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE agent_tasks ALTER COLUMN completed_at TYPE TIMESTAMPTZ USING completed_at::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE chat_messages ALTER COLUMN timestamp TYPE TIMESTAMPTZ USING timestamp::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TABLE activity_logs ALTER COLUMN timestamp TYPE TIMESTAMPTZ USING timestamp::timestamptz;
        EXCEPTION WHEN others THEN NULL; END;
      END $$;
    `,
    sqliteUp: [
      `CREATE TABLE IF NOT EXISTS _schema_v3_check (id INTEGER PRIMARY KEY)`,
    ],
  },
];

/**
 * Executes migrations for PostgreSQL with transactional integrity and version tracking.
 */
export async function runPgMigrations(pool: Pool): Promise<MigrationRecord[]> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const existingRes = await client.query('SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC;');
    const appliedVersions = new Set<number>(existingRes.rows.map((r: any) => Number(r.version)));

    const applied: MigrationRecord[] = [];

    for (const mig of MIGRATIONS) {
      if (!appliedVersions.has(mig.version)) {
        await client.query('BEGIN');
        try {
          await client.query(mig.pgUp);
          await client.query(
            'INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, NOW()) ON CONFLICT (version) DO NOTHING;',
            [mig.version, mig.name]
          );
          await client.query('COMMIT');
          applied.push({
            version: mig.version,
            name: mig.name,
            appliedAt: new Date().toISOString(),
          });
          console.log(`[Migrations] Applied PostgreSQL migration v${mig.version}: ${mig.name}`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw new Error(`Failed to apply migration v${mig.version} (${mig.name}): ${err}`);
        }
      }
    }

    return applied;
  } finally {
    client.release();
  }
}

/**
 * Executes migrations for SQLite WASM with version tracking.
 */
export function runSqliteMigrations(db: SqlJsDatabase): MigrationRecord[] {
  db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedVersions = new Set<number>();
  try {
    const stmt = db.prepare('SELECT version FROM schema_migrations');
    while (stmt.step()) {
      const row = stmt.getAsObject();
      appliedVersions.add(Number(row.version));
    }
    stmt.free();
  } catch {}

  const applied: MigrationRecord[] = [];

  for (const mig of MIGRATIONS) {
    if (!appliedVersions.has(mig.version)) {
      for (const statement of mig.sqliteUp) {
        db.run(statement);
      }
      db.run('INSERT OR IGNORE INTO schema_migrations (version, name, applied_at) VALUES (?, ?, datetime(\'now\'))', [
        mig.version,
        mig.name,
      ]);
      applied.push({
        version: mig.version,
        name: mig.name,
        appliedAt: new Date().toISOString(),
      });
      console.log(`[Migrations] Applied SQLite migration v${mig.version}: ${mig.name}`);
    }
  }

  return applied;
}

/**
 * Query current applied migration versions
 */
export async function getMigrationStatus(pool: Pool | null, sqliteDb: SqlJsDatabase | null): Promise<MigrationRecord[]> {
  if (pool) {
    try {
      const res = await pool.query('SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC;');
      return res.rows.map((r: any) => ({
        version: Number(r.version),
        name: r.name,
        appliedAt: new Date(r.applied_at).toISOString(),
      }));
    } catch {
      return [];
    }
  }

  if (sqliteDb) {
    try {
      const records: MigrationRecord[] = [];
      const stmt = sqliteDb.prepare('SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC');
      while (stmt.step()) {
        const row = stmt.getAsObject();
        records.push({
          version: Number(row.version),
          name: String(row.name),
          appliedAt: String(row.applied_at),
        });
      }
      stmt.free();
      return records;
    } catch {
      return [];
    }
  }

  return [];
}
