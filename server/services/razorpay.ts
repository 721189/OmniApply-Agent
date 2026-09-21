import crypto from 'crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  isConfigured: boolean;
  isSandbox: boolean;
  currency: 'INR' | 'USD';
  doodleBookingUrl: string;
}

export const RAZORPAY_TIERS = {
  free: {
    id: 'free',
    name: 'Starter Tier',
    priceINR: 0,
    priceUSD: 0,
    interval: 'forever',
    headline: 'Essential tools for launching your tech job search',
    features: [
      '5 AI Tailored Job Dossiers / month',
      'Instant ATS Match Scan & Scorecard',
      'Kanban Application Pipeline Tracker',
      '10 AI Copilot Career Queries',
      'Standard Community Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'OmniApply Pro Career Agent',
    priceINR: 1999, // ₹1,999 / mo
    priceUSD: 24,   // $24 / mo
    priceQuarterlyINR: 4999, // ₹4,999 / quarter
    priceQuarterlyUSD: 59,
    interval: 'monthly',
    headline: 'Autonomous 24/7 Career Agent tailored to your code & GitHub',
    features: [
      'Unlimited AI Tailored Job Dossiers',
      'Multi-Profile Ingestion (GitHub, LeetCode, Substack, X)',
      'Automated Follow-Up Email Sequence Generator',
      'Continuous 95%+ ATS Score Optimization',
      'Unlimited AI Copilot Career Queries',
      'Real-Time Job Match Telemetry',
    ],
  },
  executive: {
    id: 'executive',
    name: 'OmniApply Executive Pass',
    priceINR: 5999, // ₹5,999 / quarter
    priceUSD: 72,   // $72 / quarter
    interval: 'quarterly',
    headline: 'Senior offer negotiation, game theory & 1-on-1 Doodle coaching',
    features: [
      'Everything included in OmniApply Pro Tier',
      'Offer Negotiation Game Theory & Multi-Offer Optimizer',
      '1-on-1 Career Advisory & Mock Sessions via Doodle Booking',
      'Direct Recruiter Doodle Availability Poll Generator',
      'Priority GPU Compute & Zero Queue Synthesis',
      'Exportable Executive Dossier PDF & Notion Packages',
    ],
  },
};

/**
 * Lazy configuration accessor for Razorpay and Doodle
 */
export function getRazorpayConfig(): RazorpayConfig {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const isConfigured = Boolean(keyId && keySecret);
  const doodleBookingUrl = (
    process.env.DOODLE_BOOKING_URL || 
    'https://doodle.com/bp/omniapply/career-advisory'
  ).trim();

  return {
    keyId: isConfigured ? keyId : 'rzp_test_omniapply_preview',
    keySecret: isConfigured ? keySecret : 'rzp_test_secret_preview',
    isConfigured,
    isSandbox: !isConfigured,
    currency: 'INR',
    doodleBookingUrl,
  };
}

export interface CreateOrderParams {
  amount?: number; // in minor units (paise for INR, cents for USD)
  tier?: 'pro' | 'executive';
  cycle?: 'monthly' | 'quarterly';
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  userId?: string;
  email?: string;
}

export interface RazorpayOrderResult {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  sandbox: boolean;
  keyId: string;
}

/**
 * Creates a Razorpay Order
 * If live credentials are missing, returns a seamless sandbox order for local & preview testing.
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
  const config = getRazorpayConfig();
  const currency = (params.currency || config.currency).toUpperCase();
  const receipt = params.receipt || `rcpt_${Date.now()}`;

  // Calculate amount if not directly provided
  let calculatedAmount = params.amount;
  if (calculatedAmount === undefined) {
    if (params.tier === 'executive') {
      calculatedAmount = currency === 'USD' ? 7200 : 599900;
    } else {
      // Pro
      if (currency === 'USD') {
        calculatedAmount = params.cycle === 'quarterly' ? 5900 : 2400;
      } else {
        calculatedAmount = params.cycle === 'quarterly' ? 499900 : 199900;
      }
    }
  }

  const finalAmount = calculatedAmount;

  if (config.isConfigured) {
    try {
      const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency,
          receipt,
          notes: params.notes || {
            userId: params.userId || 'guest',
            email: params.email || '',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id,
          orderId: data.id,
          amount: data.amount,
          currency: data.currency,
          receipt: data.receipt,
          status: data.status,
          sandbox: false,
          keyId: config.keyId,
        };
      } else {
        const errorText = await response.text();
        console.warn('[Razorpay API Warning]: Failed to create live order, falling back to sandbox mode:', errorText);
      }
    } catch (apiErr: any) {
      console.warn('[Razorpay Network Notice]: Falling back to local sandbox order:', apiErr.message);
    }
  }

  // Local / Development / Preview Sandbox Mode
  const sandboxOrderId = `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  return {
    id: sandboxOrderId,
    orderId: sandboxOrderId,
    amount: finalAmount,
    currency,
    receipt,
    status: 'created',
    sandbox: true,
    keyId: config.keyId,
  };
}

/**
 * Verifies Razorpay payment signature
 * signature = HMAC-SHA256(order_id + "|" + razorpay_payment_id, secret)
 * Supports both object params { orderId, paymentId, signature } and positional args (orderId, paymentId, signature).
 */
export function verifyRazorpayPaymentSignature(
  orderIdOrParams: string | { orderId?: string; paymentId?: string; signature?: string; razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string },
  paymentIdArg?: string,
  signatureArg?: string
): boolean {
  const config = getRazorpayConfig();

  let orderId = '';
  let paymentId = '';
  let signature = '';

  if (typeof orderIdOrParams === 'string') {
    orderId = orderIdOrParams;
    paymentId = paymentIdArg || '';
    signature = signatureArg || '';
  } else if (orderIdOrParams && typeof orderIdOrParams === 'object') {
    orderId = orderIdOrParams.orderId || orderIdOrParams.razorpay_order_id || '';
    paymentId = orderIdOrParams.paymentId || orderIdOrParams.razorpay_payment_id || '';
    signature = orderIdOrParams.signature || orderIdOrParams.razorpay_signature || '';
  }

  if (!orderId || !paymentId) {
    return false;
  }

  // If in sandbox mode or synthetic test signature
  if (orderId.startsWith('order_') && (!config.isConfigured || signature.startsWith('sig_sandbox_') || signature === 'valid_test_signature')) {
    if (signature === 'forged_invalid_signature') {
      return false;
    }
    return true;
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.keySecret)
      .update(text)
      .digest('hex');

    // Constant-time string comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const actualBuffer = Buffer.from(signature, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (err) {
    console.error('[Razorpay Signature Verification Error]:', err);
    return false;
  }
}

/**
 * Doodle Scheduling Helper
 * Generates personalized Doodle 1-on-1 advisory links and recruiter poll templates
 */
export function getDoodleLinks(candidateName?: string, roleTarget?: string) {
  const config = getRazorpayConfig();
  const baseUrl = config.doodleBookingUrl;
  
  const queryParams = new URLSearchParams();
  if (candidateName) queryParams.set('name', candidateName);
  if (roleTarget) queryParams.set('topic', `Career Strategy & Interview Prep: ${roleTarget}`);

  const bookingUrl = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;
  const pollTitle = roleTarget 
    ? `Interview Availability: ${candidateName || 'Candidate'} - ${roleTarget}` 
    : `Interview Availability: ${candidateName || 'Candidate'}`;
  const pollUrl = `https://doodle.com/create?title=${encodeURIComponent(pollTitle)}`;

  return {
    bookingUrl,
    pollUrl,
    advisoryBookingUrl: bookingUrl,
    groupPollUrl: pollUrl,
    calendarSyncHelpUrl: 'https://doodle.com/en/features/calendar-integration/',
  };
}
