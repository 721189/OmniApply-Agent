import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../server/app';
import http from 'http';

describe('AI Copilot Chat Endpoint Integration Tests', () => {
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

  it('should allow unauthenticated guest users to chat with AI Copilot without 401 failure', async () => {
    const res = await fetch(`${serverUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'How can I optimize my resume for distributed systems engineering roles?',
        topic: 'resume',
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(data.userMessage).toBeDefined();
    expect(data.userMessage.text).toBe('How can I optimize my resume for distributed systems engineering roles?');
    expect(data.assistantMessage).toBeDefined();
    expect(data.assistantMessage.text).toBeTruthy();
    expect(data.isGuest).toBe(true);

    // Guest cookie should have been issued
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('omniapply_guest_id');
  }, 25000);

  it('should return 400 when query text is missing or whitespace', async () => {
    const res = await fetch(`${serverUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '   ',
        topic: 'general',
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Message text is required');
  });

  it('should retrieve conversation history for guest session', async () => {
    // 1. Send first message to obtain guest cookie
    const sendRes = await fetch(`${serverUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'What are 3 top interview tips for tech leads?',
        topic: 'interview',
      }),
    });

    const setCookieHeader = sendRes.headers.get('set-cookie') || '';
    const guestCookieMatch = setCookieHeader.match(/omniapply_guest_id=[^;]+/);
    const cookieHeader = guestCookieMatch ? guestCookieMatch[0] : '';

    // 2. Fetch history with that cookie
    const histRes = await fetch(`${serverUrl}/api/chat/history`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    expect(histRes.status).toBe(200);
    const histData = await histRes.json();
    expect(histData.history).toBeInstanceOf(Array);
    expect(histData.history.length).toBeGreaterThan(0);
    expect(histData.isGuest).toBe(true);
  }, 25000);

  it('should allow clearing chat history for guest session', async () => {
    const guestId = `guest_test_${Date.now()}`;
    const cookie = `omniapply_guest_id=${guestId}`;

    // Add message
    await fetch(`${serverUrl}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({ text: 'Hello Copilot', topic: 'general' }),
    });

    // Delete history
    const delRes = await fetch(`${serverUrl}/api/chat/history`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
    expect(delRes.status).toBe(200);

    // Verify empty
    const checkRes = await fetch(`${serverUrl}/api/chat/history`, {
      headers: { Cookie: cookie },
    });
    const checkData = await checkRes.json();
    expect(checkData.history.length).toBe(0);
  }, 25000);
});
