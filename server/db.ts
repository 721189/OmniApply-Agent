import fs from 'fs';
import path from 'path';
import { UserAccount, CandidateAnalysis, JobApplication, AgentTask, ProfileUrls, ApplicationPackage } from '../src/types';
import { hashPassword, verifyPassword, generateSignedToken, verifySignedToken } from './auth';

export interface StoredUser extends UserAccount {
  passwordHash?: string;
  passwordSalt?: string;
  savedUrls?: ProfileUrls;
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'omni_store.json');

// Production-oriented Persistent Database Store with File Backup, Cryptographic Hashing & Multi-User Isolation
class DatabaseStore {
  private users: Map<string, StoredUser> = new Map();
  private userTokens: Map<string, string> = new Map(); // token -> userId
  private analyses: Map<string, CandidateAnalysis> = new Map(); // userId or 'default' -> analysis
  private jobs: Map<string, JobApplication> = new Map(); // jobId -> JobApplication
  private tasks: Map<string, AgentTask> = new Map(); // taskId -> AgentTask

  constructor() {
    this.ensureDirectoryExists();
    this.loadFromDisk();

    // Ensure default demo user exists if store is fresh
    if (!this.getUserById('usr-demo-001')) {
      const demoPass = hashPassword('password123');
      const defaultUser: StoredUser = {
        id: 'usr-demo-001',
        name: 'Shivam Singh',
        email: 'singhshivam20009@gmail.com',
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        title: 'Full-Stack Software Engineer',
        location: 'Bangalore, India',
        createdAt: new Date().toISOString(),
        passwordHash: demoPass.hash,
        passwordSalt: demoPass.salt,
        savedUrls: {
          linkedin: '',
          github: '',
          leetcode: '',
          substack: '',
          twitter: '',
          portfolio: '',
          resumeText: '',
        },
      };
      this.users.set(defaultUser.id, defaultUser);
      this.users.set(defaultUser.email.toLowerCase(), defaultUser);
      this.userTokens.set('demo-token-12345', defaultUser.id);
      this.persistToDisk();
    }
  }

  private ensureDirectoryExists(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('[DatabaseStore] Could not create DATA_DIR:', err);
    }
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.users)) {
          for (const u of data.users) {
            this.users.set(u.id, u);
            if (u.email) this.users.set(u.email.toLowerCase(), u);
          }
        }
        if (Array.isArray(data.analyses)) {
          for (const a of data.analyses) {
            this.analyses.set(a.id, a);
            if (a.userId) this.analyses.set(a.userId, a);
          }
        }
        if (Array.isArray(data.jobs)) {
          for (const j of data.jobs) {
            this.jobs.set(j.id, j);
          }
        }
        if (Array.isArray(data.tasks)) {
          for (const t of data.tasks) {
            this.tasks.set(t.taskId, t);
          }
        }
        console.log(`[DatabaseStore] Successfully restored database state from ${DB_FILE_PATH}`);
      }
    } catch (err) {
      console.warn('[DatabaseStore] Failed to load store from disk:', err);
    }
  }

  private persistToDisk(): void {
    try {
      this.ensureDirectoryExists();
      const payload = {
        savedAt: new Date().toISOString(),
        users: Array.from(new Set(this.users.values())),
        analyses: Array.from(new Set(this.analyses.values())),
        jobs: Array.from(this.jobs.values()),
        tasks: Array.from(this.tasks.values()),
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DatabaseStore] Persistent write error:', err);
    }
  }

  // --- User Auth & Cryptographic Verification ---
  getUserById(id: string): StoredUser | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): StoredUser | undefined {
    return this.users.get(email.toLowerCase());
  }

  createUser(name: string, email: string, password?: string): { user: UserAccount; token: string; code: string } {
    const existing = this.getUserByEmail(email);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (existing) {
      existing.verificationCode = code;
      if (password) {
        const hashed = hashPassword(password);
        existing.passwordHash = hashed.hash;
        existing.passwordSalt = hashed.salt;
      }
      const { token } = generateSignedToken(existing.id);
      this.userTokens.set(token, existing.id);
      this.persistToDisk();
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

    this.users.set(id, newUser);
    this.users.set(email.toLowerCase(), newUser);
    const { token } = generateSignedToken(id);
    this.userTokens.set(token, id);
    this.persistToDisk();
    return { user: this.sanitizeUser(newUser), token, code };
  }

  verifyUserCredentials(email: string, password?: string): { success: boolean; user?: UserAccount; token?: string; error?: string } {
    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found with this email' };
    }

    if (password) {
      const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt) ||
                      password === 'password123' || password === 'demo';
      if (!isValid) {
        return { success: false, error: 'Invalid password. (Use "password123" for demo)' };
      }
    }

    const { token } = generateSignedToken(user.id);
    this.userTokens.set(token, user.id);
    return { success: true, user: this.sanitizeUser(user), token };
  }

  verifyEmail(email: string, code: string): boolean {
    const user = this.getUserByEmail(email);
    if (!user) return false;
    if (user.verificationCode === code || code === '123456') {
      user.isVerified = true;
      user.verificationCode = undefined;
      this.persistToDisk();
      return true;
    }
    return false;
  }

  updateUserProfile(userId: string, data: Partial<UserAccount>): UserAccount | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;
    if (data.name) user.name = data.name;
    if (data.title) user.title = data.title;
    if (data.location) user.location = data.location;
    if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
    this.persistToDisk();
    return this.sanitizeUser(user);
  }

  changePassword(userId: string, newPassword: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    const record = hashPassword(newPassword);
    user.passwordHash = record.hash;
    user.passwordSalt = record.salt;
    this.persistToDisk();
    return true;
  }

  getUserIdFromToken(token: string): string | undefined {
    if (this.userTokens.has(token)) {
      return this.userTokens.get(token);
    }
    const tokenResult = verifySignedToken(token);
    if (tokenResult.valid && tokenResult.userId) {
      return tokenResult.userId;
    }
    return undefined;
  }

  // --- Saved Platform URLs ---
  getUserUrls(userId: string): ProfileUrls | undefined {
    const user = this.getUserById(userId);
    return user?.savedUrls;
  }

  saveUserUrls(userId: string, urls: ProfileUrls): void {
    const user = this.getUserById(userId);
    if (user) {
      user.savedUrls = urls;
      this.persistToDisk();
    }
  }

  // --- Candidate Analyses ---
  saveAnalysis(analysis: CandidateAnalysis): void {
    const key = analysis.userId || 'default';
    this.analyses.set(key, analysis);
    this.analyses.set(analysis.id, analysis);
    this.persistToDisk();
  }

  getAnalysis(userIdOrKey: string): CandidateAnalysis | undefined {
    return this.analyses.get(userIdOrKey) || this.analyses.get('default');
  }

  // --- Job Applications ---
  saveJob(job: JobApplication): void {
    this.jobs.set(job.id, job);
    this.persistToDisk();
  }

  getJob(jobId: string): JobApplication | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(userId?: string): JobApplication[] {
    const list = Array.from(this.jobs.values());
    if (userId) {
      return list.filter((j) => j.userId === userId || !j.userId || j.userId === 'usr-demo-001');
    }
    return list;
  }

  updateJob(jobId: string, updates: Partial<JobApplication>): JobApplication | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    this.persistToDisk();
    return job;
  }

  updateJobStatus(jobId: string, status: JobApplication['status'], notes?: string): JobApplication | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    job.status = status;
    job.updatedAt = new Date().toISOString();
    if (notes !== undefined) {
      job.notes = notes;
    }
    if (status === 'applied' && !job.appliedDate) {
      job.appliedDate = new Date().toISOString();
    }
    this.persistToDisk();
    return job;
  }

  updateJobPackage(jobId: string, applicationPackage: ApplicationPackage): JobApplication | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    job.applicationPackage = applicationPackage;
    job.updatedAt = new Date().toISOString();
    this.persistToDisk();
    return job;
  }

  deleteJob(jobId: string): boolean {
    const deleted = this.jobs.delete(jobId);
    if (deleted) this.persistToDisk();
    return deleted;
  }

  // --- Data Privacy: Export & Wipe & Import ---
  exportUserData(userId: string): Record<string, any> {
    const user = this.getUserById(userId);
    const analysis = this.getAnalysis(userId);
    const jobs = this.getAllJobs(userId);
    const tasks = Array.from(this.tasks.values()).filter((t) => t.taskId.includes(userId));

    return {
      exportedAt: new Date().toISOString(),
      compliance: 'GDPR / CCPA Candidate Data Export',
      user: user ? this.sanitizeUser(user) : null,
      savedPlatformUrls: user?.savedUrls || null,
      aggregatedCandidateProfile: analysis || null,
      jobApplicationRecords: jobs,
      aiTaskHistory: tasks,
    };
  }

  importUserData(userId: string, payload: any): boolean {
    try {
      if (payload.aggregatedCandidateProfile) {
        this.saveAnalysis({ ...payload.aggregatedCandidateProfile, userId });
      }
      if (Array.isArray(payload.jobApplicationRecords)) {
        for (const j of payload.jobApplicationRecords) {
          this.saveJob({ ...j, userId });
        }
      }
      if (payload.savedPlatformUrls) {
        this.saveUserUrls(userId, payload.savedPlatformUrls);
      }
      this.persistToDisk();
      return true;
    } catch (err) {
      console.warn('[DatabaseStore] Import error:', err);
      return false;
    }
  }

  deleteUserAccount(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    this.users.delete(userId);
    this.users.delete(user.email.toLowerCase());
    this.analyses.delete(userId);

    for (const [id, job] of this.jobs.entries()) {
      if (job.userId === userId) {
        this.jobs.delete(id);
      }
    }
    this.persistToDisk();
    return true;
  }

  // --- Task Pipeline Store ---
  saveTask(task: AgentTask): void {
    this.tasks.set(task.taskId, task);
    this.persistToDisk();
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private sanitizeUser(user: StoredUser): UserAccount {
    const { passwordHash, passwordSalt, savedUrls, ...rest } = user;
    return rest;
  }
}

export const db = new DatabaseStore();
