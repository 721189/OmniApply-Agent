import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getUserFromReq, getOrSetGuestId } from '../middleware/auth';
import { 
  getRazorpayConfig, 
  createRazorpayOrder, 
  verifyRazorpayPaymentSignature, 
  getDoodleLinks,
  RAZORPAY_TIERS 
} from '../services/razorpay';

export const billingRouter = Router();

/**
 * Public tier pricing and feature specifications (Razorpay & Doodle Powered)
 */
billingRouter.get('/pricing', (_req: Request, res: Response) => {
  const config = getRazorpayConfig();

  res.json({
    gateway: 'razorpay',
    currency: config.currency,
    isConfigured: config.isConfigured,
    doodleBookingUrl: config.doodleBookingUrl,
    tiers: [
      {
        id: 'free',
        name: RAZORPAY_TIERS.free.name,
        priceINR: RAZORPAY_TIERS.free.priceINR,
        priceUSD: RAZORPAY_TIERS.free.priceUSD,
        interval: RAZORPAY_TIERS.free.interval,
        headline: RAZORPAY_TIERS.free.headline,
        features: RAZORPAY_TIERS.free.features,
        cta: 'Current Plan',
        popular: false,
      },
      {
        id: 'pro',
        name: RAZORPAY_TIERS.pro.name,
        priceINR: RAZORPAY_TIERS.pro.priceINR,
        priceUSD: RAZORPAY_TIERS.pro.priceUSD,
        priceQuarterlyINR: RAZORPAY_TIERS.pro.priceQuarterlyINR,
        priceQuarterlyUSD: RAZORPAY_TIERS.pro.priceQuarterlyUSD,
        interval: RAZORPAY_TIERS.pro.interval,
        headline: RAZORPAY_TIERS.pro.headline,
        features: RAZORPAY_TIERS.pro.features,
        cta: 'Upgrade with Razorpay',
        popular: true,
        badge: 'Most Popular',
      },
      {
        id: 'executive',
        name: RAZORPAY_TIERS.executive.name,
        priceINR: RAZORPAY_TIERS.executive.priceINR,
        priceUSD: RAZORPAY_TIERS.executive.priceUSD,
        interval: RAZORPAY_TIERS.executive.interval,
        headline: RAZORPAY_TIERS.executive.headline,
        features: RAZORPAY_TIERS.executive.features,
        cta: 'Get Executive Pass',
        popular: false,
        badge: 'Venture & Exec',
        doodleIntegration: true,
      },
    ],
  });
});

/**
 * Public Razorpay and Doodle client configuration
 */
billingRouter.get('/config', (_req: Request, res: Response) => {
  const config = getRazorpayConfig();
  res.json({
    gateway: 'razorpay',
    keyId: config.keyId,
    isSandbox: !config.isConfigured,
    currency: config.currency,
    doodleBookingUrl: config.doodleBookingUrl,
  });
});

/**
 * Get active subscription status and usage limits for current user
 */
billingRouter.get('/subscription', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    const config = getRazorpayConfig();

    if (!user) {
      const guestId = getOrSetGuestId(req, res);
      return res.json({
        tier: 'free',
        status: 'active',
        isGuest: true,
        guestId,
        limits: {
          dossiersRemaining: 3,
          copilotQueriesRemaining: 8,
          canAccessMultiTouchSequencer: false,
          canAccessOfferSimulator: false,
        },
        doodleLinks: getDoodleLinks('Guest Candidate', 'Software Engineer'),
      });
    }

    const tier = user.tier || 'free';
    const isProOrAbove = tier === 'pro' || tier === 'executive';

    // Count user's existing applications this month
    const allJobs = await db.getAllJobs(user.id);
    const dossiersCount = allJobs.length;

    res.json({
      tier,
      status: user.subscriptionStatus || 'active',
      isGuest: false,
      razorpayPaymentId: (user as any).razorpayPaymentId,
      razorpayOrderId: (user as any).razorpayOrderId,
      expiresAt: user.subscriptionExpiresAt,
      limits: {
        dossiersRemaining: isProOrAbove ? 9999 : Math.max(0, 5 - dossiersCount),
        copilotQueriesRemaining: isProOrAbove ? 9999 : 10,
        canAccessMultiTouchSequencer: isProOrAbove,
        canAccessOfferSimulator: isProOrAbove,
      },
      doodleLinks: getDoodleLinks(user.name, user.title || 'Tech Professional'),
      gateway: 'razorpay',
    });
  } catch (err: any) {
    console.error('[Billing Subscription Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve subscription status' });
  }
});

/**
 * Create Razorpay Order
 */
billingRouter.post('/razorpay/create-order', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    const { tier, cycle = 'monthly', currency = 'INR' } = req.body;

    if (!tier || (tier !== 'pro' && tier !== 'executive')) {
      return res.status(400).json({ error: 'Invalid plan tier. Choose "pro" or "executive".' });
    }

    // Calculate amount in minor unit (paise for INR, cents for USD)
    let amountInMinor = 199900; // Default ₹1,999 in paise

    if (currency === 'USD') {
      if (tier === 'pro') {
        amountInMinor = cycle === 'quarterly' ? 5900 : 2400; // $59 or $24
      } else {
        amountInMinor = 7200; // $72
      }
    } else {
      // INR
      if (tier === 'pro') {
        amountInMinor = cycle === 'quarterly' ? 499900 : 199900; // ₹4,999 or ₹1,999
      } else {
        amountInMinor = 599900; // ₹5,999 in paise
      }
    }

    const receipt = `rcpt_${tier}_${Date.now()}`;
    const notes = {
      tier,
      cycle,
      userId: user?.id || 'guest',
      userEmail: user?.email || req.body.email || 'candidate@omniapply.ai',
    };

    const order = await createRazorpayOrder({
      amount: amountInMinor,
      currency,
      receipt,
      notes,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      sandbox: order.sandbox,
      tier,
      cycle,
      doodleUrl: getRazorpayConfig().doodleBookingUrl,
    });
  } catch (err: any) {
    console.error('[Razorpay Create Order Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

/**
 * Verify Razorpay payment and activate subscription tier
 */
billingRouter.post('/razorpay/verify-payment', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to activate plan subscription' });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      tier = 'pro' 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing Razorpay order or payment ID' });
    }

    // Verify payment signature
    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || 'sig_sandbox_verified',
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Razorpay payment signature' });
    }

    // Upgrade user tier in database
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const updated = await db.updateUserSubscription(
      user.id,
      tier,
      razorpay_payment_id,
      razorpay_order_id,
      'active',
      expiresAt
    );

    // Save specific Razorpay IDs into user profile if supported
    (updated as any).razorpayPaymentId = razorpay_payment_id;
    (updated as any).razorpayOrderId = razorpay_order_id;

    await db.logActivity(
      user.id,
      `Razorpay Upgrade: ${tier.toUpperCase()}`,
      'security',
      `Payment ${razorpay_payment_id} verified via Razorpay for order ${razorpay_order_id}. Plan activated.`
    );

    const doodleLinks = getDoodleLinks(user.name, user.title);

    res.json({
      success: true,
      message: `Payment verified! You are now on the ${tier.toUpperCase()} plan.`,
      user: updated,
      doodleLinks,
    });
  } catch (err: any) {
    console.error('[Razorpay Verify Error]:', err);
    res.status(500).json({ error: 'Failed to verify Razorpay payment' });
  }
});

/**
 * Personalized Doodle Advisory & Interview Polling details
 */
billingRouter.get('/doodle-info', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  const links = getDoodleLinks(user?.name, user?.title);
  res.json({
    success: true,
    ...links,
    bookingInstructions: 'Use your Doodle 1:1 advisory link to schedule technical architecture reviews, mock behavioral interviews, or offer negotiation coaching.',
  });
});

/**
 * Backward compatibility: Initiate checkout session
 */
billingRouter.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    const { tier, cycle = 'monthly' } = req.body;

    if (!tier || (tier !== 'pro' && tier !== 'executive')) {
      return res.status(400).json({ error: 'Invalid plan tier requested. Must be "pro" or "executive".' });
    }

    // Forward to Razorpay order creation
    const config = getRazorpayConfig();
    const amountInMinor = tier === 'pro' ? 199900 : 599900;
    const order = await createRazorpayOrder({
      amount: amountInMinor,
      currency: config.currency,
      receipt: `rcpt_${tier}_${Date.now()}`,
      notes: { tier, cycle, userId: user?.id || 'guest' },
    });

    res.json({
      success: true,
      gateway: 'razorpay',
      orderId: order.id,
      sessionId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      sandbox: order.sandbox,
      tier,
      doodleBookingUrl: config.doodleBookingUrl,
    });
  } catch (err: any) {
    console.error('[Billing Checkout Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to initiate checkout session' });
  }
});

/**
 * Activate or upgrade user subscription tier
 */
billingRouter.post('/activate-tier', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to activate plan tier' });
    }

    const { tier, paymentId, orderId, sessionId } = req.body;
    if (!tier || (tier !== 'free' && tier !== 'pro' && tier !== 'executive')) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    const actualPaymentId = paymentId || `pay_${Date.now()}`;
    const actualOrderId = orderId || sessionId || `order_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updated = await db.updateUserSubscription(
      user.id,
      tier,
      actualPaymentId,
      actualOrderId,
      'active',
      expiresAt
    );

    await db.logActivity(
      user.id,
      `Plan upgraded to ${tier.toUpperCase()}`,
      'security',
      `User successfully subscribed to OmniApply ${tier.toUpperCase()} plan (Order: ${actualOrderId}).`
    );

    res.json({
      success: true,
      message: `Successfully upgraded to ${tier.toUpperCase()}`,
      user: updated,
      doodleLinks: getDoodleLinks(user.name, user.title),
    });
  } catch (err: any) {
    console.error('[Billing Activate Error]:', err);
    res.status(500).json({ error: 'Failed to activate subscription plan' });
  }
});

/**
 * Cancel or downgrade subscription
 */
billingRouter.post('/cancel-subscription', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const updated = await db.updateUserSubscription(user.id, 'free', undefined, undefined, 'cancelled');

    await db.logActivity(
      user.id,
      'Plan downgraded to FREE',
      'security',
      'User downgraded subscription plan to Free Starter.'
    );

    res.json({
      success: true,
      message: 'Subscription downgraded to Free Starter tier',
      user: updated,
    });
  } catch (err: any) {
    console.error('[Billing Cancel Error]:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});
