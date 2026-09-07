import crypto from 'crypto';

const SERVER_SECRET = process.env.JWT_SECRET || 'omni-apply-ai-production-jwt-secret-2026';

export interface PasswordRecord {
  hash: string;
  salt: string;
}

/**
 * PBKDF2 salted password hashing (10,000 iterations, SHA-512)
 */
export function hashPassword(password: string, salt?: string): PasswordRecord {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

/**
 * Timing-safe password verification
 */
export function verifyPassword(password: string, savedHash?: string, salt?: string): boolean {
  if (!password || !savedHash || !salt) return false;
  try {
    const newHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const a = Buffer.from(newHash, 'hex');
    const b = Buffer.from(savedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}

/**
 * HMAC-SHA256 signed session tokens with expiration
 */
export function generateSignedToken(userId: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${userId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return { token, expiresAt };
}

/**
 * Verifies signed session token signature and expiration
 */
export function verifySignedToken(token: string): { valid: boolean; userId?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false };
    const [userId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false };
    }
    const payload = `${userId}:${expiresAtStr}`;
    const expectedSig = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');
    const sigA = Buffer.from(signature, 'hex');
    const sigB = Buffer.from(expectedSig, 'hex');
    if (sigA.length === sigB.length && crypto.timingSafeEqual(sigA, sigB)) {
      return { valid: true, userId };
    }
  } catch (e) {
    return { valid: false };
  }
  return { valid: false };
}
