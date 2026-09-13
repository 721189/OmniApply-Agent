import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../server/app';
import http from 'http';

describe('Registration Endpoint JSON Safety & Error Handling Suite', () => {
  let server: http.Server;
  let serverUrl: string;

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

  it('should return 200 with valid JSON on successful registration', async () => {
    const uniqueEmail = `safe-test-${Date.now()}@example.com`;
    const res = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Json Safety User',
        email: uniqueEmail,
        password: 'ValidPassword123!',
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(uniqueEmail);
    expect(data.message).toContain('Account registered successfully');
  });

  it('should return 400 with valid JSON when email is invalid or missing', async () => {
    const res = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'ValidPassword123!',
      }),
    });

    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(data.error).toBe('Valid email is required');
  });

  it('should return 400 with valid JSON when password is under 6 characters', async () => {
    const res = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass User',
        email: `short-pass-${Date.now()}@example.com`,
        password: '123',
      }),
    });

    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(data.error).toBe('Password must be at least 6 characters long');
  });

  it('should return 409 with valid JSON on duplicate email registration', async () => {
    const duplicateEmail = `duplicate-${Date.now()}@example.com`;

    // First registration
    const firstRes = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Original User',
        email: duplicateEmail,
        password: 'Password123!',
      }),
    });
    expect(firstRes.status).toBe(200);

    // Second registration attempt with identical email
    const secondRes = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Imposter User',
        email: duplicateEmail,
        password: 'AnotherPassword123!',
      }),
    });

    expect(secondRes.status).toBe(409);
    expect(secondRes.headers.get('content-type')).toContain('application/json');

    const data = await secondRes.json();
    expect(data.error).toContain('already exists');
  });

  it('should return 400 with valid JSON when client sends malformed JSON string (SyntaxError)', async () => {
    const res = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email": "broken-json@example.com", "password": ', // malformed JSON
    });

    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toContain('application/json');

    // Must be parseable as valid JSON, not HTML error page!
    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(typeof data.error).toBe('string');
  });

  it('should return 404 with valid JSON for non-existent API endpoints', async () => {
    const res = await fetch(`${serverUrl}/api/auth/non-existent-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });

    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(data.error).toContain('Endpoint not found');
  });
});
