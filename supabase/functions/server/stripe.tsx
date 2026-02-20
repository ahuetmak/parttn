// Motor de Pagos PARTTH — Stripe Integration
// Escrow Hold + Split 85/15 + Fee PARTTH 15%
import Stripe from 'npm:stripe';

// ─── Cliente ────────────────────────────────────────────────────────────────

export function getStripeClient(): Stripe {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('STRIPE_SECRET_KEY no configurada');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

// ─── 1. RECARGA DE DIAMANTES (Usuario → PARTTH) ──────────────────────────────
// Crea un PaymentIntent estándar para comprar diamantes con tarjeta.

export async function createDiamondsPaymentIntent(amount: number, userId: string) {
  const stripe = getStripeClient();
  return stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: { userId, type: 'diamonds_purchase', diamondsAmount: String(amount) },
    description: `PARTTH — Recarga de ${amount} Diamantes`,
  });
}

// ─── 2. ESCROW HOLD (Acuerdo iniciado) ──────────────────────────────────────
// Bloquea fondos con capture_method: 'manual'. NO se cobra hasta aprobar evidencia.
// El hold expira en 7 días (máximo de Stripe). Para deals más largos, usar KV interno.

export async function createEscrowHold(params: {
  amount: number;          // en diamantes (1 💎 = $1 USD)
  userId: string;          // marcaId — quien paga
  salaId: string;
  paymentMethodId: string; // PM del usuario (guardado en su perfil)
  customerId?: string;     // Stripe customer ID del usuario
}) {
  const stripe = getStripeClient();
  const { amount, userId, salaId, paymentMethodId, customerId } = params;

  const feePARTTH = Math.round(amount * 0.15 * 100);       // 15% en centavos
  const amountCents = amount * 100;

  const pi = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    capture_method: 'manual',                               // 🔒 HOLD — no captura aún
    payment_method: paymentMethodId,
    customer: customerId,
    confirm: true,
    application_fee_amount: feePARTTH,                      // 15% pre-separado para PARTTH
    metadata: {
      type: 'escrow_hold',
      userId,
      salaId,
      diamondsAmount: String(amount),
      feePARTTH: String(amount * 0.15),
    },
    description: `PARTTH Escrow — Sala ${salaId.slice(0, 8)} — ${amount} 💎`,
  });

  return pi;
}

// ─── 3. CAPTURAR ESCROW (Evidencia aprobada → liberar fondos) ────────────────
// Ejecuta la captura del hold. El 15% ya está separado como application_fee.
// El 85% va al socio vía Transfer.

export async function captureEscrowAndSplit(params: {
  paymentIntentId: string;
  socioConnectedAccountId: string;  // Stripe Connect account del socio
  gananciaSocio: number;            // en diamantes
  salaId: string;
}) {
  const stripe = getStripeClient();
  const { paymentIntentId, socioConnectedAccountId, gananciaSocio, salaId } = params;

  // 1. Capturar el hold (cobra la tarjeta del cliente)
  const captured = await stripe.paymentIntents.capture(paymentIntentId);

  // 2. Transferir la ganancia del socio (85%)
  // El application_fee (15%) ya quedó para PARTTH automáticamente
  const transfer = await stripe.transfers.create({
    amount: gananciaSocio * 100,
    currency: 'usd',
    destination: socioConnectedAccountId,
    source_transaction: captured.latest_charge as string,
    metadata: {
      type: 'socio_payout',
      salaId,
      paymentIntentId,
    },
    description: `PARTTH — Pago Socio · Sala ${salaId.slice(0, 8)}`,
  });

  return { captured, transfer };
}

// ─── 4. CANCELAR ESCROW (Disputa → Fondos devueltos) ────────────────────────
// Cancela el PaymentIntent sin cobrar. El hold se libera sin cargo.

export async function cancelEscrowHold(paymentIntentId: string, razon: string) {
  const stripe = getStripeClient();
  return stripe.paymentIntents.cancel(paymentIntentId, {
    cancellation_reason: 'fraudulent',  // tipo más amplio que acepta Stripe
  });
}

// ─── 5. PAYOUT INSTANTÁNEO (Socio retira diamantes) ─────────────────────────
// Transfiere fondos desde PARTTH al banco del socio (requiere Stripe Connect).

export async function createInstantPayout(params: {
  amount: number;
  userId: string;
  connectedAccountId: string;
}) {
  const stripe = getStripeClient();
  const { amount, userId, connectedAccountId } = params;
  const fee = amount * 0.015;
  const net = amount - fee;

  const payout = await stripe.payouts.create(
    {
      amount: Math.round(net * 100),
      currency: 'usd',
      method: 'instant',
      metadata: { userId, type: 'diamonds_withdrawal', gross: String(amount), fee: String(fee) },
      description: `PARTTH — Retiro Instantáneo ${net.toFixed(2)} USD`,
    },
    { stripeAccount: connectedAccountId }
  );

  return payout;
}

// ─── 6. CREAR CONNECTED ACCOUNT (Onboarding del Socio) ──────────────────────
// Genera el link de onboarding para que el socio conecte su cuenta bancaria.

export async function createConnectedAccountLink(userId: string, email: string) {
  const stripe = getStripeClient();

  const account = await stripe.accounts.create({
    type: 'express',
    email,
    metadata: { userId },
    capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
  });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${Deno.env.get('APP_URL') ?? 'https://partth.com'}/app/wallet?stripe=refresh`,
    return_url: `${Deno.env.get('APP_URL') ?? 'https://partth.com'}/app/wallet?stripe=success`,
    type: 'account_onboarding',
  });

  return { accountId: account.id, onboardingUrl: link.url };
}

// ─── 7. WEBHOOK HANDLER ──────────────────────────────────────────────────────

export async function handleStripeWebhook(body: string, signature: string) {
  const stripe = getStripeClient();
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET no configurada');
  return stripe.webhooks.constructEvent(body, signature, secret);
}

// ─── Alias legacy (compatibilidad) ───────────────────────────────────────────

export async function createPayout(amount: number, userId: string, connectedAccountId: string) {
  return createInstantPayout({ amount, userId, connectedAccountId });
}
