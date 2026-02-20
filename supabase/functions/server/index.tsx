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
  const tiposImagen = ['jpg','jpeg','png','gif','webp','heic','svg'];
  const tiposVideo = ['mp4','mov','avi','webm','mkv'];
  const tiposDoc = ['pdf','doc','docx','xls','xlsx','csv','txt'];

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

      platformWallet.totalRecaudado += sala.feePARTTH;
      platformWallet.totalTransacciones += 1;

      await kv.set(`wallet:${sala.marcaId}`, marcaWallet);
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
      await kv.set('wallet:platform', platformWallet);

      sala.timeline.push({
        id: crypto.randomUUID(),
        tipo: 'fondos_liberados',
        descripcion: `Fondos liberados automáticamente · Socio: +${sala.gananciaSocio} 💎 · PARTTH: ${sala.feePARTTH} 💎`,
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
      platformWallet.totalRecaudado += sala.feePARTTH;
      platformWallet.totalTransacciones += 1;

      await kv.set(`wallet:${sala.marcaId}`, marcaWallet);
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
      await kv.set('wallet:platform', platformWallet);

      sala.timeline.push({
        id: crypto.randomUUID(),
        tipo: 'fondos_liberados',
        descripcion: `Fondos liberados · Socio: +${sala.gananciaSocio} 💎 · PARTTH fee: ${sala.feePARTTH} 💎`,
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

      // Fee 15% → PARTTH platform wallet
      platformWallet.totalRecaudado += sala.feePARTTH;
      platformWallet.totalTransacciones += 1;
      
      await kv.set(`wallet:${marcaId}`, marcaWallet);
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
      await kv.set('wallet:platform', platformWallet);
      
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

Deno.serve(app.fetch);