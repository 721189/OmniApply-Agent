import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendVerificationEmail } from '../server/email';

describe('Email Dispatching Service Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should format and handle verification email dispatch gracefully without RESEND_API_KEY in dev', async () => {
    delete process.env.RESEND_API_KEY;
    const result = await sendVerificationEmail('candidate@example.org', '739104', 'Candidate Name');

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.provider).toBe('dev-console');
  });

  it('should call Resend API when RESEND_API_KEY is configured', async () => {
    process.env.RESEND_API_KEY = 're_test_dummy_key_123';
    
    // Mock global fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_msg_123456' }),
    });
    global.fetch = mockFetch as any;

    const result = await sendVerificationEmail('test@example.com', '123456', 'Shivam');
    expect(result.success).toBe(true);
    expect(result.provider).toBe('resend');
    expect(result.messageId).toBe('email_msg_123456');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(opts.headers.Authorization).toBe('Bearer re_test_dummy_key_123');
    const body = JSON.parse(opts.body);
    expect(body.to).toEqual(['test@example.com']);
    expect(body.subject).toContain('123456');
    expect(body.html).toContain('15 minutes');
  });

  it('should handle Resend API errors gracefully without throwing', async () => {
    process.env.RESEND_API_KEY = 're_test_invalid_key';
    
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'Forbidden: Unverified domain',
    });
    global.fetch = mockFetch as any;

    const result = await sendVerificationEmail('test@example.com', '123456');
    expect(result.success).toBe(false);
    expect(result.provider).toBe('resend');
    expect(result.error).toContain('403');
  });

  it('should return delivery failure when RESEND_API_KEY is missing in production environment', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.NODE_ENV = 'production';

    const result = await sendVerificationEmail('candidate@example.org', '739104', 'Candidate Name');

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.provider).toBe('none');
    expect(result.error).toContain('Missing RESEND_API_KEY in production environment');
  });
});

