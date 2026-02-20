// n8n Integration - Trigger AI workflows
// Este archivo maneja la integración con n8n para automatización con IA

const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') || '';

interface N8NEvent {
  userId: string;
  event: string;
  data?: any;
  timestamp: string;
}

/**
 * Trigger n8n workflow for lead scoring
 * Se ejecuta cuando un usuario realiza acciones importantes
 */
export async function triggerLeadScoring(userId: string, event: string, data?: any) {
  if (!N8N_WEBHOOK_URL) {
    console.log('⚠️ N8N_WEBHOOK_URL no configurado - saltando lead scoring');
    return;
  }

  try {
    const payload: N8NEvent = {
      userId,
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${N8N_WEBHOOK_URL}/lead-scoring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`❌ Error en n8n lead scoring: ${response.status}`);
    } else {
      console.log(`✅ n8n lead scoring triggered para user ${userId} - evento: ${event}`);
    }
  } catch (error) {
    console.error(`❌ Error conectando con n8n: ${error}`);
  }
}

/**
 * Eventos que disparan lead scoring automático
 */
export const LEAD_SCORING_EVENTS = {
  USER_SIGNUP: 'user_signup',
  PROFILE_COMPLETED: 'profile_completed',
  WALLET_RECHARGED: 'wallet_recharged',
  SALA_CREATED: 'sala_created',
  SALA_APPLIED: 'sala_applied',
  SALA_COMPLETED: 'sala_completed',
  USER_LOGIN: 'user_login',
  TIER_UPGRADED: 'tier_upgraded',
  REFERRAL_MADE: 'referral_made',
};

/**
 * Helper function - disparar múltiples eventos
 */
export async function triggerMultipleEvents(events: Array<{ userId: string; event: string; data?: any }>) {
  await Promise.all(events.map(e => triggerLeadScoring(e.userId, e.event, e.data)));
}
