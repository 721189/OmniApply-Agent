import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getUserFromReq, getOrSetGuestId } from '../middleware/auth';
import { 
  createCheckoutSession, 
  createCustomerPortalSession, 
  getStripe, 
  TIER_CONFIG 
} from '../services/stripe';

export const billingRouter = Router();

/**
 * Public tier pricing and feature specifications
 */
billingRouter.get('/pricing', (_req: Request, res: Response) => {
  res.json({
    tiers: [
      {
        id: 'free',
        name: 'Starter Tier',
        price: 0,
        interval: 'forever',
        headline: 'Essential tools for launching your job search',
        features: [
          '5 AI Tailored Job Dossiers / month',
          'Basic ATS Match Scan & Score',
          'Kanban Application Tracker',
          '10 AI Copilot Career Queries',
          'Standard Community Support',
        ],
        cta: 'Current Plan',
        popular: false,
      },
      {
        id: 'pro',
        name: TIER_CONFIG.pro.name,
        price: TIER_CONFIG.pro.price,
        interval: TIER_CONFIG.pro.interval,
        headline: 'Autonomous 24/7 Career Agent tailored to your code',
        features: TIER_CONFIG.pro.features,
        cta: 'Upgrade to Pro',
        popular: true,
        badge: 'Most Popular',
      },
      {
        id: 'executive',
        name: TIER_CONFIG.executive.name,
        price: TIER_CONFIG.executive.price,
        interval: TIER_CONFIG.executive.interval,
        headline: 'Elite offer negotiation & multi-offer game theory',
        features: TIER_CONFIG.executive.features,
        cta: 'Get Executive Pass',
        popular: false,
        badge: 'Venture & Exec',
      },
    ],
  });
});

/**
 * Get active subscription status and usage limits for current user
 */
billingRouter.get('/subscription', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      // Return default free tier for guest/unauthenticated users
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
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      expiresAt: user.subscriptionExpiresAt,
      limits: {
        dossiersRemaining: isProOrAbove ? 9999 : Math.max(0, 5 - dossiersCount),
        copilotQueriesRemaining: isProOrAbove ? 9999 : 10,
        canAccessMultiTouchSequencer: isProOrAbove,
        canAccessOfferSimulator: isProOrAbove,
      },
    });
  } catch (err: any) {
    console.error('[Billing Subscription Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve subscription status' });
  }
});

/**
 * Initiate Stripe Checkout Session or sandbox activation
 */
billingRouter.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    const { tier } = req.body;

    if (!tier || (tier !== 'pro' && tier !== 'executive')) {
      return res.status(400).json({ error: 'Invalid plan tier requested. Must be "pro" or "executive".' });
    }

    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).trim();
    const userEmail = user?.email || (req.body.guestEmail ? String(req.body.guestEmail).trim() : 'candidate@omniapply.ai');
    const userId = user?.id || `guest-${Date.now()}`;

    const session = await createCheckoutSession(userId, userEmail, tier, appUrl);

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.sessionId,
      sandbox: session.sandbox,
      tier,
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

    const { tier, sessionId } = req.body;
    if (!tier || (tier !== 'free' && tier !== 'pro' && tier !== 'executive')) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const updated = await db.updateUserSubscription(
      user.id,
      tier,
      user.stripeCustomerId || `cus_${Date.now()}`,
      sessionId || `sub_${Date.now()}`,
      'active',
      expiresAt
    );

    await db.logActivity(
      user.id,
      `Plan upgraded to ${tier.toUpperCase()}`,
      'security',
      `User successfully subscribed to OmniApply ${tier.toUpperCase()} plan (Session: ${sessionId || 'direct'}).`
    );

    res.json({
      success: true,
      message: `Successfully upgraded to ${tier.toUpperCase()}`,
      user: updated,
    });
  } catch (err: any) {
    console.error('[Billing Activate Error]:', err);
    res.status(500).json({ error: 'Failed to activate subscription plan' });
  }
});

/**
 * Customer Billing Portal session for card updates & cancellations
 */
billingRouter.post('/create-portal-session', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const returnUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).trim();
    if (!user.stripeCustomerId) {
      return res.json({ url: returnUrl });
    }

    const portal = await createCustomerPortalSession(user.stripeCustomerId, returnUrl);
    res.json({ url: portal.url });
  } catch (err: any) {
    console.error('[Billing Portal Error]:', err);
    res.status(500).json({ error: 'Failed to create customer portal session' });
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

    const updated = await db.updateUserSubscription(user.id, 'free', user.stripeCustomerId, undefined, 'cancelled');

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
