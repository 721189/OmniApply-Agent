import crypto from 'crypto';

function getSecretKey(): string {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET (or SECRET_KEY) environment variable must be defined in production environment.');
    }
    console.warn('[SECURITY WARNING] Neither JWT_SECRET nor SECRET_KEY is defined. Falling back to local development signing key.');
    return 'omni-apply-ai-dev-only-jwt-secret-key-2026';
  }
  return secret;
}

export interface PasswordRecord {
  hash: string;
  salt: string;
}

/**
 * PBKDF2 salted password hashing (100,000 iterations, SHA-512)
 */
export function hashPassword(password: string, salt?: string): PasswordRecord {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

/**
 * Timing-safe password verification (100,000 iterations, SHA-512)
 */
export function verifyPassword(password: string, savedHash?: string, salt?: string): boolean {
  if (!password || !savedHash || !salt) return false;
  try {
    const newHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const a = Buffer.from(newHash, 'hex');
    const b = Buffer.from(savedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}

/**
 * HMAC-SHA256 signed session tokens with expiration and token versioning
 */
export function generateSignedToken(userId: string, tokenVersion: number = 1): { token: string; expiresAt: number } {
  const secretKey = getSecretKey();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${userId}:${tokenVersion}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return { token, expiresAt };
}

/**
 * Verifies signed session token signature, expiration, and token version
 */
export function verifySignedToken(token: string): { valid: boolean; userId?: string; tokenVersion?: number } {
  try {
    const secretKey = getSecretKey();
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    
    // 4-part token: userId:tokenVersion:expiresAt:signature
    if (parts.length === 4) {
      const [userId, tokenVersionStr, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);
      const tokenVersion = parseInt(tokenVersionStr, 10);
      if (isNaN(expiresAt) || isNaN(tokenVersion) || Date.now() > expiresAt) {
        return { valid: false };
      }
      const payload = `${userId}:${tokenVersionStr}:${expiresAtStr}`;
      const expectedSig = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
      const sigA = Buffer.from(signature, 'hex');
      const sigB = Buffer.from(expectedSig, 'hex');
      if (sigA.length === sigB.length && crypto.timingSafeEqual(sigA, sigB)) {
        return { valid: true, userId, tokenVersion };
      }
    }
    // Backward-compatible 3-part token: userId:expiresAt:signature
    else if (parts.length === 3) {
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
        return { valid: true, userId, tokenVersion: 1 };
      }
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


