import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

const dirName = typeof __dirname !== 'undefined' 
  ? __dirname 
  : (typeof process !== 'undefined' ? process.cwd() : '.');

import { 
  UserAccount, 
  CandidateAnalysis, 
  JobApplication, 
  AgentTask, 
  ProfileUrls, 
  ChatMessage, 
  ActivityLog 
} from '../src/types';
import { 
  hashPassword, 
  verifyPassword, 
  generateSignedToken, 
  verifySignedToken,
  generateSecureVerificationCode,
  verifySecureCode
} from './auth';

export interface StoredUser extends UserAccount {
  passwordHash?: string;
  passwordSalt?: string;
  savedUrls?: ProfileUrls;
}

// Support external PostgreSQL database (e.g. Vercel Postgres, Neon, Supabase, Cloud SQL) or local SQLite WASM
function isPostgresConnectionString(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://');
}

const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const POSTGRES_URL = isPostgresConnectionString(rawDbUrl) ? rawDbUrl!.trim() : null;
let pgPool: Pool | null = null;

if (POSTGRES_URL) {
  try {
    pgPool = new Pool({
      connectionString: POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' || POSTGRES_URL.includes('sslmode=') ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pgPool.on('error', (err) => {
      console.warn('[Database] PostgreSQL pool background warning:', err.message || err);
    });
    console.log('[Database] Configured external PostgreSQL database pool.');
  } catch (err) {
    console.warn('[Database] Failed to configure PostgreSQL pool:', err);
    pgPool = null;
  }
} else if (rawDbUrl && !isPostgresConnectionString(rawDbUrl)) {
  console.warn('[Database] Configured DATABASE_URL is not a valid PostgreSQL URI (must start with postgres:// or postgresql://). Falling back to embedded SQLite WASM storage.');
} else if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  console.warn('[Database ARCHITECTURE ALERT] Running in production/serverless mode without DATABASE_URL!');
  console.warn('[Database ARCHITECTURE ALERT] Local /tmp or SQLite storage is ephemeral and resets on cold starts.');
  console.warn('[Database ARCHITECTURE ALERT] Set DATABASE_URL (PostgreSQL) for durable production persistence.');
}

export function getDatabaseStatus() {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const isProd = process.env.NODE_ENV === 'production';
  return {
    engine: pgPool ? 'PostgreSQL' : 'SQLite WASM',
    durable: !!pgPool,
    poolActive: !!pgPool,
    mode: pgPool ? 'production-durable' : (isProd || isServerless ? 'ephemeral-serverless-fallback' : 'local-development'),
    warning: (!pgPool && (isProd || isServerless))
      ? 'CRITICAL PERSISTENCE ADVISORY: Serverless environment detected without DATABASE_URL. Ephemeral storage is active and will reset across function cold starts. Connect a managed PostgreSQL database (Neon, Supabase, Vercel Postgres) for durable production persistence.'
      : undefined,
  };
}


// Fallback SQLite WASM persistence path resolution
function getWritableDbPath(): string {
  try {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const testFile = path.join(dataDir, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return path.join(dataDir, 'omniapply.db');
  } catch {
    // If working directory is read-only (e.g. Vercel Lambda or read-only container), write to /tmp
    const tmpDir = path.join('/tmp', 'omniapply_data');
    if (!fs.existsSync(tmpDir)) {
      try { fs.mkdirSync(tmpDir, { recursive: true }); } catch {}
    }
    return path.join(tmpDir, 'omniapply.db');
  }
}

const DB_PATH = getWritableDbPath();
let dbInstance: SqlJsDatabase | null = null;
let dbInitPromise: Promise<any> | null = null;

function persistDb() {
  if (pgPool || !dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    // Non-blocking catch for read-only filesystem environments
    console.warn('[SQLiteDatabase] Disk persist warning:', err);
  }
}

function convertParamsForPg(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

async function initSchema() {
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            is_verified INT NOT NULL DEFAULT 0,
            title VARCHAR(255),
            location VARCHAR(255),
            avatar_url TEXT,
            verification_code VARCHAR(255),
            password_hash TEXT,
            password_salt TEXT,
            saved_urls TEXT,
            created_at VARCHAR(255) NOT NULL
          );
          CREATE TABLE IF NOT EXISTS user_tokens (
            token VARCHAR(512) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            created_at VARCHAR(255) NOT NULL
          );
          CREATE TABLE IF NOT EXISTS candidate_analyses (
            user_id VARCHAR(255) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            data_json TEXT NOT NULL,
            created_at VARCHAR(255) NOT NULL
          );
          CREATE TABLE IF NOT EXISTS job_applications (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            job_title VARCHAR(255) NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            target_platform VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            data_json TEXT NOT NULL,
            created_at VARCHAR(255) NOT NULL,
            updated_at VARCHAR(255) NOT NULL
          );
          CREATE TABLE IF NOT EXISTS agent_tasks (
            task_id VARCHAR(255) PRIMARY KEY,
            type VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            data_json TEXT NOT NULL,
            created_at VARCHAR(255) NOT NULL,
            completed_at VARCHAR(255)
          );
          CREATE TABLE IF NOT EXISTS chat_messages (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            sender VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            topic VARCHAR(255),
            referenced_job_id VARCHAR(255),
            timestamp VARCHAR(255) NOT NULL
          );
          CREATE TABLE IF NOT EXISTS activity_logs (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            action VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            details TEXT NOT NULL,
            ip_address VARCHAR(255),
            meta_json TEXT,
            timestamp VARCHAR(255) NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
          CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON job_applications(user_id);
          CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
          CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id);
        `);
      } finally {
        client.release();
      }
      console.log('[Database] PostgreSQL schema initialized successfully.');
      return;
    } catch (pgErr: any) {
      console.warn(`[Database] PostgreSQL initialization failed (${pgErr?.message || pgErr}). Falling back to embedded SQLite WASM storage.`);
      try {
        await pgPool.end();
      } catch {}
      pgPool = null;
    }
  }

  const locateFile = (file: string) => {
    const candidates = [
      path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
      path.join(dirName, '..', 'node_modules', 'sql.js', 'dist', file),
      path.join(dirName, 'node_modules', 'sql.js', 'dist', file),
      path.join('/tmp', file),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) return cand;
    }
    return candidates[0];
  };

  const SQL = await initSqlJs({ locateFile });
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch {
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  dbInstance.run('PRAGMA foreign_keys = ON;');
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      title TEXT,
      location TEXT,
      avatar_url TEXT,
      verification_code TEXT,
      password_hash TEXT,
      password_salt TEXT,
      saved_urls TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS candidate_analyses (
      user_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_title TEXT NOT NULL,
      company_name TEXT NOT NULL,
      target_platform TEXT NOT NULL,
      status TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS agent_tasks (
      task_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      topic TEXT,
      referenced_job_id TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      category TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT,
      meta_json TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Optional open-source demo seed for local preview environments (strictly no backdoor tokens)
  const stmt = dbInstance.prepare('SELECT * FROM users WHERE email = ?;', ['alex.chen@example.org']);
  const hasDemo = stmt.step();
  stmt.free();

  if (!hasDemo && process.env.NODE_ENV !== 'production') {
    const demoPass = hashPassword('demo-secure-pass-2026');
    const now = new Date().toISOString();
    const savedUrls = JSON.stringify({
      linkedin: 'https://linkedin.com/in/alexchen-dev',
      github: 'https://github.com/alexchen-dev',
      leetcode: 'https://leetcode.com/u/alexchen_dsa',
      substack: 'https://systems-scale.substack.com',
      twitter: 'https://x.com/alexchen_dev',
      portfolio: 'https://alexchen.dev',
      resumeText: 'Staff Full-Stack & Systems Engineer with experience in scalable distributed web applications, event queues, and AI architectures.',
    });
    dbInstance.run(
      `INSERT OR REPLACE INTO users (id, name, email, is_verified, title, location, avatar_url, verification_code, password_hash, password_salt, saved_urls, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'usr-demo-alex',
        'Alex Chen',
        'alex.chen@example.org',
        1,
        'Staff Full-Stack & Systems Engineer',
        'San Francisco, CA',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        null,
        demoPass.hash,
        demoPass.salt,
        savedUrls,
        now,
      ]
    );
  }
  persistDb();
  console.log(`[SQLiteDatabase] Relational SQL database initialized cleanly at ${DB_PATH}`);
}

async function getDb(): Promise<any> {
  if (dbInitPromise) return dbInitPromise;
  dbInitPromise = initSchema().catch((err) => {
    console.error('[Database] Schema initialization failed:', err);
    dbInitPromise = null;
    throw err;
  });
  return dbInitPromise;
}

async function runSql(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  await getDb();
  if (pgPool) {
    let pgSql = convertParamsForPg(sql);
    // Replace SQLite specific "INSERT OR REPLACE INTO" with Postgres upsert syntax if applicable
    if (pgSql.includes('INSERT OR REPLACE INTO')) {
      pgSql = pgSql.replace('INSERT OR REPLACE INTO', 'INSERT INTO');
      // Append ON CONFLICT DO UPDATE if matching primary key
      if (pgSql.includes('user_tokens')) {
        pgSql += ' ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, created_at = EXCLUDED.created_at';
      } else if (pgSql.includes('users')) {
        pgSql += ' ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, is_verified=EXCLUDED.is_verified, title=EXCLUDED.title, location=EXCLUDED.location, avatar_url=EXCLUDED.avatar_url, verification_code=EXCLUDED.verification_code, password_hash=EXCLUDED.password_hash, password_salt=EXCLUDED.password_salt, saved_urls=EXCLUDED.saved_urls';
      } else if (pgSql.includes('candidate_analyses')) {
        pgSql += ' ON CONFLICT (user_id) DO UPDATE SET full_name=EXCLUDED.full_name, data_json=EXCLUDED.data_json';
      } else if (pgSql.includes('job_applications')) {
        pgSql += ' ON CONFLICT (id) DO UPDATE SET job_title=EXCLUDED.job_title, company_name=EXCLUDED.company_name, target_platform=EXCLUDED.target_platform, status=EXCLUDED.status, data_json=EXCLUDED.data_json, updated_at=EXCLUDED.updated_at';
      } else if (pgSql.includes('agent_tasks')) {
        pgSql += ' ON CONFLICT (task_id) DO UPDATE SET status=EXCLUDED.status, data_json=EXCLUDED.data_json, completed_at=EXCLUDED.completed_at';
      }
    }
    const res = await pgPool.query(pgSql, params);
    return { lastID: 0, changes: res.rowCount || 0 };
  }

  dbInstance!.run(sql, params);
  persistDb();
  return { lastID: 0, changes: 1 };
}

async function getSql<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  await getDb();
  if (pgPool) {
    const pgSql = convertParamsForPg(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows[0] as T | undefined;
  }

  const stmt = dbInstance!.prepare(sql, params);
  if (stmt.step()) {
    const obj = stmt.getAsObject() as T;
    stmt.free();
    return obj;
  }
  stmt.free();
  return undefined;
}

async function allSql<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  await getDb();
  if (pgPool) {
    const pgSql = convertParamsForPg(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows as T[];
  }

  const stmt = dbInstance!.prepare(sql, params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

export class SQLiteDatabase {
  constructor() {
    getDb().catch((err) => console.error('[SQLiteDatabase] Init error:', err));
  }

  public getDatabaseStatus() {
    return getDatabaseStatus();
  }

  public async insertUserRecord(u: StoredUser) {
    await runSql(
      `INSERT OR REPLACE INTO users (id, name, email, is_verified, title, location, avatar_url, verification_code, password_hash, password_salt, saved_urls, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        u.id,
        u.name,
        u.email.toLowerCase(),
        u.isVerified ? 1 : 0,
        u.title || null,
        u.location || null,
        u.avatarUrl || null,
        u.verificationCode || null,
        u.passwordHash || null,
        u.passwordSalt || null,
        JSON.stringify(u.savedUrls || {}),
        u.createdAt || new Date().toISOString(),
      ]
    );
  }

  // --- Fast In-Memory Cache + Persistent Database Fallback + HMAC Stateless Token Verification ---
  private userTokensMap: Map<string, string> = new Map();

  async getUserById(id: string): Promise<StoredUser | undefined> {
    const row = await getSql<any>('SELECT * FROM users WHERE id = ?;', [id]);
    if (!row) return undefined;
    return this.mapUserRow(row);
  }

  async getUserByEmail(email: string): Promise<StoredUser | undefined> {
    const row = await getSql<any>('SELECT * FROM users WHERE email = ?;', [email.toLowerCase()]);
    if (!row) return undefined;
    return this.mapUserRow(row);
  }

  async getUserIdFromToken(token: string): Promise<string | undefined> {
    if (!token) return undefined;

    // 1. Cryptographic HMAC token signature verification (Stateless, fast, cold-start resilient across server restarts)
    const tokenVerification = verifySignedToken(token);
    if (tokenVerification.valid && tokenVerification.userId) {
      const user = await this.getUserById(tokenVerification.userId);
      if (user) {
        this.userTokensMap.set(token, user.id);
        return user.id;
      }
    }

    // 2. Query persistent user_tokens database table
    try {
      const tokenRow = await getSql<{ user_id: string }>(
        'SELECT user_id FROM user_tokens WHERE token = ?;',
        [token]
      );
      if (tokenRow?.user_id) {
        this.userTokensMap.set(token, tokenRow.user_id);
        return tokenRow.user_id;
      }
    } catch (e) {
      console.warn('[Database] Failed querying persistent token table:', e);
    }

    // 3. Fallback to in-memory map cache
    if (this.userTokensMap.has(token)) {
      return this.userTokensMap.get(token);
    }

    return undefined;
  }

  async verifyUserCredentials(email: string, password?: string): Promise<{ success: boolean; user?: UserAccount; token?: string; error?: string }> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found with this email' };
    }

    if (!password) {
      return { success: false, error: 'Password is required' };
    }

    // STRICT PBKDF2 Password Verification - NO BACKDOORS
    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return { success: false, error: 'Invalid password.' };
    }

    const { token } = generateSignedToken(user.id);
    this.userTokensMap.set(token, user.id);
    await runSql('INSERT OR REPLACE INTO user_tokens (token, user_id, created_at) VALUES (?, ?, ?);', [
      token,
      user.id,
      new Date().toISOString(),
    ]);

    return { success: true, user: this.sanitizeUser(user), token };
  }

  async createUser(name: string, email: string, password?: string): Promise<{ user: UserAccount; token: string; code: string }> {
    const existing = await this.getUserByEmail(email);
    const code = generateSecureVerificationCode();

    if (existing) {
      existing.verificationCode = code;
      if (password) {
        const hashed = hashPassword(password);
        existing.passwordHash = hashed.hash;
        existing.passwordSalt = hashed.salt;
      }
      await this.insertUserRecord(existing);
      const { token } = generateSignedToken(existing.id);
      this.userTokensMap.set(token, existing.id);
      await runSql('INSERT OR REPLACE INTO user_tokens (token, user_id, created_at) VALUES (?, ?, ?);', [
        token,
        existing.id,
        new Date().toISOString(),
      ]);
      return { user: this.sanitizeUser(existing), token, code };
    }

    const id = `usr-${Date.now()}`;
    const passwordRecord = password ? hashPassword(password) : undefined;
    const newUser: StoredUser = {
      id,
      name,
      email: email.toLowerCase(),
      isVerified: false,
      verificationCode: code,
      createdAt: new Date().toISOString(),
      passwordHash: passwordRecord?.hash,
      passwordSalt: passwordRecord?.salt,
      savedUrls: {
        linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
        github: `https://github.com/${name.toLowerCase().replace(/\s+/g, '')}`,
        leetcode: `https://leetcode.com/u/${name.toLowerCase().replace(/\s+/g, '_')}`,
        substack: `https://${name.toLowerCase().replace(/\s+/g, '')}.substack.com`,
        twitter: `https://x.com/${name.toLowerCase().replace(/\s+/g, '_')}`,
      },
    };

    await this.insertUserRecord(newUser);
    const { token } = generateSignedToken(id);
    this.userTokensMap.set(token, id);
    await runSql('INSERT OR REPLACE INTO user_tokens (token, user_id, created_at) VALUES (?, ?, ?);', [
      token,
      id,
      new Date().toISOString(),
    ]);

    return { user: this.sanitizeUser(newUser), token, code };
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;
    // Timing-safe cryptographic comparison
    if (user.verificationCode && verifySecureCode(code, user.verificationCode)) {
      user.isVerified = true;
      user.verificationCode = undefined;
      await this.insertUserRecord(user);
      return true;
    }
    return false;
  }

  async saveUserUrls(userId: string, urls: ProfileUrls): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      user.savedUrls = urls;
      await this.insertUserRecord(user);
    }
  }

  async saveAnalysis(analysis: CandidateAnalysis): Promise<void> {
    if (!analysis.userId) {
      throw new Error('CandidateAnalysis requires a valid userId');
    }
    await runSql(
      `INSERT OR REPLACE INTO candidate_analyses (user_id, full_name, data_json, created_at)
       VALUES (?, ?, ?, ?);`,
      [analysis.userId, analysis.fullName, JSON.stringify(analysis), new Date().toISOString()]
    );
  }

  async getAnalysis(userId: string): Promise<CandidateAnalysis | undefined> {
    const row = await getSql<any>('SELECT * FROM candidate_analyses WHERE user_id = ?;', [userId]);
    if (!row) return undefined;
    try {
      return JSON.parse(row.data_json);
    } catch {
      return undefined;
    }
  }

  async saveJob(job: JobApplication): Promise<void> {
    await runSql(
      `INSERT OR REPLACE INTO job_applications (id, user_id, job_title, company_name, target_platform, status, data_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        job.id,
        job.userId,
        job.jobTitle,
        job.companyName,
        job.targetPlatform,
        job.status,
        JSON.stringify(job),
        job.createdAt,
        job.updatedAt,
      ]
    );
  }

  async getJob(jobId: string): Promise<JobApplication | undefined> {
    const row = await getSql<any>('SELECT * FROM job_applications WHERE id = ?;', [jobId]);
    if (!row) return undefined;
    try {
      return JSON.parse(row.data_json);
    } catch {
      return undefined;
    }
  }

  async getAllJobs(userId: string): Promise<JobApplication[]> {
    const rows = await allSql<any>(
      'SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC;',
      [userId]
    );
    return rows.map((r) => JSON.parse(r.data_json));
  }

  async deleteJob(jobId: string): Promise<boolean> {
    const res = await runSql('DELETE FROM job_applications WHERE id = ?;', [jobId]);
    return res.changes > 0;
  }

  async saveTask(task: AgentTask): Promise<void> {
    await runSql(
      `INSERT OR REPLACE INTO agent_tasks (task_id, type, status, data_json, created_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        task.taskId,
        task.type,
        task.status,
        JSON.stringify(task),
        task.createdAt,
        task.completedAt || null,
      ]
    );
  }

  async getTask(taskId: string): Promise<AgentTask | undefined> {
    const row = await getSql<any>('SELECT * FROM agent_tasks WHERE task_id = ?;', [taskId]);
    if (!row) return undefined;
    try {
      return JSON.parse(row.data_json);
    } catch {
      return undefined;
    }
  }

  async getAllTasks(): Promise<AgentTask[]> {
    const rows = await allSql<any>('SELECT * FROM agent_tasks ORDER BY created_at DESC;');
    return rows.map((r) => JSON.parse(r.data_json));
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const rows = await allSql<any>(
      'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC;',
      [userId]
    );
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      sender: r.sender as any,
      text: r.text,
      topic: r.topic || undefined,
      referencedJobId: r.referenced_job_id || undefined,
      timestamp: r.timestamp,
    }));
  }

  async addChatMessage(
    userId: string,
    sender: 'user' | 'assistant',
    text: string,
    topic?: ChatMessage['topic'],
    referencedJobId?: string
  ): Promise<ChatMessage> {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      sender,
      text,
      timestamp: new Date().toISOString(),
      topic,
      referencedJobId,
    };
    await runSql(
      `INSERT INTO chat_messages (id, user_id, sender, text, topic, referenced_job_id, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [msg.id, userId, sender, text, topic || null, referencedJobId || null, msg.timestamp]
    );
    return msg;
  }

  async clearChatHistory(userId: string): Promise<void> {
    await runSql('DELETE FROM chat_messages WHERE user_id = ?;', [userId]);
  }

  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    const rows = await allSql<any>(
      'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 200;',
      [userId]
    );
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      action: r.action,
      category: r.category as any,
      details: r.details,
      timestamp: r.timestamp,
      ipAddress: r.ip_address || undefined,
      meta: r.meta_json ? JSON.parse(r.meta_json) : undefined,
    }));
  }

  async logActivity(
    userId: string,
    action: string,
    category: ActivityLog['category'],
    details: string,
    ipAddress?: string,
    meta?: Record<string, any>
  ): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      action,
      category,
      details,
      timestamp: new Date().toISOString(),
      ipAddress,
      meta,
    };
    await runSql(
      `INSERT INTO activity_logs (id, user_id, action, category, details, ip_address, meta_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        log.id,
        userId,
        action,
        category,
        details,
        ipAddress || null,
        meta ? JSON.stringify(meta) : null,
        log.timestamp,
      ]
    );
    return log;
  }

  async getUserUrls(userId: string): Promise<ProfileUrls | undefined> {
    const user = await this.getUserById(userId);
    return user?.savedUrls;
  }

  async updateUserProfile(userId: string, updates: Partial<UserAccount>): Promise<UserAccount | undefined> {
    const user = await this.getUserById(userId);
    if (!user) return undefined;
    if (updates.name) user.name = updates.name;
    if (updates.title) user.title = updates.title;
    if (updates.location) user.location = updates.location;
    if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
    await this.insertUserRecord(user);
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    const hashed = hashPassword(newPassword);
    user.passwordHash = hashed.hash;
    user.passwordSalt = hashed.salt;
    await this.insertUserRecord(user);
    return true;
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    await runSql('DELETE FROM users WHERE id = ?;', [userId]);
    await runSql('DELETE FROM user_tokens WHERE user_id = ?;', [userId]);
    await runSql('DELETE FROM candidate_analyses WHERE user_id = ?;', [userId]);
    await runSql('DELETE FROM job_applications WHERE user_id = ?;', [userId]);
    await runSql('DELETE FROM chat_messages WHERE user_id = ?;', [userId]);
    await runSql('DELETE FROM activity_logs WHERE user_id = ?;', [userId]);
    return true;
  }

  async updateJob(jobId: string, updates: Partial<JobApplication>): Promise<JobApplication | undefined> {
    const job = await this.getJob(jobId);
    if (!job) return undefined;
    const updated: JobApplication = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.saveJob(updated);
    return updated;
  }

  async updateJobStatus(jobId: string, status: string, notes?: string): Promise<JobApplication | undefined> {
    const job = await this.getJob(jobId);
    if (!job) return undefined;
    job.status = status as any;
    if (notes) job.notes = notes;
    job.updatedAt = new Date().toISOString();
    await this.saveJob(job);
    return job;
  }

  async exportUserData(userId: string): Promise<Record<string, any>> {
    const user = await this.getUserById(userId);
    const analysis = await this.getAnalysis(userId);
    const jobs = await this.getAllJobs(userId);
    const chatHistory = await this.getChatHistory(userId);
    const activityLogs = await this.getActivityLogs(userId);

    return {
      exportedAt: new Date().toISOString(),
      compliance: 'GDPR / CCPA Candidate Data Export',
      user: user ? this.sanitizeUser(user) : null,
      savedPlatformUrls: user?.savedUrls || null,
      aggregatedCandidateProfile: analysis || null,
      jobApplicationRecords: jobs,
      chatHistory,
      activityLogs,
    };
  }

  async importUserData(userId: string, payload: any): Promise<boolean> {
    try {
      if (payload.aggregatedCandidateProfile) {
        await this.saveAnalysis({ ...payload.aggregatedCandidateProfile, userId });
      }
      if (Array.isArray(payload.jobApplicationRecords)) {
        for (const j of payload.jobApplicationRecords) {
          await this.saveJob({ ...j, userId });
        }
      }
      if (payload.savedPlatformUrls) {
        await this.saveUserUrls(userId, payload.savedPlatformUrls);
      }
      return true;
    } catch (err) {
      console.warn('[SQLiteDatabase] Import error:', err);
      return false;
    }
  }

  private mapUserRow(row: any): StoredUser {
    let savedUrls: ProfileUrls | undefined;
    try {
      if (row.saved_urls) savedUrls = JSON.parse(row.saved_urls);
    } catch {
      // ignore
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      isVerified: Boolean(row.is_verified),
      title: row.title || undefined,
      location: row.location || undefined,
      avatarUrl: row.avatar_url || undefined,
      verificationCode: row.verification_code || undefined,
      passwordHash: row.password_hash || undefined,
      passwordSalt: row.password_salt || undefined,
      savedUrls,
      createdAt: row.created_at,
    };
  }

  public sanitizeUser(user: StoredUser): UserAccount {
    const { passwordHash, passwordSalt, verificationCode, savedUrls, ...rest } = user;
    return rest;
  }
}

export const db = new SQLiteDatabase();
