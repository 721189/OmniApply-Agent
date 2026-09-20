/**
 * Stripe Payment & Subscription Infrastructure (Lazy Initialized)
 *
 * Implements commercial billing for OmniApply Pro ($24/mo) and Executive Pass ($79/quarter).
 * Adheres strictly to the AI Studio environment guidelines:
 * - Lazy initialization so missing STRIPE_SECRET_KEY does NOT crash the application on boot
 * - Sandbox testing mode when API keys are not yet provided
 */

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
  sandbox: boolean;
  tier: 'pro' | 'executive';
}

export const TIER_CONFIG = {
  pro: {
    name: 'OmniApply Pro',
    price: 24,
    interval: 'month',
    features: [
      'Unlimited AI Job Dossiers',
      'Full Multi-Profile Ingestion (GitHub, LinkedIn, LeetCode, Substack, X)',
      'Automated Multi-Touch Recruiter Follow-Up Sequences',
      'Continuous ATS Keyword Gap Audits (95%+ Target)',
      'Unlimited AI Career Copilot Queries',
      'Advanced Offer Evaluation & Compensation Simulator',
    ],
  },
  executive: {
    name: 'Executive Pass',
    price: 79,
    interval: 'quarter',
    features: [
      'Everything in Pro Tier',
      'Multi-Offer Game Theory & Negotiation Playbook AI',
      'Priority Model Compute & Zero-Queue Routing',
      'Exportable Candidate Dossiers (PDF, Markdown, Notion-ready)',
      'Private Career Community & VIP Support Channel',
      'Continuous Interview Simulation Drills',
    ],
  },
};

/**
 * Creates a Stripe Checkout Session or returns an active testing sandbox session
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'pro' | 'executive',
  appUrl: string
): Promise<CheckoutResult> {
  const stripe = getStripe();
  const config = TIER_CONFIG[tier];
  const normalizedAppUrl = appUrl.replace(/\/$/, '');

  const successUrl = `${normalizedAppUrl}?payment=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${normalizedAppUrl}?payment=cancelled`;

  // If live or test Stripe key is configured, create a real Stripe Checkout Session
  if (stripe) {
    const priceId = tier === 'pro'
      ? process.env.STRIPE_PRICE_PRO_MONTHLY
      : process.env.STRIPE_PRICE_EXECUTIVE_QUARTERLY;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: config.name,
                description: `OmniApply ${config.name} (${config.interval}ly access)`,
              },
              unit_amount: config.price * 100,
              recurring: {
                interval: tier === 'pro' ? 'month' : 'month',
                interval_count: tier === 'pro' ? 1 : 3,
              },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        tier,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      url: session.url || successUrl.replace('{CHECKOUT_SESSION_ID}', session.id),
      sessionId: session.id,
      sandbox: false,
      tier,
    };
  }

  // Graceful Sandbox Simulation: allows instant preview and verification without requiring live credit cards
  const simulatedSessionId = `sim_cs_${tier}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const simulatedSuccessUrl = `${normalizedAppUrl}?payment=success&tier=${tier}&session_id=${simulatedSessionId}&sandbox=true`;

  return {
    url: simulatedSuccessUrl,
    sessionId: simulatedSessionId,
    sandbox: true,
    tier,
  };
}

/**
 * Creates a Stripe Customer Portal Session for managing subscriptions & credit cards
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { url: returnUrl };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return { url: portalSession.url };
}
