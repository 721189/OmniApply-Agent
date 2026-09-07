import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../server/app';
import http from 'http';

describe('Auth HttpOnly Session Cookie & JSON Payload Security', () => {
  let server: http.Server;
  let serverUrl: string;
  const testEmail = `cookie-test-${Date.now()}@example.org`;
  const testPass = 'SecurePassword!2026';

  beforeAll(async () => {
    const app = await createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr: any = server.address();
        serverUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('POST /api/auth/register should set HttpOnly cookie and NOT return token in JSON', async () => {
    const res = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cookie Test User',
        email: testEmail,
        password: testPass,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testEmail);
    // Security check: JSON response MUST NOT contain the session token
    expect((data as any).token).toBeUndefined();

    // Cookie check: Set-Cookie header MUST contain omniapply_session with HttpOnly
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('omniapply_session=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
  });

  it('POST /api/auth/login should set HttpOnly cookie and NOT return token in JSON', async () => {
    const res = await fetch(`${serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPass,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testEmail);
    // Security check: JSON response MUST NOT contain the session token
    expect((data as any).token).toBeUndefined();

    // Cookie check: Set-Cookie header MUST contain omniapply_session with HttpOnly
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('omniapply_session=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
  });
});

