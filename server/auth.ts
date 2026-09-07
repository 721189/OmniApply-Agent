import crypto from 'crypto';

function getSecretKey(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: process.env.JWT_SECRET environment variable must be defined in production environment.');
    }
    console.warn('[SECURITY WARNING] process.env.JWT_SECRET is not defined. Falling back to local development signing key.');
    return 'omni-apply-ai-dev-only-jwt-secret-key-2026';
  }
  return secret;
}

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
  const secretKey = getSecretKey();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${userId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return { token, expiresAt };
}

/**
 * Verifies signed session token signature and expiration
 */
export function verifySignedToken(token: string): { valid: boolean; userId?: string } {
  try {
    const secretKey = getSecretKey();
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false };
    const [userId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false };
    }
    const payload = `${userId}:${expiresAtStr}`;
    const expectedSig = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
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

/**
 * Cryptographically secure 6-digit OTP generation (using crypto.randomInt)
 */
export function generateSecureVerificationCode(): string {
  // Generates unbiased, cryptographically strong integer in range [100000, 999999]
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Timing-safe comparison for OTP verification to prevent side-channel timing attacks
 */
export function verifySecureCode(inputCode: string, savedCode?: string): boolean {
  if (!inputCode || !savedCode) return false;
  try {
    const a = Buffer.from(inputCode.trim());
    const b = Buffer.from(savedCode.trim());
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}


