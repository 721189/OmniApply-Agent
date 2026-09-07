import { describe, it, expect } from 'vitest';
import { db } from '../server/sqlite_db';
import { generateSignedToken } from '../server/auth';

describe('Session Revocation & Versioning Integration Tests', () => {
  const sessionEmail = `session-${Date.now()}@example.org`;

  it('should authenticate user and validate active token', async () => {
    const { user, token } = await db.createUser('Session User', sessionEmail, 'InitialPass123!');
    expect(token).toBeDefined();

    const verifiedUserId = await db.getUserIdFromToken(token);
    expect(verifiedUserId).toBe(user.id);
  });

  it('should invalidate old session tokens immediately upon password change', async () => {
    const pwEmail = `pw-change-${Date.now()}@example.org`;
    const { user, token: oldToken } = await db.createUser('PW Change User', pwEmail, 'OldPassword123!');

    // Token is valid prior to password change
    const preChangeUserId = await db.getUserIdFromToken(oldToken);
    expect(preChangeUserId).toBe(user.id);

    // Change password
    const changed = await db.changePassword(user.id, 'NewPassword999!');
    expect(changed).toBe(true);

    // Old token must now fail validation due to token version increment and session table purge
    const postChangeUserId = await db.getUserIdFromToken(oldToken);
    expect(postChangeUserId).toBeUndefined();

    // New login works and produces a fresh valid token
    const loginResult = await db.verifyUserCredentials(pwEmail, 'NewPassword999!');
    expect(loginResult.success).toBe(true);
    expect(loginResult.token).toBeDefined();

    const newVerifiedUserId = await db.getUserIdFromToken(loginResult.token!);
    expect(newVerifiedUserId).toBe(user.id);
  });

  it('should revoke individual token on explicit logout / revocation', async () => {
    const logoutEmail = `logout-${Date.now()}@example.org`;
    const { user, token } = await db.createUser('Logout User', logoutEmail, 'Pass123456!');

    const beforeRevoke = await db.getUserIdFromToken(token);
    expect(beforeRevoke).toBe(user.id);

    // Explicitly revoke token
    await db.revokeToken(token);

    const afterRevoke = await db.getUserIdFromToken(token);
    expect(afterRevoke).toBeUndefined();
  });
});
