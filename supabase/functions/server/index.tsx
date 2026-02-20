import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as stripe from "./stripe.tsx";
import * as webhooks from "./webhooks.tsx";
import * as marketplace from "./marketplace.tsx";
import * as loyalty from "./loyalty.tsx";
import * as disputes from "./disputes.tsx";
import * as referrals from "./referrals.tsx";
import * as n8n from "./n8n.tsx";
import * as social from "./social.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ── JWT AUTH GUARD ────────────────────────────────────────────────────────────
// Verifica el Bearer token de Supabase en rutas financieras críticas.
// Rutas excluidas: health, auth/signup, auth/login (no requieren sesión previa).
const UNPROTECTED = [
  '/health',
  '/auth/signup',
  '/auth/login',
];

app.use('/make-server-1c8a6aaa/*', async (c, next) => {
  const path = c.req.path.replace('/make-server-1c8a6aaa', '');

  // Pasar rutas no protegidas sin validar
  if (UNPROTECTED.some(u => path.startsWith(u))) {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado — token requerido', code: 'AUTH_REQUIRED' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return c.json({ error: 'Token inválido o expirado', code: 'AUTH_INVALID' }, 401);
    }
    // Inyectar userId verificado en el contexto
    c.set('userId' as never, user.id);
    return next();
  } catch {
    return c.json({ error: 'Error de autenticación', code: 'AUTH_ERROR' }, 401);
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// Initialize Supabase Storage bucket on startup
const initStorageBucket = async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const bucketName = 'make-1c8a6aaa-evidencias';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`);
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`✅ Bucket ${bucketName} created successfully`);
    } else {
      console.log(`✅ Bucket ${bucketName} already exists`);
    }
  } catch (error) {
    console.error(`Error initializing storage bucket: ${error}`);
  }
};

// Initialize bucket
initStorageBucket();

// Health check endpoint
app.get("/make-server-1c8a6aaa/health", (c) => {
  return c.json({ status: "ok" });
});

// ========================================
// AUTH ENDPOINTS
// ========================================

// Sign Up
app.post("/make-server-1c8a6aaa/auth/signup", async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error(`Error en signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Crear wallet inicial para el usuario
    const newWallet = {
      userId: data.user.id,
      disponible: 0,
      enEscrow: 0,
      enHold: 0,
      enRevision: 0,
      enDisputa: 0,
      totalIngresos: 0,
      totalTarifasPagadas: 0,
    };
    await kv.set(`wallet:${data.user.id}`, newWallet);

    // Crear perfil de usuario
    const userProfile = {
      id: data.user.id,
      email,
      name,
      userType,
      reputation: 0,
      completedDeals: 0,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`user:${data.user.id}`, userProfile);

    // 🚀 Trigger n8n lead scoring - Nuevo usuario
    await n8n.triggerLeadScoring(data.user.id, n8n.LEAD_SCORING_EVENTS.USER_SIGNUP, {
      email,
      userType,
      name,
    });

    return c.json({
      user: data.user,
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error(`Error creando usuario: ${error}`);
    return c.json({ error: 'Error creando usuario' }, 500);
  }
});

// Get Session
app.get("/make-server-1c8a6aaa/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ user: null });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ user: null });
    }

    // Obtener perfil completo
    const userProfile = await kv.get(`user:${user.id}`);

    return c.json({
      user: {
        ...user,
        ...userProfile
      }
    });
  } catch (error) {
    console.error(`Error obteniendo sesión: ${error}`);
    return c.json({ user: null });
  }
});

// ========================================
// WALLET ENDPOINTS
// ========================================

// Obtener balance del wallet
app.get("/make-server-1c8a6aaa/wallet/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const wallet = await kv.get(`wallet:${userId}`);

    if (!wallet) {
      // Crear wallet inicial si no existe
      const newWallet = {
        userId,
        disponible: 0,
        enEscrow: 0,
        enHold: 0,
        enRevision: 0,
        enDisputa: 0,
        totalIngresos: 0,
        totalTarifasPagadas: 0,
      };
      await kv.set(`wallet:${userId}`, newWallet);
      return c.json(newWallet);
    }

    return c.json(wallet);
  } catch (error) {
    console.error(`Error obteniendo wallet: ${error}`);
    return c.json({ error: 'Error obteniendo wallet' }, 500);
  }
});

// Crear Payment Intent para recargar diamantes
app.post("/make-server-1c8a6aaa/wallet/recharge", async (c) => {
  try {
    const { userId, amount } = await c.req.json();

    if (!amount || amount < 10) {
      return c.json({ error: 'Monto mínimo de recarga: 10 diamantes' }, 400);
    }

    const paymentIntent = await stripe.createDiamondsPaymentIntent(amount, userId);

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error(`Error creando recarga: ${error}`);
    return c.json({ error: 'Error procesando recarga' }, 500);
  }
});

// Procesar retiro de diamantes
app.post("/make-server-1c8a6aaa/wallet/withdraw", async (c) => {
  try {
    const { userId, amount, connectedAccountId } = await c.req.json();

    // Obtener wallet
    const wallet = await kv.get(`wallet:${userId}`);
    if (!wallet || wallet.disponible < amount) {
      return c.json({ error: 'Fondos insuficientes' }, 400);
    }

    // Calcular tarifa de retiro (1.5%)
    const fee = amount * 0.015;
    const netAmount = amount - fee;

    // Crear payout en Stripe
    const payout = await stripe.createPayout(netAmount, userId, connectedAccountId);

    // Actualizar wallet
    wallet.disponible -= amount;
    wallet.totalTarifasPagadas += fee;
    await kv.set(`wallet:${userId}`, wallet);

    // Registrar transacción
    const transaction = {
      id: crypto.randomUUID(),
      userId,
      type: 'withdrawal',
      amount: -amount,
      fee: -fee,
      netAmount: -netAmount,
      status: 'processing',
      payoutId: payout.id,
      timestamp: new Date().toISOString(),
    };
    await kv.set(`transaction:${transaction.id}`, transaction);

    return c.json({ success: true, transaction });
  } catch (error) {
    console.error(`Error procesando retiro: ${error}`);
    return c.json({ error: 'Error procesando retiro' }, 500);
  }
});

// Obtener transacciones del usuario
app.get("/make-server-1c8a6aaa/transactions/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const transactions = await kv.getByPrefix(`transaction:${userId}:`);

    // Ordenar por timestamp descendente
    transactions.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json(transactions);
  } catch (error) {
    console.error(`Error obteniendo transacciones: ${error}`);
    return c.json({ error: 'Error obteniendo transacciones' }, 500);
  }
});

// ========================================
// SALAS DIGITALES ENDPOINTS
// ========================================

// Crear nueva sala digital
app.post("/make-server-1c8a6aaa/salas", async (c) => {
  try {
    const { marcaId, socioId, titulo, descripcion, totalProducto, comisionSocio } = await c.req.json();

    // Calcular comisiones
    const feePARTTH = totalProducto * 0.15;
    const gananciaSocio = totalProducto * (comisionSocio / 100);
    const netoMarca = totalProducto - feePARTTH - gananciaSocio;

    // Verificar que la Marca tenga fondos suficientes
    const marcaWallet = await kv.get(`wallet:${marcaId}`);
    if (!marcaWallet || marcaWallet.disponible < totalProducto) {
      return c.json({ error: 'Fondos insuficientes para crear la sala' }, 400);
    }

    // Crear sala
    const sala = {
      id: crypto.randomUUID(),
      marcaId,
      socioId,
      titulo,
      descripcion,
      totalProducto,
      comisionSocio,
      feePARTTH,
      gananciaSocio,
      netoMarca,
      estado: 'activa',
      evidenciaEntregada: false,
      evidenciaAprobada: false,
      fondosLiberados: false,
      tieneDisputa: false,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          id: crypto.randomUUID(),
          tipo: 'creacion',
          descripcion: 'Sala digital creada',
          timestamp: new Date().toISOString(),
          autor: marcaId,
        },
      ],
    };

    await kv.set(`sala:${sala.id}`, sala);

    // Bloquear fondos en escrow
    marcaWallet.disponible -= totalProducto;
    marcaWallet.enEscrow += totalProducto;
    await kv.set(`wallet:${marcaId}`, marcaWallet);

    // Registrar transacción
    const transaction = {
      id: crypto.randomUUID(),
      userId: marcaId,
      type: 'escrow_locked',
      amount: -totalProducto,
      salaId: sala.id,
      status: 'locked',
      timestamp: new Date().toISOString(),
    };
    await kv.set(`transaction:${marcaId}:${transaction.id}`, transaction);

    return c.json(sala);
  } catch (error) {
    console.error(`Error creando sala: ${error}`);
    return c.json({ error: 'Error creando sala digital' }, 500);
  }
});

// Obtener salas del usuario
app.get("/make-server-1c8a6aaa/salas/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const allSalas = await kv.getByPrefix('sala:');

    // Filtrar salas donde el usuario es marca o socio
    const userSalas = allSalas.filter((sala: any) =>
      sala.marcaId === userId || sala.socioId === userId
    );

    return c.json(userSalas);
  } catch (error) {
    console.error(`Error obteniendo salas: ${error}`);
    return c.json({ error: 'Error obteniendo salas' }, 500);
  }
});

// Obtener detalle de sala
app.get("/make-server-1c8a6aaa/sala/:salaId", async (c) => {
  try {
    const salaId = c.req.param("salaId");
    const sala = await kv.get(`sala:${salaId}`);

    if (!sala) {
      return c.json({ error: 'Sala no encontrada' }, 404);
    }

    return c.json(sala);
  } catch (error) {
    console.error(`Error obteniendo sala: ${error}`);
    return c.json({ error: 'Error obteniendo sala' }, 500);
  }
});

// ========================================
// MOTOR DE VALIDACIÓN IA — AUDITOR DE VERDAD
// ========================================

/**
 * Calcula un score de confianza 0.0–1.0 sobre la evidencia enviada.
 * Criterios: cantidad de archivos, diversidad de tipos, calidad de notas.
 * Un score ≥ 0.90 autoriza el release automático de fondos.
 */
function calcularScoreIA(archivos: any[], notas: string): {
  score: number;
  breakdown: Record<string, number>;
  veredicto: string;
} {
  let score = 0;
  const breakdown: Record<string, number> = {};

  // 1. Cantidad de archivos (max 0.30)
  const cantArchivos = archivos.length;
  const scoreArchivos = Math.min(cantArchivos / 5, 1) * 0.30;
  breakdown.archivos = parseFloat(scoreArchivos.toFixed(3));
  score += scoreArchivos;

  // 2. Diversidad de tipos de archivo (max 0.25)
  const extensiones = new Set(
    archivos.map(a => {
      const parts = (a.name || '').split('.');
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'unknown';
    })
  );
  const tiposImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg'];
  const tiposVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  const tiposDoc = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'];

  let diversidad = 0;
  if ([...extensiones].some(e => tiposImagen.includes(e))) diversidad += 0.40;
  if ([...extensiones].some(e => tiposVideo.includes(e))) diversidad += 0.40;
  if ([...extensiones].some(e => tiposDoc.includes(e))) diversidad += 0.20;
  const scoreDiversidad = Math.min(diversidad, 1) * 0.25;
  breakdown.diversidad = parseFloat(scoreDiversidad.toFixed(3));
  score += scoreDiversidad;

  // 3. Calidad de notas (max 0.25)
  const palabras = notas.trim().split(/\s+/).filter(Boolean).length;
  const tieneLinks = /https?:\/\//.test(notas);
  const tieneNumeros = /\d/.test(notas);
  let scoreNotas = Math.min(palabras / 80, 1) * 0.15;
  if (tieneLinks) scoreNotas += 0.06;
  if (tieneNumeros) scoreNotas += 0.04;
  scoreNotas = Math.min(scoreNotas, 0.25);
  breakdown.notas = parseFloat(scoreNotas.toFixed(3));
  score += scoreNotas;

  // 4. Presencia de screenshots/pantallazos (max 0.20)
  const nombresConScreenshot = archivos.filter(a => {
    const nombre = (a.name || '').toLowerCase();
    return nombre.includes('screen') || nombre.includes('captura') ||
      nombre.includes('screenshot') || nombre.includes('evidencia') ||
      nombre.includes('resultado') || nombre.includes('venta') ||
      nombre.includes('sale') || nombre.includes('comprobante');
  });
  const scoreScreenshots = Math.min(nombresConScreenshot.length / 3, 1) * 0.20;
  breakdown.capturas = parseFloat(scoreScreenshots.toFixed(3));
  score += scoreScreenshots;

  const scoreFinal = parseFloat(Math.min(score, 1).toFixed(3));

  let veredicto: string;
  if (scoreFinal >= 0.90) veredicto = 'APROBADO';
  else if (scoreFinal >= 0.70) veredicto = 'REVISION_MANUAL';
  else veredicto = 'RECHAZADO';

  return { score: scoreFinal, breakdown, veredicto };
}

// Entregar evidencia + disparo automático de validación IA
app.post("/make-server-1c8a6aaa/sala/:salaId/evidencia", async (c) => {
  try {
    const salaId = c.req.param("salaId");
    const { socioId, notas, archivos } = await c.req.json();

    const sala = await kv.get(`sala:${salaId}`);
    if (!sala) return c.json({ error: 'Sala no encontrada' }, 404);
    if (sala.socioId !== socioId) return c.json({ error: 'Solo el socio puede entregar evidencia' }, 403);
    if (sala.evidenciaEntregada) return c.json({ error: 'Ya existe evidencia entregada en esta sala' }, 409);

    // Correr validación IA
    const iaResult = calcularScoreIA(archivos, notas);

    sala.evidenciaEntregada = true;
    sala.evidencia = {
      notas,
      archivos,
      fechaEntrega: new Date().toISOString(),
    };
    sala.iaScore = iaResult.score;
    sala.iaBreakdown = iaResult.breakdown;
    sala.iaVeredicto = iaResult.veredicto;
    sala.iaValidadoEn = new Date().toISOString();
    sala.estado = 'en_revision';

    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'evidencia_entregada',
      descripcion: `Evidencia entregada — ${archivos.length} archivo(s) · Notas: ${notas.length > 0 ? 'Sí' : 'No'}`,
      timestamp: new Date().toISOString(),
      autor: socioId,
    });

    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'ia_validacion',
      descripcion: `Auditor IA: Score ${(iaResult.score * 100).toFixed(1)}% — ${iaResult.veredicto}`,
      timestamp: new Date().toISOString(),
      autor: 'AUDITOR_IA',
      score: iaResult.score,
    });

    // Auto-release si score ≥ 0.90
    if (iaResult.veredicto === 'APROBADO') {
      sala.evidenciaAprobada = true;
      sala.aprobadoPor = 'AUDITOR_IA';
      sala.estado = 'completada';
      sala.fondosLiberados = true;

      const marcaWallet = await kv.get(`wallet:${sala.marcaId}`);
      const socioWallet = await kv.get(`wallet:${sala.socioId}`);
      let platformWallet = await kv.get('wallet:platform') || {
        id: 'platform', totalRecaudado: 0, totalTransacciones: 0
      };

      // Split automático: 85% Socio | 15% PARTTH
      marcaWallet.enEscrow -= sala.totalProducto;
      marcaWallet.disponible += sala.netoMarca;
      marcaWallet.totalTarifasPagadas += sala.feePARTTH;

      socioWallet.disponible += sala.gananciaSocio;
      socioWallet.totalIngresos += sala.gananciaSocio;

      // ── FONDO DE RESERVA 2% (de la comisión PARTTH) ──────────────
      const reserva2pct = parseFloat((sala.feePARTTH * 0.02).toFixed(2));
      const feeNeto = parseFloat((sala.feePARTTH * 0.98).toFixed(2));
      platformWallet.totalRecaudado += feeNeto;
      platformWallet.totalTransacciones += 1;
      let reserveWallet = await kv.get('wallet:reserve') || {
        id: 'reserve', totalReservado: 0, totalTransacciones: 0,
        descripcion: 'Fondo de Reserva PARTTH — 2% de cada comisión'
      };
      reserveWallet.totalReservado += reserva2pct;
      reserveWallet.totalTransacciones += 1;
      // ──────────────────────────────────────────────────────────────

      await kv.set(`wallet:${sala.marcaId}`, marcaWallet);
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
      await kv.set('wallet:platform', platformWallet);
      await kv.set('wallet:reserve', reserveWallet);

      sala.timeline.push({
        id: crypto.randomUUID(),
        tipo: 'fondos_liberados',
        descripcion: `Fondos liberados automáticamente · Socio: +${sala.gananciaSocio} 💎 · PARTTH: ${feeNeto} 💎 · Reserva: ${reserva2pct} 💎`,
        timestamp: new Date().toISOString(),
        autor: 'AUDITOR_IA',
      });

      // Registrar transacciones
      await kv.set(`transaction:${sala.socioId}:${crypto.randomUUID()}`, {
        id: crypto.randomUUID(), userId: sala.socioId,
        type: 'released', amount: sala.gananciaSocio,
        salaId, status: 'completed', aprobadoPor: 'AUDITOR_IA',
        timestamp: new Date().toISOString(),
      });
      await kv.set(`transaction:${sala.marcaId}:${crypto.randomUUID()}`, {
        id: crypto.randomUUID(), userId: sala.marcaId,
        type: 'escrow_released', amount: sala.netoMarca,
        fee: sala.feePARTTH, salaId, status: 'completed',
        timestamp: new Date().toISOString(),
      });
    }

    await kv.set(`sala:${salaId}`, sala);
    return c.json({
      sala,
      iaResult,
      autoAprobado: iaResult.veredicto === 'APROBADO',
    });
  } catch (error) {
    console.error(`Error entregando evidencia: ${error}`);
    return c.json({ error: 'Error entregando evidencia' }, 500);
  }
});

// Re-validar evidencia con IA (solo marca puede solicitarlo)
app.post("/make-server-1c8a6aaa/sala/:salaId/validar-ia", async (c) => {
  try {
    const salaId = c.req.param("salaId");
    const { marcaId } = await c.req.json();

    const sala = await kv.get(`sala:${salaId}`);
    if (!sala) return c.json({ error: 'Sala no encontrada' }, 404);
    if (!sala.evidenciaEntregada) return c.json({ error: 'No hay evidencia para validar' }, 400);
    if (sala.fondosLiberados) return c.json({ error: 'Los fondos ya fueron liberados' }, 409);

    const iaResult = calcularScoreIA(sala.evidencia.archivos, sala.evidencia.notas);

    sala.iaScore = iaResult.score;
    sala.iaBreakdown = iaResult.breakdown;
    sala.iaVeredicto = iaResult.veredicto;
    sala.iaValidadoEn = new Date().toISOString();

    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'ia_validacion',
      descripcion: `Re-validación IA: Score ${(iaResult.score * 100).toFixed(1)}% — ${iaResult.veredicto}`,
      timestamp: new Date().toISOString(),
      autor: 'AUDITOR_IA',
      score: iaResult.score,
    });

    if (iaResult.veredicto === 'APROBADO') {
      sala.evidenciaAprobada = true;
      sala.aprobadoPor = 'AUDITOR_IA';
      sala.estado = 'completada';
      sala.fondosLiberados = true;

      const marcaWallet = await kv.get(`wallet:${sala.marcaId}`);
      const socioWallet = await kv.get(`wallet:${sala.socioId}`);
      let platformWallet = await kv.get('wallet:platform') || {
        id: 'platform', totalRecaudado: 0, totalTransacciones: 0
      };

      marcaWallet.enEscrow -= sala.totalProducto;
      marcaWallet.disponible += sala.netoMarca;
      marcaWallet.totalTarifasPagadas += sala.feePARTTH;
      socioWallet.disponible += sala.gananciaSocio;
      socioWallet.totalIngresos += sala.gananciaSocio;
      // Fondo de Reserva 2%
      const reserva2pct_v = parseFloat((sala.feePARTTH * 0.02).toFixed(2));
      const feeNeto_v = parseFloat((sala.feePARTTH * 0.98).toFixed(2));
      platformWallet.totalRecaudado += feeNeto_v;
      platformWallet.totalTransacciones += 1;
      let reserveWallet_v = await kv.get('wallet:reserve') || {
        id: 'reserve', totalReservado: 0, totalTransacciones: 0
      };
      reserveWallet_v.totalReservado += reserva2pct_v;
      reserveWallet_v.totalTransacciones += 1;

      await kv.set(`wallet:${sala.marcaId}`, marcaWallet);
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
      await kv.set('wallet:platform', platformWallet);
      await kv.set('wallet:reserve', reserveWallet_v);

      sala.timeline.push({
        id: crypto.randomUUID(),
        tipo: 'fondos_liberados',
        descripcion: `Fondos liberados (re-validación) · Socio: +${sala.gananciaSocio} 💎 · PARTTH: ${feeNeto_v} 💎 · Reserva: ${reserva2pct_v} 💎`,
        timestamp: new Date().toISOString(),
        autor: 'AUDITOR_IA',
      });
    }

    await kv.set(`sala:${salaId}`, sala);
    return c.json({ sala, iaResult, autoAprobado: iaResult.veredicto === 'APROBADO' });
  } catch (error) {
    console.error(`Error validando con IA: ${error}`);
    return c.json({ error: 'Error en validación IA' }, 500);
  }
});

// Aprobar evidencia y liberar fondos
app.post("/make-server-1c8a6aaa/sala/:salaId/aprobar", async (c) => {
  try {
    const salaId = c.req.param("salaId");
    const { marcaId } = await c.req.json();

    const sala = await kv.get(`sala:${salaId}`);
    if (!sala) {
      return c.json({ error: 'Sala no encontrada' }, 404);
    }

    if (sala.marcaId !== marcaId) {
      return c.json({ error: 'Solo la marca puede aprobar evidencia' }, 403);
    }

    if (!sala.evidenciaEntregada) {
      return c.json({ error: 'No hay evidencia para aprobar' }, 400);
    }

    // Aprobar evidencia
    sala.evidenciaAprobada = true;
    sala.estado = 'completada';

    // Agregar al timeline
    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'evidencia_aprobada',
      descripcion: 'Evidencia aprobada - Iniciando liberación',
      timestamp: new Date().toISOString(),
      autor: marcaId,
    });

    // Determinar si aplica hold de 14 días (ventas/afiliación)
    const tipoAcuerdo = sala.tipoAcuerdo || 'servicio'; // Default: servicio (sin hold)
    const aplicaHold = tipoAcuerdo === 'venta' || tipoAcuerdo === 'afiliacion';

    if (aplicaHold) {
      // Aplicar hold de 14 días
      const fechaLiberacion = new Date();
      fechaLiberacion.setDate(fechaLiberacion.getDate() + 14);

      sala.enHold = true;
      sala.fechaLiberacion = fechaLiberacion.toISOString();

      // Mover fondos de escrow a hold en wallet del socio
      const socioWallet = await kv.get(`wallet:${sala.socioId}`);
      if (!socioWallet) {
        return c.json({ error: 'Wallet del socio no encontrado' }, 404);
      }

      socioWallet.enHold += sala.gananciaSocio;
      await kv.set(`wallet:${sala.socioId}`, socioWallet);

      // Liberar el resto a la marca
      const marcaWallet = await kv.get(`wallet:${marcaId}`);
      marcaWallet.enEscrow -= sala.totalProducto;
      marcaWallet.disponible += sala.netoMarca;
      await kv.set(`wallet:${marcaId}`, marcaWallet);

      sala.timeline.push({
        id: crypto.randomUUID(),
        tipo: 'hold_iniciado',
        descripcion: `Fondos en hold por 14 días - Liberación: ${fechaLiberacion.toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        autor: 'sistema',
      });
    } else {
      // Liberar inmediatamente (servicios)
      sala.fondosLiberados = true;
      sala.aprobadoPor = sala.aprobadoPor || marcaId;

      // Mover fondos
      const marcaWallet = await kv.get(`wallet:${marcaId}`);
      const socioWallet = await kv.get(`wallet:${sala.socioId}`);
      let platformWallet = await kv.get('wallet:platform') || {
        id: 'platform', totalRecaudado: 0, totalTransacciones: 0
      };

      marcaWallet.enEscrow -= sala.totalProducto;
      marcaWallet.disponible += sala.netoMarca;
      marcaWallet.totalTarifasPagadas += sala.feePARTTH;

      socioWallet.disponible += sala.gananciaSocio;
      socioWallet.totalIngresos += sala.gananciaSocio;

      // Fee 15% → PARTTH: 98% platform + 2% Fondo de Reserva
      const reserva2pct_m = parseFloat((sala.feePARTTH * 0.02).toFixed(2));
      const feeNeto_m = parseFloat((sala.feePARTTH * 0.98).toFixed(2));
      platformWallet.totalRecaudado += feeNeto_m;
      platformWallet.totalTransacciones += 1;
      let reserveWallet_m = await kv.get('wallet:reserve') || {
        id: 'reserve', totalReservado: 0, totalTransacciones: 0
      };
      reserveWallet_m.totalReservado += reserva2pct_m;
      reserveWallet_m.totalTransacciones += 1;

      await kv.set(`wallet:${marcaId}`, marcaWallet);
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
      await kv.set('wallet:platform', platformWallet);
      await kv.set('wallet:reserve', reserveWallet_m);

      // Registrar transacciones
      const socioTransaction = {
        id: crypto.randomUUID(),
        userId: sala.socioId,
        type: 'released',
        amount: sala.gananciaSocio,
        salaId: sala.id,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
      await kv.set(`transaction:${sala.socioId}:${socioTransaction.id}`, socioTransaction);

      sala.timeline.push({
        id: crypto.randomUUID(),
        tipo: 'fondos_liberados',
        descripcion: `Fondos liberados - ${sala.gananciaSocio} 💎 al socio`,
        timestamp: new Date().toISOString(),
        autor: 'sistema',
      });
    }

    await kv.set(`sala:${salaId}`, sala);

    return c.json(sala);
  } catch (error) {
    console.error(`Error aprobando evidencia: ${error}`);
    return c.json({ error: 'Error aprobando evidencia' }, 500);
  }
});

// Abrir disputa
app.post("/make-server-1c8a6aaa/sala/:salaId/disputa", async (c) => {
  try {
    const salaId = c.req.param("salaId");
    const { userId, razon, descripcion } = await c.req.json();

    const sala = await kv.get(`sala:${salaId}`);
    if (!sala) {
      return c.json({ error: 'Sala no encontrada' }, 404);
    }

    if (sala.marcaId !== userId && sala.socioId !== userId) {
      return c.json({ error: 'Usuario no autorizado' }, 403);
    }

    // Crear disputa
    sala.tieneDisputa = true;
    sala.estado = 'en_disputa';
    sala.disputa = {
      razon,
      descripcion,
      abridaPor: userId,
      fechaApertura: new Date().toISOString(),
      estado: 'abierta',
    };

    // Si hay hold activo, extenderlo
    if (sala.enHold) {
      sala.holdExtendido = true;
    }

    // Mover fondos a estado "en disputa" en wallets
    const marcaWallet = await kv.get(`wallet:${sala.marcaId}`);
    const socioWallet = await kv.get(`wallet:${sala.socioId}`);

    if (marcaWallet.enEscrow >= sala.totalProducto) {
      marcaWallet.enEscrow -= sala.totalProducto;
      marcaWallet.enDisputa += sala.totalProducto;
      await kv.set(`wallet:${sala.marcaId}`, marcaWallet);
    }

    if (socioWallet.enHold >= sala.gananciaSocio) {
      socioWallet.enHold -= sala.gananciaSocio;
      socioWallet.enDisputa += sala.gananciaSocio;
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
    }

    // Agregar al timeline
    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'disputa_abierta',
      descripcion: `Disputa abierta: ${razon}`,
      timestamp: new Date().toISOString(),
      autor: userId,
    });

    await kv.set(`sala:${salaId}`, sala);

    return c.json(sala);
  } catch (error) {
    console.error(`Error abriendo disputa: ${error}`);
    return c.json({ error: 'Error abriendo disputa' }, 500);
  }
});

// ========================================
// STRIPE WEBHOOKS
// ========================================

app.post("/make-server-1c8a6aaa/webhooks/stripe", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'Falta signature de Stripe' }, 400);
    }

    const event = await stripe.handleStripeWebhook(body, signature);

    // Manejar eventos de Stripe
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;
        const amount = paymentIntent.amount / 100; // Convertir de centavos

        // Agregar diamantes al wallet
        const wallet = await kv.get(`wallet:${userId}`);
        if (wallet) {
          wallet.disponible += amount;
          await kv.set(`wallet:${userId}`, wallet);

          // Registrar transacción
          const transaction = {
            id: crypto.randomUUID(),
            userId,
            type: 'deposit',
            amount,
            status: 'completed',
            paymentIntentId: paymentIntent.id,
            timestamp: new Date().toISOString(),
          };
          await kv.set(`transaction:${userId}:${transaction.id}`, transaction);
        }
        break;

      case 'payout.paid':
        // Actualizar estado de retiro
        const payout = event.data.object;
        const transactions = await kv.getByPrefix('transaction:');
        const payoutTransaction = transactions.find((tx: any) => tx.payoutId === payout.id);

        if (payoutTransaction) {
          payoutTransaction.status = 'completed';
          await kv.set(`transaction:${payoutTransaction.userId}:${payoutTransaction.id}`, payoutTransaction);
        }
        break;
    }

    return c.json({ received: true });
  } catch (error) {
    console.error(`Error procesando webhook de Stripe: ${error}`);
    return c.json({ error: 'Error procesando webhook' }, 500);
  }
});

// ========================================
// N8N WEBHOOKS
// ========================================

app.post("/make-server-1c8a6aaa/webhooks/abacus-chat", webhooks.abacusChat);
app.post("/make-server-1c8a6aaa/webhooks/send-notification", webhooks.sendNotification);
app.post("/make-server-1c8a6aaa/webhooks/validate-evidence", webhooks.validateEvidence);
app.post("/make-server-1c8a6aaa/webhooks/mediate-dispute", webhooks.mediateDispute);
app.post("/make-server-1c8a6aaa/webhooks/trigger-onboarding", webhooks.triggerOnboarding);
app.get("/make-server-1c8a6aaa/webhooks/chat-history", webhooks.getChatHistory);

// ========================================
// NOTIFICATIONS ENDPOINTS
// ========================================

app.get("/make-server-1c8a6aaa/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notifications = await kv.get(`notifications:${userId}`) || [];
    return c.json(notifications);
  } catch (error) {
    console.error(`Error obteniendo notificaciones: ${error}`);
    return c.json({ error: 'Error obteniendo notificaciones' }, 500);
  }
});

app.post("/make-server-1c8a6aaa/notifications/:notificationId/read", async (c) => {
  try {
    const notificationId = c.req.param("notificationId");
    const { userId } = await c.req.json();

    const notifications = await kv.get(`notifications:${userId}`) || [];
    const notification = notifications.find((n: any) => n.id === notificationId);

    if (notification) {
      notification.read = true;
      await kv.set(`notifications:${userId}`, notifications);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error(`Error marcando notificación como leída: ${error}`);
    return c.json({ error: 'Error actualizando notificación' }, 500);
  }
});

// ========================================
// MARKETPLACE ENDPOINTS
// ========================================

app.post("/make-server-1c8a6aaa/ofertas", marketplace.crearOferta);
app.get("/make-server-1c8a6aaa/ofertas", marketplace.obtenerOfertas);
app.get("/make-server-1c8a6aaa/oferta/:ofertaId", marketplace.obtenerOferta);

app.post("/make-server-1c8a6aaa/ofertas/:ofertaId/aplicar", marketplace.aplicarAOferta);
app.get("/make-server-1c8a6aaa/ofertas-aplicaciones/:marcaId", marketplace.obtenerAplicacionesMarca);
app.get("/make-server-1c8a6aaa/mis-aplicaciones/:socioId", marketplace.obtenerMisAplicaciones);
app.post("/make-server-1c8a6aaa/aplicaciones/:aplicacionId/aceptar", marketplace.aceptarAplicacion);
app.post("/make-server-1c8a6aaa/aplicaciones/:aplicacionId/rechazar", marketplace.rechazarAplicacion);

// ========================================
// PERFIL PÚBLICO ENDPOINTS
// ========================================

app.get("/make-server-1c8a6aaa/user/:userId", marketplace.obtenerPerfilPublico);

// ========================================
// REVIEWS ENDPOINTS
// ========================================

app.post("/make-server-1c8a6aaa/reviews", marketplace.crearReview);
app.get("/make-server-1c8a6aaa/reviews/:userId", marketplace.obtenerReviews);
app.get("/make-server-1c8a6aaa/pending-reviews/:userId", marketplace.obtenerSalasPendientesReview);

// ========================================
// LOYALTY & TIERS ENDPOINTS
// ========================================

// Early Release - Paga 3% extra, recibe fondos instantáneo
app.post("/make-server-1c8a6aaa/sala/:salaId/early-release", loyalty.requestEarlyRelease);

// Obtener beneficios de loyalty del usuario
app.get("/make-server-1c8a6aaa/loyalty/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const benefits = await loyalty.calculateLoyaltyBenefits(userId);
    return c.json(benefits);
  } catch (error) {
    console.error(`Error obteniendo loyalty: ${error}`);
    return c.json({ error: 'Error obteniendo beneficios' }, 500);
  }
});

// Progreso al siguiente tier
app.get("/make-server-1c8a6aaa/loyalty/:userId/progress", async (c) => {
  try {
    const userId = c.req.param("userId");
    const progress = await loyalty.getProgressToNextTier(userId);
    return c.json(progress);
  } catch (error) {
    console.error(`Error obteniendo progreso: ${error}`);
    return c.json({ error: 'Error obteniendo progreso' }, 500);
  }
});

// ========================================
// DISPUTES AUTO-RESOLUTION ENDPOINTS
// ========================================

// Auto-resolver disputa
app.post("/make-server-1c8a6aaa/disputes/auto-resolve", disputes.autoResolveDispute);

// Obtener criterios de decisión
app.get("/make-server-1c8a6aaa/disputes/criteria", (c) => {
  return c.json(disputes.DISPUTE_CRITERIA);
});

// ========================================
// REFERRALS ENDPOINTS
// ========================================

// Crear código de referido
app.post("/make-server-1c8a6aaa/referrals/create", referrals.createReferralCode);

// Leaderboard de referidos (must be before /:userId to avoid matching "leaderboard" as userId)
app.get("/make-server-1c8a6aaa/referrals/leaderboard", async (c) => {
  try {
    const leaderboard = await referrals.getReferralLeaderboard();
    return c.json(leaderboard);
  } catch (error) {
    console.error(`Error obteniendo leaderboard: ${error}`);
    return c.json({ error: 'Error obteniendo leaderboard' }, 500);
  }
});

// Obtener información de referidos del usuario
app.get("/make-server-1c8a6aaa/referrals/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`);

    if (!user || !user.referralCode) {
      return c.json({ referralCode: null });
    }

    const referralData = await kv.get(`referral:${user.referralCode}`);
    return c.json(referralData);
  } catch (error) {
    console.error(`Error obteniendo referidos: ${error}`);
    return c.json({ error: 'Error obteniendo referidos' }, 500);
  }
});

// Obtener tier de embajador
app.get("/make-server-1c8a6aaa/referrals/:userId/tier", async (c) => {
  try {
    const userId = c.req.param("userId");
    const tier = await referrals.checkAmbassadorTier(userId);
    return c.json(tier);
  } catch (error) {
    console.error(`Error obteniendo tier: ${error}`);
    return c.json({ error: 'Error obteniendo tier' }, 500);
  }
});

// ========================================
// AGENTE IA — ABACUS CORE v1
// Genera Scripts de Venta Viral + Checklist de Evidencia
// ========================================

/**
 * Motor de generación de scripts basado en categoría de producto,
 * audiencia objetivo y propuesta de valor única.
 * Simula el Agente "Cerrador de Ventas" de Abacus.
 */
function generarScriptViral(params: {
  productoNombre: string;
  productoDescripcion: string;
  precioProducto: number;
  audienciaObjetivo: string;
  categoriaProducto: string;
  uspList: string[];
  comisionSocio: number;
  marcaNombre: string;
}) {
  const { productoNombre, productoDescripcion, precioProducto, audienciaObjetivo,
    categoriaProducto, uspList, comisionSocio, marcaNombre } = params;

  const gananciaEjemplo = Math.floor(precioProducto * (comisionSocio / 100));
  const usp1 = uspList[0] || 'resultados comprobados';
  const usp2 = uspList[1] || 'soporte dedicado';
  const usp3 = uspList[2] || 'acceso inmediato';

  // ── Hooks por categoría ─────────────────────────────────────────────────
  const hooks: Record<string, string[]> = {
    ecommerce: [
      `¿Buscas ${productoNombre} y no sabes dónde encontrar la mejor opción? Te cuento todo 👇`,
      `Este producto cambió cómo ${audienciaObjetivo} manejan su dinero 💰`,
      `Lo que ${audienciaObjetivo} no saben sobre ${productoNombre} (y deberían) 🔥`,
    ],
    saas: [
      `¿Cuántas horas pierdes haciendo lo que ${productoNombre} automatiza en minutos? ⚡`,
      `Herramienta secreta que está usando ${audienciaObjetivo} para escalar sin contratar 🚀`,
      `${precioProducto <= 50 ? 'Menos de $50/mes' : `$${precioProducto}/mes`} para lo que antes costaba un empleado. Explico 👇`,
    ],
    servicio: [
      `Si eres ${audienciaObjetivo} y aún no conoces ${productoNombre}, esto te va a interesar 🎯`,
      `Cómo ${audienciaObjetivo} están multiplicando resultados sin trabajar el doble 📈`,
      `${marcaNombre} hace algo que pocos ofrecen: ${usp1}. Así es como funciona 👇`,
    ],
    digital: [
      `Descargué ${productoNombre} y lo que pasó me dejó sin palabras 🤯`,
      `El recurso digital que todo ${audienciaObjetivo} necesita y muy pocos conocen 📱`,
      `Inversión de $${precioProducto} que puede darte 10x de retorno si sabes usarla 💎`,
    ],
    default: [
      `Llevo semanas usando ${productoNombre} y tengo que hablar de esto 🔥`,
      `Para ${audienciaObjetivo}: esto es lo que cambió todo para mí 👇`,
      `No puedo creer que no conocía ${productoNombre} antes. Thread completo 🧵`,
    ],
  };

  const cat = hooks[categoriaProducto] ? categoriaProducto : 'default';
  const hookList = hooks[cat];
  const hookPrincipal = hookList[0];
  const hookAlternativo1 = hookList[1];
  const hookAlternativo2 = hookList[2];

  // ── Secciones del script ────────────────────────────────────────────────
  const problema = `${audienciaObjetivo} enfrentan un problema real: [PROBLEMA ESPECÍFICO QUE RESUELVE ${productoNombre.toUpperCase()}]. La mayoría intenta solucionarlo con métodos que no funcionan o son demasiado caros. Resultado: frustración, tiempo perdido y dinero tirado.`;

  const solucion = `${marcaNombre} creó ${productoNombre} específicamente para esto. ¿Qué lo hace diferente?\n\n✅ ${usp1}\n✅ ${usp2}\n✅ ${usp3}\n\nNo es teoría — es ${productoDescripcion.slice(0, 120)}...`;

  const pruebaSocial = `Resultados reales de usuarios como tú:\n\n📊 [MÉTRICA 1 — ej: "Aumentaron sus ventas X% en 30 días"]\n📊 [MÉTRICA 2 — ej: "Ahorraron X horas por semana"]\n📊 [MÉTRICA 3 — ej: "ROI de X% en el primer mes"]\n\n⚠️ IMPORTANTE: Documenta estos resultados con screenshots y datos reales. El Auditor IA los verificará.`;

  const cta = `👉 Accede ahora: [TU LINK DE AFILIADO]\n\nPrecio: $${precioProducto} USD — ${categoriaProducto === 'saas' ? 'por mes' : 'pago único'}\nGarantía: [X días de devolución]\n\nO escríbeme directo y te explico cómo empezar hoy mismo.`;

  const objeciones = `❓ "¿Es legítimo?" → Sí. Operamos bajo PARTTH — plataforma con escrow verificado. Tu dinero está protegido.\n\n❓ "¿Y si no funciona para mí?" → [POLÍTICA DE GARANTÍA]. Sin riesgo.\n\n❓ "¿Por qué tú?" → Porque tuve el mismo problema. Te muestro mis resultados reales antes de que decidas.\n\n❓ "¿Es el momento correcto?" → Cada semana que esperas es [CUANTIFICACIÓN DE PÉRDIDA].`;

  const hashtags = generarHashtags(categoriaProducto, audienciaObjetivo, productoNombre);

  const guionCompleto = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 SCRIPT VIRAL — ABACUS CORE v1
Generado por PARTTH para: ${marcaNombre}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎣 HOOK PRINCIPAL (usa en el primer segundo):
"${hookPrincipal}"

🔄 HOOK ALTERNATIVO A:
"${hookAlternativo1}"

🔄 HOOK ALTERNATIVO B:
"${hookAlternativo2}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 PROBLEMA (5–10 segundos):
${problema}

💡 SOLUCIÓN (15–20 segundos):
${solucion}

📊 PRUEBA SOCIAL (10–15 segundos):
${pruebaSocial}

📣 LLAMADA A LA ACCIÓN:
${cta}

🛡️ MANEJO DE OBJECIONES:
${objeciones}

#️⃣ HASHTAGS SUGERIDOS:
${hashtags}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 Tu comisión al cerrar: $${gananciaEjemplo} USD (${comisionSocio}%)
Fee PARTTH 15%: $${Math.floor(precioProducto * 0.15)} USD — bloqueado hasta validación IA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return {
    hookPrincipal,
    hookAlternativo1,
    hookAlternativo2,
    problema,
    solucion,
    pruebaSocial,
    cta,
    objeciones,
    hashtags,
    guionCompleto,
    stats: {
      gananciaEjemplo,
      feePARTTH: Math.floor(precioProducto * 0.15),
      precioProducto,
      comisionSocio,
    },
  };
}

function generarHashtags(categoria: string, audiencia: string, producto: string): string {
  const base: Record<string, string[]> = {
    ecommerce: ['#ecommerce', '#tiendaonline', '#compraonline', '#oferta', '#descuento'],
    saas: ['#saas', '#startup', '#tecnologia', '#automatizacion', '#productividad'],
    servicio: ['#servicio', '#emprendimiento', '#negocio', '#freelance', '#trabajo'],
    digital: ['#cursos', '#aprendizaje', '#digital', '#online', '#educacion'],
    default: ['#ingresos', '#negocios', '#emprender', '#dinero', '#exito'],
  };
  const cat = base[categoria] || base.default;
  const extras = [`#${audiencia.toLowerCase().replace(/\s+/g, '')}`, `#${producto.toLowerCase().replace(/\s+/g, '').slice(0, 15)}`, '#partth', '#confianza', '#pagoseguros'];
  return [...cat.slice(0, 4), ...extras].join(' ');
}

/**
 * Genera el checklist de evidencia optimizado para score IA ≥ 90%.
 * Los ítems están diseñados para maximizar los 4 criterios del Auditor:
 * archivos (0.30) + diversidad (0.25) + notas (0.25) + capturas (0.20)
 */
function generarChecklistEvidencia(categoria: string, productoNombre: string) {
  const base = [
    {
      id: 1, prioridad: 'CRÍTICO', puntos: 0.12,
      descripcion: 'Screenshot del dashboard de ventas / analytics mostrando conversiones',
      nombre_archivo_sugerido: 'screenshot-ventas-dashboard.png',
      criterio: 'capturas',
      tip: 'Asegúrate de que el nombre del archivo incluya "screenshot" para el bonus IA',
    },
    {
      id: 2, prioridad: 'CRÍTICO', puntos: 0.12,
      descripcion: 'Captura del comprobante de pago / confirmación de venta',
      nombre_archivo_sugerido: 'comprobante-pago-venta.png',
      criterio: 'capturas',
      tip: 'Incluye la fecha y el monto visible. Cubre datos sensibles del cliente.',
    },
    {
      id: 3, prioridad: 'ALTO', puntos: 0.10,
      descripcion: 'Screenshot de métricas de alcance (impresiones, clicks, conversiones)',
      nombre_archivo_sugerido: 'screenshot-metricas-alcance.png',
      criterio: 'capturas',
      tip: 'Exporta desde Meta Ads, Google Analytics o la plataforma que uses',
    },
    {
      id: 4, prioridad: 'ALTO', puntos: 0.08,
      descripcion: 'Video de pantalla (screen recording) mostrando el proceso de venta',
      nombre_archivo_sugerido: 'evidencia-screenrecording.mp4',
      criterio: 'diversidad',
      tip: 'Un video vale mucho en el score IA (+0.40 en diversidad). 30–120 segundos es suficiente.',
    },
    {
      id: 5, prioridad: 'ALTO', puntos: 0.08,
      descripcion: 'PDF o documento con reporte de resultados detallado',
      nombre_archivo_sugerido: 'reporte-resultados.pdf',
      criterio: 'diversidad',
      tip: 'Incluye: periodo, métricas clave, comparativa. Un PDF suma +0.20 en diversidad.',
    },
    {
      id: 6, prioridad: 'MEDIO', puntos: 0.06,
      descripcion: 'Screenshot de conversación con cliente / testimonio de compra',
      nombre_archivo_sugerido: 'screenshot-testimonio-cliente.png',
      criterio: 'capturas',
      tip: 'Anonimiza el nombre si es necesario. La evidencia de satisfacción es poderosa.',
    },
    {
      id: 7, prioridad: 'MEDIO', puntos: 0.06,
      descripcion: 'Captura del link de afiliado con estadísticas de clics',
      nombre_archivo_sugerido: 'screenshot-link-afiliado-stats.png',
      criterio: 'archivos',
      tip: 'Cualquier plataforma de tracking sirve: Bitly, Tapfiliate, FirstPromoter, etc.',
    },
    {
      id: 8, prioridad: 'MEDIO', puntos: 0.05,
      descripcion: 'Screenshot de publicación en redes sociales con engagement',
      nombre_archivo_sugerido: 'screenshot-publicacion-redes.png',
      criterio: 'archivos',
      tip: 'Muestra likes, comentarios, shares. Evidencia de actividad real.',
    },
  ];

  // Items extra por categoría
  const extras: Record<string, any> = {
    ecommerce: {
      id: 9, prioridad: 'ALTO', puntos: 0.08,
      descripcion: 'Screenshot del carrito / checkout completado en la tienda',
      nombre_archivo_sugerido: 'screenshot-resultado-checkout.png',
      criterio: 'capturas',
      tip: 'Muestra el estado "Pedido confirmado" o similar.',
    },
    saas: {
      id: 9, prioridad: 'ALTO', puntos: 0.08,
      descripcion: 'Screenshot de la cuenta del cliente activa en la plataforma SaaS',
      nombre_archivo_sugerido: 'screenshot-cuenta-activa.png',
      criterio: 'capturas',
      tip: 'Muestra el panel del usuario con su suscripción activa.',
    },
    default: {
      id: 9, prioridad: 'MEDIO', puntos: 0.05,
      descripcion: 'Screenshot de cualquier resultado medible adicional',
      nombre_archivo_sugerido: 'screenshot-resultado-adicional.png',
      criterio: 'archivos',
      tip: 'Cualquier métrica extra suma. Diversifica los formatos.',
    },
  };

  const checklistFinal = [...base, extras[categoria] || extras.default];

  const notasMinimo = `Para score ≥ 90%, tus notas deben tener:\n• Mínimo 80 palabras (descripción detallada del proceso)\n• Al menos 1 enlace URL de referencia (https://...)\n• Incluir números y métricas específicas (ej: "cerré 3 ventas por $${productoNombre.slice(0, 5)} cada una")\n• Fecha, canal usado y resultado obtenido`;

  return {
    checklist: checklistFinal,
    resumen: {
      totalItems: checklistFinal.length,
      puntosMaximos: checklistFinal.reduce((s, i) => s + (i.puntos || 0), 0).toFixed(2),
      itemsCriticos: checklistFinal.filter(i => i.prioridad === 'CRÍTICO').length,
      formatosNecesarios: ['PNG/JPG (screenshots)', 'MP4/MOV (video)', 'PDF (reporte)'],
    },
    notasMinimo,
    scoreEstimado: 0.91,
  };
}

// ── Endpoint principal del Agente IA ────────────────────────────────────────
app.post("/make-server-1c8a6aaa/agente/generar-script", async (c) => {
  try {
    const {
      marcaId, productoNombre, productoDescripcion, precioProducto,
      audienciaObjetivo, categoriaProducto, uspList = [],
      comisionSocio = 30, marcaNombre = 'Marca PARTTH',
    } = await c.req.json();

    if (!productoNombre || !precioProducto) {
      return c.json({ error: 'productoNombre y precioProducto son requeridos' }, 400);
    }

    const script = generarScriptViral({
      productoNombre, productoDescripcion: productoDescripcion || '',
      precioProducto: Number(precioProducto),
      audienciaObjetivo: audienciaObjetivo || 'emprendedores',
      categoriaProducto: categoriaProducto || 'default',
      uspList, comisionSocio: Number(comisionSocio), marcaNombre,
    });

    const checklist = generarChecklistEvidencia(
      categoriaProducto || 'default',
      productoNombre,
    );

    // Guardar en KV para historial si se proporciona marcaId
    if (marcaId) {
      const scriptId = crypto.randomUUID();
      await kv.set(`agente_script:${marcaId}:${scriptId}`, {
        id: scriptId,
        marcaId,
        productoNombre,
        precioProducto,
        categoriaProducto,
        generadoEn: new Date().toISOString(),
        script: script.guionCompleto.slice(0, 500), // preview
      });
    }

    // Disparar webhook n8n para distribuir en redes
    if (marcaId) {
      await n8n.triggerScriptGenerado({
        socioId: marcaId,
        productoNombre,
        categoriaProducto: categoriaProducto || 'default',
        guionCompleto: script.guionCompleto,
        hookPrincipal: script.hookPrincipal,
        hashtags: script.hashtags,
        precioProducto: Number(precioProducto),
        gananciaEjemplo: script.stats.gananciaEjemplo,
      });
    }

    return c.json({
      ok: true,
      generadoEn: new Date().toISOString(),
      script,
      checklist,
      meta: {
        motor: 'ABACUS_CORE_v1',
        version: '1.0.0',
        nota: 'Script generado con IA de plantillas dinámicas. Personaliza los placeholders [EN MAYÚSCULAS] con datos reales antes de publicar.',
      },
    });
  } catch (error) {
    console.error(`Error en Agente IA: ${error}`);
    return c.json({ error: 'Error generando script' }, 500);
  }
});

// ── Historial de scripts generados ──────────────────────────────────────────
app.get("/make-server-1c8a6aaa/agente/historial/:marcaId", async (c) => {
  try {
    const marcaId = c.req.param("marcaId");
    const scripts = await kv.list(`agente_script:${marcaId}:`);
    return c.json({ scripts: scripts || [] });
  } catch (error) {
    return c.json({ scripts: [] });
  }
});

// ========================================
// n8n GROWTH ENGINE — Webhooks + Marketing
// ========================================

// Configurar URL de n8n (pega tu URL aquí y el sistema viraliza solo)
app.post("/make-server-1c8a6aaa/admin/n8n/config", async (c) => {
  try {
    const { url } = await c.req.json();
    if (!url) return c.json({ error: 'url requerida' }, 400);
    const result = await n8n.configurarN8nUrl(url);
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Error configurando n8n' }, 500);
  }
});

// Recibir datos de engagement desde n8n (clics, interacciones → reputación)
app.post("/make-server-1c8a6aaa/webhooks/engagement", async (c) => {
  try {
    const data = await c.req.json();
    const result = await n8n.procesarEngagementData(data);
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Error procesando engagement' }, 500);
  }
});

// Obtener métricas de engagement de un socio
app.get("/make-server-1c8a6aaa/engagement/:socioId", async (c) => {
  try {
    const socioId = c.req.param("socioId");
    const engagement = await kv.get(`engagement:${socioId}`) || {
      socioId, totalClics: 0, totalImpresiones: 0, totalConversiones: 0, historico: []
    };
    return c.json(engagement);
  } catch (error) {
    return c.json({ error: 'Error obteniendo engagement' }, 500);
  }
});

// Procesar cola de webhooks pendientes (para cuando se configure n8n después)
app.post("/make-server-1c8a6aaa/admin/n8n/flush-queue", async (c) => {
  try {
    const result = await n8n.procesarColaPendiente();
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Error procesando cola' }, 500);
  }
});

// ========================================
// ADMIN — Sembrar Marketplace + Fondo
// ========================================

// Sembrar las 3 misiones de alto valor en el Marketplace
app.post("/make-server-1c8a6aaa/admin/seed-marketplace", async (c) => {
  try {
    const MISIONES_SEED = [
      {
        titulo: 'Estrategia de Lanzamiento Viral',
        descripcion: 'Plan completo de lanzamiento digital en redes sociales. Incluye estrategia de contenido, 5 videos generados con IA, calendario editorial de 30 días y scripts optimizados para conversión.',
        categoria: 'Marketing',
        presupuesto: 2500,
        comisionSocio: 30,
        duracion: '7 días',
        marcaNombre: 'PARTTH Official',
        requisitos: [
          'Plan de Social Media (30 días)',
          '5 Videos de IA entregados',
          'Screenshot de métricas de alcance',
          'Reporte de resultados en PDF',
          'Video de proceso (screen recording)',
        ],
        nivel: 'ALTO_VALOR',
        badge: 'VERIFICADO',
      },
      {
        titulo: 'Automatización de Ventas con Abacus',
        descripcion: 'Configuración completa del sistema de bots de ventas, 50 leads cualificados y validados, pipeline automatizado con CRM integrado y reportes de conversión en tiempo real.',
        categoria: 'Ventas',
        presupuesto: 5000,
        comisionSocio: 25,
        duracion: '14 días',
        marcaNombre: 'PARTTH Official',
        requisitos: [
          'Bots configurados y activos (screenshot)',
          '50 leads validados (exportar CSV)',
          'Pipeline automatizado documentado',
          'Video demo del sistema funcionando',
          'Reporte de conversiones PDF',
        ],
        nivel: 'PREMIUM',
        badge: 'HIGH_TICKET',
      },
      {
        titulo: 'Campaña de Afiliación High-Ticket',
        descripcion: 'Embudo de ventas completo para productos de alto valor. 10 cierres confirmados y verificables, scripts de cierre personalizados y sistema de seguimiento con evidencia de cada transacción.',
        categoria: 'Ventas',
        presupuesto: 10000,
        comisionSocio: 20,
        duracion: '30 días',
        marcaNombre: 'PARTTH Official',
        requisitos: [
          'Embudo de ventas documentado (screenshots)',
          '10 comprobantes de cierre (PDF/imagen)',
          'Video de proceso de venta',
          'Capturas de cada transacción',
          'Reporte final de resultados',
        ],
        nivel: 'ELITE',
        badge: 'ELITE_MISSION',
      },
    ];

    const marcaId = 'partth-official';
    const creadas = [];

    for (const m of MISIONES_SEED) {
      const id = `oferta-${m.titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
      const oferta = {
        id,
        marcaId,
        ...m,
        estado: 'abierta',
        aplicaciones: 0,
        createdAt: new Date().toISOString(),
        feePARTTH: m.presupuesto * 0.15,
        fondoReserva: m.presupuesto * 0.02,
        gananciaSocio: m.presupuesto * (m.comisionSocio / 100),
      };
      await kv.set(`oferta:${id}`, oferta);

      // Disparar webhook de marketing para n8n
      await n8n.triggerNuevaMisionMarketing({
        id, titulo: m.titulo, descripcion: m.descripcion,
        presupuesto: m.presupuesto, comisionSocio: m.comisionSocio,
        categoria: m.categoria, marcaNombre: m.marcaNombre,
      });

      // Broadcast directo a redes sociales (sin n8n)
      const copy = social.buildMisionCopy({ titulo: m.titulo, presupuesto: m.presupuesto, comision: m.comisionSocio, marcaNombre: m.marcaNombre });
      social.broadcastPost({ instagram: { caption: copy.instagram }, twitter: copy.twitter, linkedin: copy.linkedin }).catch(console.error);

      creadas.push({ id, titulo: m.titulo, presupuesto: m.presupuesto });
    }

    return c.json({ ok: true, creadas, mensaje: `${creadas.length} misiones sembradas en el Marketplace` });
  } catch (error) {
    console.error(`Error en seed-marketplace: ${error}`);
    return c.json({ error: 'Error sembrando marketplace' }, 500);
  }
});

// ── Fondo de Reserva — status ────────────────────────────────────────────────
app.get("/make-server-1c8a6aaa/admin/fondo-reserva", async (c) => {
  try {
    const [platform, reserve] = await Promise.all([
      kv.get('wallet:platform'),
      kv.get('wallet:reserve'),
    ]);
    return c.json({
      platform: platform || { totalRecaudado: 0, totalTransacciones: 0 },
      reserve: reserve || { totalReservado: 0, totalTransacciones: 0 },
      porcentajeReserva: '2% de cada comisión PARTTH (15%)',
      fondoBlindado: true,
    });
  } catch (error) {
    return c.json({ error: 'Error obteniendo fondo' }, 500);
  }
});

// ========================================
// SOCIAL MEDIA — Instagram + X + LinkedIn
// ========================================

// POST /social/broadcast — Publica en todas las redes configuradas
app.post("/make-server-1c8a6aaa/social/broadcast", async (c) => {
  try {
    const body = await c.req.json();
    const { tipo, misionId, titulo, presupuesto, comision, ganancia, scoreIA, productoNombre } = body;

    let copy: { instagram: string; twitter: string; linkedin: string };

    if (tipo === 'NUEVA_MISION') {
      copy = social.buildMisionCopy({ titulo, presupuesto, comision: comision || 85 });
    } else if (tipo === 'DEAL_COMPLETADO') {
      copy = social.buildDealCopy({ productoNombre: productoNombre || titulo, ganancia, scoreIA });
    } else {
      return c.json({ error: 'tipo debe ser NUEVA_MISION o DEAL_COMPLETADO' }, 400);
    }

    const results = await social.broadcastPost({
      instagram: { caption: copy.instagram },
      twitter: copy.twitter,
      linkedin: copy.linkedin,
    });

    const exitosos = results.filter(r => r.ok).length;
    return c.json({ ok: true, resultados: results, exitosos, total: results.length });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// POST /social/instagram — Publicar solo en Instagram
app.post("/make-server-1c8a6aaa/social/instagram", async (c) => {
  try {
    const { caption, imageUrl } = await c.req.json();
    if (!caption) return c.json({ error: 'caption requerido' }, 400);
    const result = await social.postInstagram({ caption, imageUrl });
    return c.json(result);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// POST /social/twitter — Publicar solo en X
app.post("/make-server-1c8a6aaa/social/twitter", async (c) => {
  try {
    const { text } = await c.req.json();
    if (!text) return c.json({ error: 'text requerido' }, 400);
    const result = await social.postTwitter(text);
    return c.json(result);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// POST /social/linkedin — Publicar solo en LinkedIn
app.post("/make-server-1c8a6aaa/social/linkedin", async (c) => {
  try {
    const { text } = await c.req.json();
    if (!text) return c.json({ error: 'text requerido' }, 400);
    const result = await social.postLinkedIn(text);
    return c.json(result);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// GET /social/status — Ver qué plataformas están configuradas
app.get("/make-server-1c8a6aaa/social/status", (c) => {
  return c.json({
    instagram: {
      configurado: !!(Deno.env.get('INSTAGRAM_ACCESS_TOKEN') && Deno.env.get('INSTAGRAM_BUSINESS_ACCOUNT_ID')),
      vars: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_BUSINESS_ACCOUNT_ID'],
    },
    twitter: {
      configurado: !!(Deno.env.get('TWITTER_API_KEY') && Deno.env.get('TWITTER_ACCESS_TOKEN')),
      vars: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'],
    },
    linkedin: {
      configurado: !!(Deno.env.get('LINKEDIN_ACCESS_TOKEN') && Deno.env.get('LINKEDIN_PERSON_URN')),
      vars: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_URN'],
    },
    instrucciones: 'Agrega las vars en Supabase Dashboard → Edge Functions → make-server-1c8a6aaa → Secrets',
  });
});

// ── POST /social/config — Guardar tokens de redes sociales ───────────────────
app.post("/make-server-1c8a6aaa/admin/social/config", async (c) => {
  try {
    const body = await c.req.json();
    // Guardar en KV (no en vars de entorno, que son inmutables en runtime)
    await kv.set('config:social', {
      ...body,
      actualizadoEn: new Date().toISOString(),
    });
    return c.json({ ok: true, mensaje: 'Configuración social guardada. Nota: para producción real, agrega las vars en Supabase Secrets.' });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);