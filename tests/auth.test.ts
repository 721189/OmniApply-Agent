import { describe, it, expect } from 'vitest';
import { 
  hashPassword, 
  verifyPassword, 
  generateSignedToken, 
  verifySignedToken, 
  generateSecureVerificationCode, 
  verifySecureCode 
} from '../server/services/auth';

describe('Authentication & Cryptography Unit Tests', () => {
  it('should securely hash password with PBKDF2 and 100k iterations', () => {
    const password = 'CorrectHorseBatteryStaple123!';
    const { hash, salt } = hashPassword(password);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash.length).toBe(128); // 64-byte hex digest
    expect(salt.length).toBe(32);  // 16-byte hex salt

    // Correct password verifies successfully
    const isValid = verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);

    // Wrong password fails verification
    const isWrongValid = verifyPassword('WrongPassword', hash, salt);
    expect(isWrongValid).toBe(false);
  });

  it('should produce unique salts for identical passwords', () => {
    const pass = 'SuperSecretPass';
    const result1 = hashPassword(pass);
    const result2 = hashPassword(pass);

    expect(result1.salt).not.toBe(result2.salt);
    expect(result1.hash).not.toBe(result2.hash);
  });

  it('should generate and verify signed HMAC-SHA256 tokens with versioning', () => {
    const userId = 'usr-test-12345';
    const tokenVersion = 1;
    const { token, expiresAt } = generateSignedToken(userId, tokenVersion);

    expect(token).toBeDefined();
    expect(expiresAt).toBeGreaterThan(Date.now());

    // Valid verification
    const verification = verifySignedToken(token);
    expect(verification.valid).toBe(true);
    expect(verification.userId).toBe(userId);
    expect(verification.tokenVersion).toBe(tokenVersion);

    // Tampered token should fail verification
    const tampered = token.slice(0, -4) + 'abcd';
    const tamperedVerification = verifySignedToken(tampered);
    expect(tamperedVerification.valid).toBe(false);
  });

  it('should generate cryptographically random 6-digit numeric OTPs', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const code = generateSecureVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
      codes.add(code);
    }
    // High randomness ensures distinct codes across iterations
    expect(codes.size).toBeGreaterThan(45);
  });

  it('should perform timing-safe OTP verification', () => {
    const correctCode = '849201';
    expect(verifySecureCode(correctCode, '849201')).toBe(true);
    expect(verifySecureCode(correctCode, '000000')).toBe(false);
    expect(verifySecureCode(correctCode, '84920')).toBe(false);
    expect(verifySecureCode(correctCode, '')).toBe(false);
  });
});
