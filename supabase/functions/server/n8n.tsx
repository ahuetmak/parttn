// n8n Integration — PARTTH Growth Engine
// Webhooks de Marketing, IA Partners y Monitoreo de Éxito
// Solo pega N8N_WEBHOOK_URL en las vars de entorno y el sistema viraliza solo.

import * as kv from "./kv_store.tsx";

const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') || '';

interface N8NEvent {
  userId: string;
  event: string;
  data?: any;
  timestamp: string;
}

// ── Eventos de Lead Scoring ──────────────────────────────────────────────────

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
  // Growth events
  MISION_PUBLICADA: 'mision_publicada',
  SCRIPT_GENERADO: 'script_generado',
  EVIDENCIA_APROBADA: 'evidencia_aprobada',
};

// ── Helper base ───────────────────────────────────────────────────────────────

async function fireWebhook(path: string, payload: any): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.log(`⚠️ N8N_WEBHOOK_URL no configurado — evento ${path} registrado en cola local`);
    // Guardar en cola local para procesar cuando se configure n8n
    try {
      const queue = await kv.get('n8n:queue') || [];
      queue.push({ path, payload, pendingAt: new Date().toISOString() });
      if (queue.length > 100) queue.splice(0, queue.length - 100); // max 100
      await kv.set('n8n:queue', queue);
    } catch { /* no-op */ }
    return false;
  }

  try {
    const url = `${N8N_WEBHOOK_URL}${path.startsWith('/') ? path : '/' + path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PARTTH-Source': 'partth-backend',
        'X-PARTTH-Version': '1.0.0',
      },
      body: JSON.stringify({
        ...payload,
        _meta: { source: 'PARTTH', version: '1.0.0', sentAt: new Date().toISOString() },
      }),
    });
    if (!response.ok) {
      console.error(`❌ n8n webhook error [${path}]: ${response.status}`);
      return false;
    }
    console.log(`✅ n8n webhook fired [${path}]`);
    return true;
  } catch (error) {
    console.error(`❌ n8n connection error [${path}]: ${error}`);
    return false;
  }
}

// ── Lead Scoring ─────────────────────────────────────────────────────────────

export async function triggerLeadScoring(userId: string, event: string, data?: any) {
  return fireWebhook('/lead-scoring', {
    userId, event, data,
    timestamp: new Date().toISOString(),
  });
}

export async function triggerMultipleEvents(events: Array<{ userId: string; event: string; data?: any }>) {
  await Promise.all(events.map(e => triggerLeadScoring(e.userId, e.event, e.data)));
}

// ── 1. MARKETING WEBHOOK — Nueva misión publicada ────────────────────────────
// Dispara cuando una Marca publica una misión en el Marketplace.
// n8n la distribuye automáticamente en redes sociales.

export async function triggerNuevaMisionMarketing(mision: {
  id: string;
  titulo: string;
  descripcion: string;
  presupuesto: number;
  comisionSocio: number;
  categoria: string;
  marcaNombre: string;
  scriptVenta?: string;
  checklistEvidencia?: any[];
}) {
  const gananciaEjemplo = Math.floor(mision.presupuesto * (mision.comisionSocio / 100));

  return fireWebhook('/webhook/marketing/nueva-mision', {
    tipo: 'NUEVA_MISION_MARKETPLACE',
    mision: {
      id: mision.id,
      titulo: mision.titulo,
      descripcion: mision.descripcion,
      presupuesto: mision.presupuesto,
      comisionSocio: mision.comisionSocio,
      categoria: mision.categoria,
      marcaNombre: mision.marcaNombre,
      gananciaEjemplo,
      feePARTTH: Math.floor(mision.presupuesto * 0.15),
      scriptVenta: mision.scriptVenta || null,
      checklistEvidencia: mision.checklistEvidencia || [],
    },
    // Textos listos para publicar en redes
    socialCopy: {
      twitter: `🚨 Nueva misión en @PARTTH: "${mision.titulo}" — Gana hasta $${gananciaEjemplo} USD. Evidencia verificada por IA. #PARTTH #NegociosDigitales`,
      instagram: `💎 ${mision.titulo}\n\nPresupuesto: $${mision.presupuesto.toLocaleString()} USD\nTu comisión: $${gananciaEjemplo.toLocaleString()} (${mision.comisionSocio}%)\n\nSistema de escrow PARTTH. Sin riesgo. 🔒\n\n#partth #marketplace #digitalmoney`,
      whatsapp: `🔥 NUEVA MISIÓN PARTTH\n\n"${mision.titulo}"\n\n✅ Pago: $${mision.presupuesto.toLocaleString()} USD\n💰 Tu ganancia: $${gananciaEjemplo.toLocaleString()} (${mision.comisionSocio}%)\n🔒 Escrow protegido\n🤖 Validación IA\n\nAplica en: partth.com/app/marketplace`,
    },
    timestamp: new Date().toISOString(),
  });
}

// ── 2. IA PARTNERS — Script generado por Abacus ──────────────────────────────
// Cuando Abacus genera una estrategia, n8n la distribuye en canales vinculados.

export async function triggerScriptGenerado(data: {
  socioId: string;
  productoNombre: string;
  categoriaProducto: string;
  guionCompleto: string;
  hookPrincipal: string;
  hashtags: string;
  precioProducto: number;
  gananciaEjemplo: number;
}) {
  return fireWebhook('/webhook/ia-partners/script-generado', {
    tipo: 'SCRIPT_VIRAL_GENERADO',
    socioId: data.socioId,
    productoNombre: data.productoNombre,
    categoria: data.categoriaProducto,
    distribucion: {
      hook: data.hookPrincipal,
      guion: data.guionCompleto,
      hashtags: data.hashtags,
      precio: data.precioProducto,
      ganancia: data.gananciaEjemplo,
    },
    instrucciones: {
      accion: 'DISTRIBUIR_EN_REDES',
      plataformas: ['twitter', 'instagram', 'tiktok', 'whatsapp'],
      programar: true,
      intervaloHoras: 4,
    },
    timestamp: new Date().toISOString(),
  });
}

// ── 3. MONITOREO DE ÉXITO — n8n devuelve datos de engagement ─────────────────
// Recibe clics/interacciones desde n8n y actualiza la reputación del socio.

export async function procesarEngagementData(data: {
  socioId: string;
  misionId?: string;
  clics: number;
  impresiones: number;
  conversiones: number;
  plataforma: string;
  periodo: string;
}) {
  try {
    const { socioId, clics, impresiones, conversiones, plataforma, periodo } = data;

    // Actualizar métricas del socio en KV
    const key = `engagement:${socioId}`;
    let engagement = await kv.get(key) || {
      socioId,
      totalClics: 0,
      totalImpresiones: 0,
      totalConversiones: 0,
      historico: [],
    };

    engagement.totalClics += clics;
    engagement.totalImpresiones += impresiones;
    engagement.totalConversiones += conversiones;
    engagement.historico.push({
      plataforma, periodo, clics, impresiones, conversiones,
      registradoEn: new Date().toISOString(),
    });
    // Mantener solo últimos 30 registros
    if (engagement.historico.length > 30) {
      engagement.historico = engagement.historico.slice(-30);
    }
    await kv.set(key, engagement);

    // Bonus de reputación por conversiones
    if (conversiones > 0) {
      const user = await kv.get(`user:${socioId}`);
      if (user) {
        user.reputation = (user.reputation || 0) + conversiones * 2;
        await kv.set(`user:${socioId}`, user);
      }
    }

    return { ok: true, engagement };
  } catch (error) {
    console.error(`Error procesando engagement: ${error}`);
    return { ok: false, error: String(error) };
  }
}

// ── 4. EVIDENCIA APROBADA — Notificar éxito a n8n ────────────────────────────

export async function triggerEvidenciaAprobada(data: {
  socioId: string;
  salaId: string;
  productoNombre: string;
  ganancia: number;
  scoreIA: number;
}) {
  return fireWebhook('/webhook/marketing/evidencia-aprobada', {
    tipo: 'DEAL_COMPLETADO',
    ...data,
    socialProof: {
      tweet: `💎 Deal cerrado en @PARTTH: "${data.productoNombre}" · Score IA: ${(data.scoreIA * 100).toFixed(1)}% · Pago: $${data.ganancia} USD. El sistema funciona. #PARTTH`,
      instagram: `✅ DEAL CERRADO\n\nProducto: ${data.productoNombre}\nScore de Evidencia: ${(data.scoreIA * 100).toFixed(1)}%\nGanancia: $${data.ganancia} USD 💎\n\nAquí está la prueba de que PARTTH funciona. #partth #pagodigital`,
    },
    timestamp: new Date().toISOString(),
  });
}

// ── 5. Configurar URL de n8n (helper para endpoint de admin) ─────────────────

export async function configurarN8nUrl(url: string) {
  await kv.set('config:n8n_url', { url, configuradoEn: new Date().toISOString() });
  return { ok: true, mensaje: `n8n configurado: ${url}` };
}

export async function getN8nConfig() {
  return kv.get('config:n8n_url');
}

// ── 6. Procesar cola pendiente (si había webhooks sin enviar) ─────────────────

export async function procesarColaPendiente() {
  if (!N8N_WEBHOOK_URL) return { procesados: 0 };
  try {
    const queue = await kv.get('n8n:queue') || [];
    if (!queue.length) return { procesados: 0 };

    let procesados = 0;
    for (const item of queue) {
      const ok = await fireWebhook(item.path, item.payload);
      if (ok) procesados++;
    }
    await kv.set('n8n:queue', []);
    return { procesados };
  } catch {
    return { procesados: 0 };
  }
}
