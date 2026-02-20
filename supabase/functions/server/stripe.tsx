// Utilidades para integración con Stripe
import Stripe from 'npm:stripe';

// Inicializar Stripe con la clave secreta del env
export function getStripeClient() {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY no configurada en variables de entorno');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
}

// Crear un Payment Intent para recargar diamantes
export async function createDiamondsPaymentIntent(amount: number, userId: string) {
  const stripe = getStripeClient();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convertir a centavos
    currency: 'usd',
    metadata: {
      userId,
      type: 'diamonds_purchase',
    },
  });

  return paymentIntent;
}

// Crear un payout para retirar diamantes
export async function createPayout(amount: number, userId: string, connectedAccountId: string) {
  const stripe = getStripeClient();

  try {
    const payout = await stripe.payouts.create(
      {
        amount: amount * 100, // Convertir a centavos
        currency: 'usd',
        metadata: {
          userId,
          type: 'diamonds_withdrawal',
        },
      },
      {
        stripeAccount: connectedAccountId,
      }
    );

    return payout;
  } catch (error) {
    console.error('Error creating payout:', error);
    throw error;
  }
}

// Webhook handler para eventos de Stripe
export async function handleStripeWebhook(body: string, signature: string) {
  const stripe = getStripeClient();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET no configurada');
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Error verificando webhook de Stripe:', error);
    throw error;
  }
}
