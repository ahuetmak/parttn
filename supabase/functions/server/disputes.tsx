import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// 🤖 RESOLUCIÓN AUTOMÁTICA DE DISPUTAS
export async function autoResolveDispute(c: Context) {
  try {
    const { salaId, disputaId } = await c.req.json();
    
    const sala = await kv.get(`sala:${salaId}`);
    if (!sala || !sala.disputa) {
      return c.json({ error: 'Disputa no encontrada' }, 404);
    }
    
    // 1. ANÁLISIS DE EVIDENCIA
    const evidenceScore = analyzeEvidence(sala);
    
    // 2. ANÁLISIS DE HISTORIAL
    const historyScore = await analyzeUserHistory(sala.marcaId, sala.socioId);
    
    // 3. ANÁLISIS DE COMUNICACIÓN
    const communicationScore = analyzeTimeline(sala.timeline);
    
    // 4. CALCULAR VEREDICTO
    const verdict = calculateVerdict(evidenceScore, historyScore, communicationScore);
    
    // 5. APLICAR DECISIÓN
    const resolution = await applyResolution(sala, verdict);
    
    return c.json(resolution);
  } catch (error) {
    console.error(`Error auto-resolviendo disputa: ${error}`);
    return c.json({ error: 'Error procesando disputa' }, 500);
  }
}

// 📊 ANALIZAR EVIDENCIA
function analyzeEvidence(sala: any): number {
  let score = 50; // Neutral
  
  // ¿Hay evidencia entregada?
  if (sala.evidenciaEntregada) {
    score += 20;
    
    // ¿Cuántos archivos?
    if (sala.evidencia?.archivos?.length > 0) {
      score += 10 * Math.min(sala.evidencia.archivos.length, 3);
    }
    
    // ¿Hay notas detalladas?
    if (sala.evidencia?.notas?.length > 100) {
      score += 10;
    }
  } else {
    score -= 30; // No hay evidencia = problema del socio
  }
  
  return Math.max(0, Math.min(100, score));
}

// 📈 ANALIZAR HISTORIAL DE USUARIOS
async function analyzeUserHistory(marcaId: string, socioId: string): Promise<number> {
  let score = 50; // Neutral
  
  // Obtener perfiles
  const marca = await kv.get(`user:${marcaId}`);
  const socio = await kv.get(`user:${socioId}`);
  
  if (!marca || !socio) return score;
  
  // Comparar reputaciones
  const repDiff = socio.reputation - marca.reputation;
  score += repDiff * 0.3; // Cada punto de reputación cuenta
  
  // Deals completados (experiencia)
  if (socio.completedDeals > marca.completedDeals) {
    score += 10;
  }
  
  // Historial de disputas previas
  const allDisputes = await kv.getByPrefix('sala:');
  const marcaDisputes = allDisputes.filter((s: any) => 
    s.marcaId === marcaId && s.tieneDisputa && s.disputa?.culpable === 'marca'
  );
  const socioDisputes = allDisputes.filter((s: any) => 
    s.socioId === socioId && s.tieneDisputa && s.disputa?.culpable === 'socio'
  );
  
  score -= marcaDisputes.length * 5; // Penalizar historial de marca problemática
  score -= socioDisputes.length * 5; // Penalizar historial de socio problemático
  
  return Math.max(0, Math.min(100, score));
}

// 💬 ANALIZAR COMUNICACIÓN
function analyzeTimeline(timeline: any[]): number {
  let score = 50;
  
  // ¿Hay comunicación activa?
  const updates = timeline.filter(t => 
    t.tipo === 'mensaje' || t.tipo === 'actualizacion'
  );
  
  score += Math.min(updates.length * 5, 25);
  
  // ¿Cuánto tiempo pasó sin updates?
  if (timeline.length > 1) {
    const lastUpdate = new Date(timeline[timeline.length - 1].timestamp);
    const firstUpdate = new Date(timeline[0].timestamp);
    const daysDiff = (lastUpdate.getTime() - firstUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 30) {
      score -= 20; // Mucho tiempo inactivo
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

// ⚖️ CALCULAR VEREDICTO
function calculateVerdict(evidenceScore: number, historyScore: number, communicationScore: number) {
  const totalScore = (evidenceScore * 0.5) + (historyScore * 0.3) + (communicationScore * 0.2);
  
  let winner = 'neutral';
  let confidence = 0;
  let reason = '';
  
  if (totalScore >= 65) {
    winner = 'socio';
    confidence = Math.min((totalScore - 50) * 2, 100);
    reason = 'Evidencia sólida y buen historial del socio';
  } else if (totalScore <= 35) {
    winner = 'marca';
    confidence = Math.min((50 - totalScore) * 2, 100);
    reason = 'Falta de evidencia o problemas de cumplimiento';
  } else {
    winner = 'mediacion'; // Casos ambiguos van a mediación humana
    confidence = 50;
    reason = 'Caso requiere revisión manual';
  }
  
  return {
    winner,
    confidence,
    reason,
    scores: {
      evidence: evidenceScore,
      history: historyScore,
      communication: communicationScore,
      total: totalScore,
    },
  };
}

// ✅ APLICAR RESOLUCIÓN
async function applyResolution(sala: any, verdict: any) {
  const resolution = {
    disputaId: sala.disputa.id || crypto.randomUUID(),
    salaId: sala.id,
    winner: verdict.winner,
    confidence: verdict.confidence,
    reason: verdict.reason,
    resolvedAt: new Date().toISOString(),
    resolvedBy: 'auto',
    autoScores: verdict.scores,
  };
  
  // Si confianza es alta, resolver automáticamente
  if (verdict.confidence >= 70 && verdict.winner !== 'mediacion') {
    // Liberar fondos al ganador
    if (verdict.winner === 'socio') {
      // Socio gana - liberar su comisión
      const socioWallet = await kv.get(`wallet:${sala.socioId}`);
      socioWallet.enDisputa -= sala.gananciaSocio;
      socioWallet.disponible += sala.gananciaSocio;
      await kv.set(`wallet:${sala.socioId}`, socioWallet);
      
      resolution.action = 'Fondos liberados al socio';
      resolution.amount = sala.gananciaSocio;
    } else {
      // Marca gana - devolver fondos
      const marcaWallet = await kv.get(`wallet:${sala.marcaId}`);
      marcaWallet.enDisputa -= sala.totalProducto;
      marcaWallet.disponible += sala.totalProducto;
      await kv.set(`wallet:${sala.marcaId}`, marcaWallet);
      
      resolution.action = 'Fondos devueltos a la marca';
      resolution.amount = sala.totalProducto;
    }
    
    // Actualizar sala
    sala.disputa.estado = 'resuelta';
    sala.disputa.resolution = resolution;
    sala.estado = 'cerrada';
    
    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'disputa_resuelta',
      descripcion: `🤖 Disputa resuelta automáticamente a favor de ${verdict.winner} (${verdict.confidence}% confianza)`,
      timestamp: new Date().toISOString(),
      autor: 'sistema',
    });
    
    await kv.set(`sala:${sala.id}`, sala);
    
    resolution.status = 'resolved';
  } else {
    // Casos ambiguos → Mediación humana
    sala.disputa.estado = 'en_mediacion';
    sala.disputa.requiresHumanReview = true;
    sala.disputa.autoAnalysis = resolution;
    
    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'mediacion_requerida',
      descripcion: '👨‍⚖️ Caso escalado a mediación humana (decisión en 48h)',
      timestamp: new Date().toISOString(),
      autor: 'sistema',
    });
    
    await kv.set(`sala:${sala.id}`, sala);
    
    // TODO: Enviar notificación al equipo de PARTH
    resolution.status = 'escalated';
    resolution.sla = '48 horas';
  }
  
  return resolution;
}

// 📋 CRITERIOS DE DECISIÓN CLAROS
export const DISPUTE_CRITERIA = {
  // Socio gana si:
  socio_wins: [
    '✅ Evidencia completa entregada (capturas, archivos, reportes)',
    '✅ Comunicación constante durante el proyecto',
    '✅ Timeline muestra progreso regular',
    '✅ Reputación del socio > 85%',
    '✅ Marca no respondió a entregas en 7+ días',
  ],
  
  // Marca gana si:
  marca_wins: [
    '❌ Sin evidencia entregada',
    '❌ Trabajo incompleto vs. acuerdo original',
    '❌ Sin comunicación del socio por 14+ días',
    '❌ Evidencia no corresponde al scope',
    '❌ Plazo excedido sin justificación',
  ],
  
  // Mediación si:
  mediation: [
    '⚠️ Ambos tienen argumentos válidos',
    '⚠️ Evidencia parcial o ambigua',
    '⚠️ Cambios de scope no documentados',
    '⚠️ Falta de comunicación de ambos lados',
    '⚠️ Caso complejo que requiere experto',
  ],
  
  // SLA
  resolution_time: {
    automatic: '24 horas',
    human_mediation: '48 horas',
    complex_cases: '72 horas',
  },
};
