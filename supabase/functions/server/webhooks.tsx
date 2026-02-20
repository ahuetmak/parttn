import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ========================================
// WEBHOOKS FOR N8N INTEGRATION
// ========================================

// N8N webhook base URL (from environment variable)
const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') || 'https://n8n.yourdomain.com/webhook';

// Helper function to call n8n webhooks
async function callN8NWebhook(endpoint: string, data: any) {
  try {
    const response = await fetch(`${N8N_WEBHOOK_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`Error calling n8n webhook ${endpoint}: ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling n8n webhook ${endpoint}: ${error}`);
    return null;
  }
}

// ========================================
// ABACUS CHAT BOT
// ========================================
export async function abacusChat(c: Context) {
  try {
    const { userId, message, salaId } = await c.req.json();
    
    if (!userId || !message) {
      return c.json({ error: 'userId y message son requeridos' }, 400);
    }
    
    // Get user context
    const user = await kv.get(`user:${userId}`);
    const wallet = await kv.get(`wallet:${userId}`);
    
    let salaContext = null;
    if (salaId) {
      salaContext = await kv.get(`sala:${salaId}`);
    }
    
    // Call n8n Abacus workflow
    const response = await callN8NWebhook('/abacus-chat', {
      userId,
      message,
      user,
      wallet,
      sala: salaContext,
      timestamp: new Date().toISOString(),
    });
    
    if (!response) {
      // Fallback response if n8n is not available
      return c.json({
        reply: "Hola, soy Abacus. Estoy aquí para ayudarte con PARTH. ¿En qué puedo asistirte?",
        suggestions: ["Ver mi wallet", "Estado de salas", "Calcular tarifas"]
      });
    }
    
    // Save chat history
    const chatHistory = await kv.get(`chat:${userId}`) || [];
    chatHistory.push({
      timestamp: new Date().toISOString(),
      userMessage: message,
      abacusReply: response.reply,
      salaId,
    });
    
    // Keep only last 100 messages
    if (chatHistory.length > 100) {
      chatHistory.shift();
    }
    
    await kv.set(`chat:${userId}`, chatHistory);
    
    return c.json(response);
  } catch (error) {
    console.error(`Error en Abacus chat: ${error}`);
    return c.json({ error: 'Error procesando mensaje' }, 500);
  }
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================
export async function sendNotification(c: Context) {
  try {
    const { userId, type, title, message, data } = await c.req.json();
    
    if (!userId || !type || !message) {
      return c.json({ error: 'userId, type y message son requeridos' }, 400);
    }
    
    // Get user preferences
    const user = await kv.get(`user:${userId}`);
    
    // Call n8n notification workflow
    await callN8NWebhook('/notify', {
      userId,
      type, // evidencia_aprobada, fondos_liberados, nueva_aplicacion, etc.
      title,
      message,
      data,
      user,
      timestamp: new Date().toISOString(),
    });
    
    // Save notification in database
    const notifications = await kv.get(`notifications:${userId}`) || [];
    notifications.unshift({
      id: crypto.randomUUID(),
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    // Keep only last 200 notifications
    if (notifications.length > 200) {
      notifications.pop();
    }
    
    await kv.set(`notifications:${userId}`, notifications);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error enviando notificación: ${error}`);
    return c.json({ error: 'Error enviando notificación' }, 500);
  }
}

// ========================================
// VALIDATE EVIDENCE (AI)
// ========================================
export async function validateEvidence(c: Context) {
  try {
    const { salaId, evidenceUrl, evidenceType, uploadedBy } = await c.req.json();
    
    if (!salaId || !evidenceUrl) {
      return c.json({ error: 'salaId y evidenceUrl son requeridos' }, 400);
    }
    
    // Call n8n evidence validation workflow
    const response = await callN8NWebhook('/validate-evidence', {
      salaId,
      evidenceUrl,
      evidenceType,
      uploadedBy,
      timestamp: new Date().toISOString(),
    });
    
    if (!response) {
      // Fallback: mark as pending manual review
      return c.json({
        status: 'pending_review',
        message: 'Evidencia recibida. En revisión manual.',
        issues: []
      });
    }
    
    // Update sala evidence status
    const sala = await kv.get(`sala:${salaId}`);
    if (sala) {
      sala.evidences = sala.evidences || [];
      sala.evidences.push({
        url: evidenceUrl,
        type: evidenceType,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
        validationStatus: response.status,
        validationDetails: response,
      });
      await kv.set(`sala:${salaId}`, sala);
    }
    
    return c.json(response);
  } catch (error) {
    console.error(`Error validando evidencia: ${error}`);
    return c.json({ error: 'Error validando evidencia' }, 500);
  }
}

// ========================================
// DISPUTE MEDIATOR (AI)
// ========================================
export async function mediateDispute(c: Context) {
  try {
    const { disputeId } = await c.req.json();
    
    if (!disputeId) {
      return c.json({ error: 'disputeId es requerido' }, 400);
    }
    
    // Get dispute details
    const dispute = await kv.get(`dispute:${disputeId}`);
    
    if (!dispute) {
      return c.json({ error: 'Disputa no encontrada' }, 404);
    }
    
    // Get sala and evidences
    const sala = await kv.get(`sala:${dispute.salaId}`);
    
    // Call n8n dispute mediation workflow
    const response = await callN8NWebhook('/mediate-dispute', {
      disputeId,
      dispute,
      sala,
      timestamp: new Date().toISOString(),
    });
    
    if (!response) {
      return c.json({
        recommendation: 'En análisis',
        message: 'La mediación por IA está en proceso. Un administrador revisará el caso manualmente.'
      });
    }
    
    // Save AI recommendation
    dispute.aiRecommendation = {
      ...response,
      timestamp: new Date().toISOString(),
    };
    
    await kv.set(`dispute:${disputeId}`, dispute);
    
    // Notify parties
    await callN8NWebhook('/notify', {
      userId: dispute.openedBy,
      type: 'dispute_mediation',
      title: 'Recomendación de Mediación',
      message: `Abacus ha analizado la disputa #${disputeId}`,
      data: { disputeId, recommendation: response },
    });
    
    return c.json(response);
  } catch (error) {
    console.error(`Error mediando disputa: ${error}`);
    return c.json({ error: 'Error mediando disputa' }, 500);
  }
}

// ========================================
// TRIGGER ONBOARDING
// ========================================
export async function triggerOnboarding(c: Context) {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'userId es requerido' }, 400);
    }
    
    const user = await kv.get(`user:${userId}`);
    
    // Call n8n onboarding workflow
    await callN8NWebhook('/onboarding', {
      userId,
      email: user?.email,
      name: user?.name,
      userType: user?.userType,
      timestamp: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error iniciando onboarding: ${error}`);
    return c.json({ error: 'Error iniciando onboarding' }, 500);
  }
}

// ========================================
// GET CHAT HISTORY
// ========================================
export async function getChatHistory(c: Context) {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'userId es requerido' }, 400);
    }
    
    const chatHistory = await kv.get(`chat:${userId}`) || [];
    
    return c.json({ chatHistory });
  } catch (error) {
    console.error(`Error obteniendo historial de chat: ${error}`);
    return c.json({ error: 'Error obteniendo historial' }, 500);
  }
}
