import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../server/sqlite_db';

describe('OTP 15-Minute Expiration Logic', () => {
  const testEmail = `candidate-${Date.now()}@example.org`;

  it('should initialize new user with a 15-minute verification code expiration', async () => {
    const res = await db.createUser('Test Candidate', testEmail, 'StrongPass123!');
    expect(res.user).toBeDefined();
    expect(res.code).toBeDefined();

    const stored = await db.getUserByEmail(testEmail);
    expect(stored).toBeDefined();
    expect(stored?.verificationCode).toBe(res.code);
    expect(stored?.verificationCodeExpiresAt).toBeDefined();

    const expiresTime = new Date(stored!.verificationCodeExpiresAt!).getTime();
    const now = Date.now();
    // Expiration should be roughly 15 minutes from now (900 seconds)
    const diffSeconds = (expiresTime - now) / 1000;
    expect(diffSeconds).toBeGreaterThan(800);
    expect(diffSeconds).toBeLessThanOrEqual(910);
  });

  it('should successfully verify email when code is submitted within 15-minute window', async () => {
    const freshEmail = `fresh-${Date.now()}@example.org`;
    const res = await db.createUser('Fresh User', freshEmail, 'StrongPass123!');
    
    const verification = await db.verifyEmail(freshEmail, res.code);
    expect(verification.success).toBe(true);
    expect(verification.error).toBeUndefined();

    const updated = await db.getUserByEmail(freshEmail);
    expect(updated?.isVerified).toBe(true);
    expect(updated?.verificationCode).toBeUndefined();
    expect(updated?.verificationCodeExpiresAt).toBeUndefined();
  });

  it('should reject verification when code has expired past 15-minute validity window', async () => {
    const expiredEmail = `expired-${Date.now()}@example.org`;
    const res = await db.createUser('Expired User', expiredEmail, 'StrongPass123!');
    
    // Simulate expired timestamp (e.g. 16 minutes in the past)
    const user = await db.getUserByEmail(expiredEmail);
    expect(user).toBeDefined();
    user!.verificationCodeExpiresAt = new Date(Date.now() - 60 * 1000).toISOString(); // 1 min ago
    await db.insertUserRecord(user!);

    const verification = await db.verifyEmail(expiredEmail, res.code);
    expect(verification.success).toBe(false);
    expect(verification.error).toContain('expired');

    const checkUser = await db.getUserByEmail(expiredEmail);
    expect(checkUser?.isVerified).toBe(false);
  });
});
