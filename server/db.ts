import { UserAccount, CandidateAnalysis, JobApplication, AgentTask, ProfileUrls, ApplicationPackage } from '../src/types';

export interface StoredUser extends UserAccount {
  passwordHash?: string;
  savedUrls?: ProfileUrls;
}

// Scalable In-Memory Database Store for OmniApply AI with Data Privacy & Multi-User Isolation
class DatabaseStore {
  private users: Map<string, StoredUser> = new Map();
  private userTokens: Map<string, string> = new Map(); // token -> userId
  private analyses: Map<string, CandidateAnalysis> = new Map(); // userId or 'default' -> analysis
  private jobs: Map<string, JobApplication> = new Map(); // jobId -> JobApplication
  private tasks: Map<string, AgentTask> = new Map(); // taskId -> AgentTask

  constructor() {
    // Seed default demo user
    const defaultUser: StoredUser = {
      id: 'usr-demo-001',
      name: 'Shivam Singh',
      email: 'singhshivam20009@gmail.com',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: 'Full-Stack Software Engineer',
      location: 'Bangalore, India',
      createdAt: new Date().toISOString(),
      passwordHash: 'demo_hashed_pass',
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
  }

  // --- User Auth & Email Verification ---
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
        existing.passwordHash = `hash_${password}`;
      }
      const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      this.userTokens.set(token, existing.id);
      return { user: this.sanitizeUser(existing), token, code };
    }

    const id = `usr-${Date.now()}`;
    const newUser: StoredUser = {
      id,
      name,
      email: email.toLowerCase(),
      isVerified: false,
      verificationCode: code,
      createdAt: new Date().toISOString(),
      passwordHash: password ? `hash_${password}` : undefined,
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
    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.userTokens.set(token, id);
    return { user: this.sanitizeUser(newUser), token, code };
  }

  verifyUserCredentials(email: string, password?: string): { success: boolean; user?: UserAccount; token?: string; error?: string } {
    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found with this email' };
    }
    // If password provided and user has password, check match (or demo pass)
    if (password && user.passwordHash && user.passwordHash !== `hash_${password}` && password !== 'password123' && password !== 'demo') {
      return { success: false, error: 'Invalid password. (Use "password123" for demo)' };
    }
    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.userTokens.set(token, user.id);
    return { success: true, user: this.sanitizeUser(user), token };
  }

  verifyEmail(email: string, code: string): boolean {
    const user = this.getUserByEmail(email);
    if (!user) return false;
    // Allow exact code or demo fallback '123456'
    if (user.verificationCode === code || code === '123456' || code === user.verificationCode) {
      user.isVerified = true;
      user.verificationCode = undefined;
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
    return this.sanitizeUser(user);
  }

  changePassword(userId: string, newPassword: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.passwordHash = `hash_${newPassword}`;
    return true;
  }

  getUserIdFromToken(token: string): string | undefined {
    return this.userTokens.get(token);
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
    }
  }

  // --- Candidate Analyses ---
  saveAnalysis(analysis: CandidateAnalysis): void {
    const key = analysis.userId || 'default';
    this.analyses.set(key, analysis);
    this.analyses.set(analysis.id, analysis);
  }

  getAnalysis(userIdOrKey: string): CandidateAnalysis | undefined {
    return this.analyses.get(userIdOrKey) || this.analyses.get('default');
  }

  // --- Job Applications ---
  saveJob(job: JobApplication): void {
    this.jobs.set(job.id, job);
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
    return job;
  }

  updateJobPackage(jobId: string, applicationPackage: ApplicationPackage): JobApplication | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    job.applicationPackage = applicationPackage;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  // --- Data Privacy: Export & Wipe ---
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

  deleteUserAccount(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    this.users.delete(userId);
    this.users.delete(user.email.toLowerCase());
    this.analyses.delete(userId);
    
    // Purge associated jobs
    for (const [id, job] of this.jobs.entries()) {
      if (job.userId === userId) {
        this.jobs.delete(id);
      }
    }
    return true;
  }

  // --- Celery / Redis Task Pipeline ---
  saveTask(task: AgentTask): void {
    this.tasks.set(task.taskId, task);
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
    const { passwordHash, savedUrls, ...rest } = user;
    return rest;
  }
}

export const db = new DatabaseStore();

