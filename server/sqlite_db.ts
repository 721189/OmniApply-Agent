import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import { 
  runPgMigrations, 
  runSqliteMigrations, 
  getMigrationStatus, 
  MigrationRecord 
} from './migrations';

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
} from './services/auth';

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
    const maxConn = process.env.PG_MAX_CONNECTIONS 
      ? parseInt(process.env.PG_MAX_CONNECTIONS, 10) 
      : 10;

    pgPool = new Pool({
      connectionString: POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' || POSTGRES_URL.includes('sslmode=') ? { rejectUnauthorized: false } : false,
      max: maxConn,
      allowExitOnIdle: true,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 10000,
      query_timeout: 10000,
    });
    pgPool.on('error', (err) => {
      console.warn('[Database] PostgreSQL pool background warning:', err.message || err);
    });
    console.log(`[Database] Configured external PostgreSQL pool (max: ${maxConn}, allowExitOnIdle: true).`);
  } catch (err) {
    console.warn('[Database] Failed to configure PostgreSQL pool, falling back to embedded SQLite WASM:', err);
    pgPool = null;
  }
} else {
  console.log('[Database] Initializing embedded SQLite WASM storage engine (persistent at data/omniapply.db).');
}

export interface HealthProbeResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  engine: 'PostgreSQL' | 'SQLite WASM';
  durable: boolean;
  latencyMs: number;
  serverTime?: string;
  error?: string;
}

export async function probeDatabaseHealth(): Promise<HealthProbeResult> {
  const start = Date.now();
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT 1 as ok, NOW() as server_time;');
      const latencyMs = Date.now() - start;
      const serverTime = res.rows[0]?.server_time 
        ? new Date(res.rows[0].server_time).toISOString() 
        : new Date().toISOString();
      return {
        status: 'healthy',
        engine: 'PostgreSQL',
        durable: true,
        latencyMs,
        serverTime,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return {
        status: 'unhealthy',
        engine: 'PostgreSQL',
        durable: false,
        latencyMs,
        error: err?.message || String(err),
      };
    }
  }

  // SQLite WASM fallback
  try {
    await getDb();
    if (!dbInstance) {
      throw new Error('SQLite database instance uninitialized');
    }
    const stmt = dbInstance.prepare('SELECT 1 as ok;');
    stmt.step();
    stmt.free();
    const latencyMs = Date.now() - start;
    return {
      status: isProd ? 'degraded' : 'healthy',
      engine: 'SQLite WASM',
      durable: false,
      latencyMs,
      serverTime: new Date().toISOString(),
      ...(isProd ? { error: 'Ephemerality advisory: Running embedded SQLite WASM in production/serverless environment without PostgreSQL connection.' } : {})
    };
  } catch (err: any) {
    return {
      status: 'unhealthy',
      engine: 'SQLite WASM',
      durable: false,
      latencyMs: Date.now() - start,
      error: err?.message || String(err),
    };
  }
}

export function getDatabaseStatus() {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const isProd = process.env.NODE_ENV === 'production';
  return {
    engine: pgPool ? 'PostgreSQL' : 'SQLite WASM',
    durable: !!pgPool,
    poolActive: !!pgPool,
    mode: pgPool ? 'production-durable' : (isProd || isServerless ? 'unsupported-ephemeral' : 'local-development'),
    warning: (!pgPool && (isProd || isServerless))
      ? 'CRITICAL PERSISTENCE ADVISORY: Serverless/production environment detected without valid PostgreSQL connection.'
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
      await runPgMigrations(pgPool);
      console.log('[Database] PostgreSQL schema migrations completed successfully.');
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
  runSqliteMigrations(dbInstance);

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
        pgSql += ' ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, is_verified=EXCLUDED.is_verified, title=EXCLUDED.title, location=EXCLUDED.location, avatar_url=EXCLUDED.avatar_url, verification_code=EXCLUDED.verification_code, verification_code_expires_at=EXCLUDED.verification_code_expires_at, token_version=EXCLUDED.token_version, password_hash=EXCLUDED.password_hash, password_salt=EXCLUDED.password_salt, saved_urls=EXCLUDED.saved_urls';
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

  public async probeHealth(): Promise<HealthProbeResult> {
    return probeDatabaseHealth();
  }

  public async insertUserRecord(u: StoredUser) {
    await runSql(
      `INSERT OR REPLACE INTO users (id, name, email, is_verified, title, location, avatar_url, verification_code, verification_code_expires_at, token_version, password_hash, password_salt, saved_urls, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        u.id,
        u.name,
        u.email.toLowerCase(),
        u.isVerified ? 1 : 0,
        u.title || null,
        u.location || null,
        u.avatarUrl || null,
        u.verificationCode || null,
        u.verificationCodeExpiresAt || null,
        u.tokenVersion || 1,
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

    // 1. Cryptographic HMAC token signature & expiry verification
    const tokenVerification = verifySignedToken(token);
    if (!tokenVerification.valid || !tokenVerification.userId) {
      return undefined;
    }

    const user = await this.getUserById(tokenVerification.userId);
    if (!user) return undefined;

    // Check token version against user's current token version (session revocation / password change invalidation)
    const currentVersion = user.tokenVersion || 1;
    const tokenVersion = tokenVerification.tokenVersion || 1;
    if (tokenVersion !== currentVersion) {
      this.userTokensMap.delete(token);
      return undefined;
    }

    // Check if token exists in active database tokens (if explicitly deleted/logged out)
    try {
      const tokenRow = await getSql<{ user_id: string }>(
        'SELECT user_id FROM user_tokens WHERE token = ?;',
        [token]
      );
      if (!tokenRow) {
        this.userTokensMap.delete(token);
        return undefined;
      }
    } catch (e) {
      // Continue if table lookup transiently fails
    }

    this.userTokensMap.set(token, user.id);
    return user.id;
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

    const { token } = generateSignedToken(user.id, user.tokenVersion || 1);
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
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    if (existing) {
      existing.verificationCode = code;
      existing.verificationCodeExpiresAt = expiresAt;
      if (password) {
        const hashed = hashPassword(password);
        existing.passwordHash = hashed.hash;
        existing.passwordSalt = hashed.salt;
        existing.tokenVersion = (existing.tokenVersion || 1) + 1; // invalidate prior sessions on password reset
      }
      await this.insertUserRecord(existing);
      const { token } = generateSignedToken(existing.id, existing.tokenVersion || 1);
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
      verificationCodeExpiresAt: expiresAt,
      tokenVersion: 1,
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
    const { token } = generateSignedToken(id, 1);
    this.userTokensMap.set(token, id);
    await runSql('INSERT OR REPLACE INTO user_tokens (token, user_id, created_at) VALUES (?, ?, ?);', [
      token,
      id,
      new Date().toISOString(),
    ]);

    return { user: this.sanitizeUser(newUser), token, code };
  }

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (!user.verificationCode) {
      return { success: false, error: 'No pending verification code found for this account.' };
    }
    // Check 15-minute OTP expiration
    if (user.verificationCodeExpiresAt) {
      const expiresTime = new Date(user.verificationCodeExpiresAt).getTime();
      if (Date.now() > expiresTime) {
        return { 
          success: false, 
          error: 'Verification code has expired (15-minute validity window). Please request a new code.' 
        };
      }
    }
    // Timing-safe cryptographic comparison
    if (!verifySecureCode(code, user.verificationCode)) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await this.insertUserRecord(user);
    return { success: true };
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
    const now = new Date().toISOString();
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
        job.createdAt || now,
        job.updatedAt || now,
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
    user.tokenVersion = (user.tokenVersion || 1) + 1; // Immediately invalidates all existing stateless HMAC sessions
    await this.insertUserRecord(user);

    // Evict user sessions from DB and memory map
    for (const [t, uid] of this.userTokensMap.entries()) {
      if (uid === userId) this.userTokensMap.delete(t);
    }
    await runSql('DELETE FROM user_tokens WHERE user_id = ?;', [userId]);
    return true;
  }

  async revokeToken(token: string): Promise<boolean> {
    this.userTokensMap.delete(token);
    try {
      await runSql('DELETE FROM user_tokens WHERE token = ?;', [token]);
    } catch (e) {}
    return true;
  }

  async revokeAllUserSessions(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    await this.insertUserRecord(user);
    for (const [t, uid] of this.userTokensMap.entries()) {
      if (uid === userId) this.userTokensMap.delete(t);
    }
    await runSql('DELETE FROM user_tokens WHERE user_id = ?;', [userId]);
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
      verificationCodeExpiresAt: row.verification_code_expires_at || undefined,
      tokenVersion: row.token_version ? Number(row.token_version) : 1,
      passwordHash: row.password_hash || undefined,
      passwordSalt: row.password_salt || undefined,
      savedUrls,
      createdAt: row.created_at,
    };
  }

  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    await getDb();
    return getMigrationStatus(pgPool, dbInstance);
  }

  public sanitizeUser(user: StoredUser): UserAccount {
    const { passwordHash, passwordSalt, verificationCode, verificationCodeExpiresAt, savedUrls, ...rest } = user;
    return rest;
  }
}

export const db = new SQLiteDatabase();
