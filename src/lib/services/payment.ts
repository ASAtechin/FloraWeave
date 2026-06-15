import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-01-27' as any, // fallback standard
});

export interface CreatePaymentIntentParams {
  amount: number; // in minor units (e.g. Paise for INR, Cents for USD)
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  gateway: 'stripe' | 'razorpay';
  transactionId: string;
  clientSecret: string; // Used by frontend checkout SDK
  amount: number;
  currency: string;
}

export class PaymentService {
  /**
   * Generates client secret token based on active currency/gateway routing.
   * Uses Stripe for international / default, and is architectured for Razorpay expansion.
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const isIndianRupee = params.currency.toUpperCase() === 'INR';
    
    // In a real rollout, we could route INR payments to Razorpay
    const useRazorpay = isIndianRupee && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder';

    if (useRazorpay) {
      return this.initializeRazorpayOrder(params);
    }

    return this.initializeStripePayment(params);
  }

  /**
   * Initializes a Stripe checkout session or payment intent.
   */
  private static async initializeStripePayment(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    // If stripe placeholder is active, mock it gracefully
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return {
        gateway: 'stripe',
        transactionId: `mock_stripe_${Math.random().toString(36).substr(2, 9)}`,
        clientSecret: `mock_stripe_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: params.amount,
        currency: params.currency,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount),
      currency: params.currency.toLowerCase(),
      metadata: {
        orderId: params.orderId,
        customerEmail: params.customerEmail,
        ...params.metadata,
      },
    });

    return {
      gateway: 'stripe',
      transactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  /**
   * Mock implementation for Razorpay orders setup.
   */
  private static async initializeRazorpayOrder(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    console.log(`Routing order ${params.orderId} (INR) to Razorpay...`);
    // Mocking Razorpay API call
    return {
      gateway: 'razorpay',
      transactionId: `rzp_order_${Math.random().toString(36).substr(2, 9)}`,
      clientSecret: `rzp_sec_${Math.random().toString(36).substr(2, 9)}`,
      amount: params.amount,
      currency: 'INR',
    };
  }

  /**
   * Validates webhooks from payment gateways.
   */
  static verifyWebhook(
    body: string,
    signature: string,
    secret: string,
    gateway: 'stripe' | 'razorpay'
  ): boolean {
    if (gateway === 'stripe') {
      try {
        if (process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') return true;
        const event = stripe.webhooks.constructEvent(body, signature, secret);
        return !!event;
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return false;
      }
    }

    if (gateway === 'razorpay') {
      // Mock validation for Razorpay webhooks
      return signature === 'mock_valid_signature';
    }

    return false;
  }
}
