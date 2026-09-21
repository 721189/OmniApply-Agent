import { describe, it, expect } from 'vitest';
import { 
  getRazorpayConfig, 
  createRazorpayOrder, 
  verifyRazorpayPaymentSignature, 
  getDoodleLinks 
} from '../server/services/razorpay';
import { db } from '../server/sqlite_db';

describe('Razorpay & Doodle Integration Service', () => {
  it('should return valid Razorpay configuration with fallback sandbox mode', () => {
    const config = getRazorpayConfig();
    expect(config).toBeDefined();
    expect(config.currency).toBe('INR');
    expect(typeof config.isSandbox).toBe('boolean');
    expect(config.keyId).toBeDefined();
  });

  it('should generate valid Doodle scheduling and polling links', () => {
    const links = getDoodleLinks('Tech Candidate', 'Meta Technical Screen');
    expect(links).toBeDefined();
    expect(links.bookingUrl).toContain('doodle.com');
    expect(links.pollUrl).toContain('doodle.com/create');
    expect(links.pollUrl).toContain(encodeURIComponent('Interview Availability: Tech Candidate - Meta Technical Screen'));
  });

  it('should create a Razorpay order in sandbox/live mode', async () => {
    const order = await createRazorpayOrder({
      tier: 'pro',
      cycle: 'monthly',
      currency: 'INR',
      userId: 'test_user_123',
      email: 'candidate@test.com',
    });

    expect(order).toBeDefined();
    expect(order.orderId).toBeDefined();
    expect(order.orderId).toMatch(/^order_/);
    expect(order.amount).toBe(199900); // INR 1,999 in paise
    expect(order.currency).toBe('INR');
  });

  it('should support USD orders for international candidates', async () => {
    const order = await createRazorpayOrder({
      tier: 'executive',
      cycle: 'quarterly',
      currency: 'USD',
      userId: 'test_user_123',
    });

    expect(order).toBeDefined();
    expect(order.orderId).toBeDefined();
    expect(order.amount).toBe(7200); // USD 72 in cents
    expect(order.currency).toBe('USD');
  });

  it('should verify payment signature in sandbox mode', () => {
    const isValid = verifyRazorpayPaymentSignature(
      'order_sandbox_12345',
      'pay_sandbox_67890',
      'sig_sandbox_verified'
    );
    expect(isValid).toBe(true);
  });

  it('should reject forged payment signatures', () => {
    const isInvalid = verifyRazorpayPaymentSignature(
      'order_sandbox_12345',
      'pay_sandbox_67890',
      'forged_invalid_signature'
    );
    expect(isInvalid).toBe(false);
  });
});
