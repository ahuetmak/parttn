import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// 🎯 SISTEMA DE TIERS: Reduce hold según reputación
export function calculateHoldDays(reputation: number, completedDeals: number): number {
  // VIP Elite: Sin hold
  if (reputation >= 98 && completedDeals >= 100) {
    return 0; // Liberación inmediata
  }
  
  // VIP Gold: Hold reducido
  if (reputation >= 95 && completedDeals >= 50) {
    return 3; // Solo 3 días
  }
  
  // Trusted: Hold medio
  if (reputation >= 90 && completedDeals >= 20) {
    return 7; // 7 días
  }
  
  // Standard: Hold completo
  return 14; // 14 días
}

// 🚀 EARLY RELEASE: Paga 3% extra, recibe instantáneo
export async function requestEarlyRelease(c: Context) {
  try {
    const { salaId, socioId } = await c.req.json();
    
    const sala = await kv.get(`sala:${salaId}`);
    if (!sala) {
      return c.json({ error: 'Sala no encontrada' }, 404);
    }
    
    if (!sala.enHold) {
      return c.json({ error: 'Esta sala no está en hold' }, 400);
    }
    
    // Calcular fee de early release (3% del monto)
    const earlyReleaseFee = sala.gananciaSocio * 0.03;
    const netAmount = sala.gananciaSocio - earlyReleaseFee;
    
    // Obtener wallet del socio
    const socioWallet = await kv.get(`wallet:${socioId}`);
    if (!socioWallet) {
      return c.json({ error: 'Wallet no encontrado' }, 404);
    }
    
    // Mover fondos de hold a disponible
    socioWallet.enHold -= sala.gananciaSocio;
    socioWallet.disponible += netAmount;
    socioWallet.totalTarifasPagadas += earlyReleaseFee;
    
    await kv.set(`wallet:${socioId}`, socioWallet);
    
    // Actualizar sala
    sala.enHold = false;
    sala.fondosLiberados = true;
    sala.earlyReleaseUsed = true;
    sala.earlyReleaseFee = earlyReleaseFee;
    
    sala.timeline.push({
      id: crypto.randomUUID(),
      tipo: 'early_release',
      descripcion: `Early Release activado - ${netAmount.toFixed(2)} 💎 disponibles (fee: ${earlyReleaseFee.toFixed(2)} 💎)`,
      timestamp: new Date().toISOString(),
      autor: socioId,
    });
    
    await kv.set(`sala:${salaId}`, sala);
    
    // Registrar transacción
    const transaction = {
      id: crypto.randomUUID(),
      userId: socioId,
      type: 'early_release',
      amount: netAmount,
      fee: earlyReleaseFee,
      salaId: sala.id,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    await kv.set(`transaction:${socioId}:${transaction.id}`, transaction);
    
    return c.json({ 
      success: true, 
      netAmount,
      earlyReleaseFee,
      message: 'Fondos liberados instantáneamente'
    });
  } catch (error) {
    console.error(`Error en early release: ${error}`);
    return c.json({ error: 'Error procesando early release' }, 500);
  }
}

// 💎 LOYALTY REWARDS: Más deals = mejores condiciones
export async function calculateLoyaltyBenefits(userId: string) {
  const user = await kv.get(`user:${userId}`);
  if (!user) return null;
  
  const tier = {
    name: 'Standard',
    color: '#64748B',
    benefits: [] as string[],
    feeDiscount: 0,
    holdDays: 14,
    prioritySupport: false,
  };
  
  // VIP Elite
  if (user.reputation >= 98 && user.completedDeals >= 100) {
    tier.name = 'VIP Elite';
    tier.color = '#FFD700';
    tier.benefits = [
      '✨ Sin hold - Liberación inmediata',
      '🎯 Fee reducido: 12% (vs 15%)',
      '⚡ Soporte prioritario 24/7',
      '🔥 Badge exclusivo en perfil',
      '💎 Early access a nuevas features',
    ];
    tier.feeDiscount = 3; // 15% - 3% = 12%
    tier.holdDays = 0;
    tier.prioritySupport = true;
  }
  // VIP Gold
  else if (user.reputation >= 95 && user.completedDeals >= 50) {
    tier.name = 'VIP Gold';
    tier.color = '#F59E0B';
    tier.benefits = [
      '⚡ Hold reducido: 3 días',
      '🎯 Fee reducido: 13.5% (vs 15%)',
      '📞 Soporte prioritario',
      '🏆 Badge Gold en perfil',
    ];
    tier.feeDiscount = 1.5;
    tier.holdDays = 3;
    tier.prioritySupport = true;
  }
  // Trusted
  else if (user.reputation >= 90 && user.completedDeals >= 20) {
    tier.name = 'Trusted';
    tier.color = '#0EA5E9';
    tier.benefits = [
      '⏱️ Hold reducido: 7 días',
      '🎯 Fee reducido: 14% (vs 15%)',
      '✅ Badge Trusted en perfil',
    ];
    tier.feeDiscount = 1;
    tier.holdDays = 7;
  }
  
  return tier;
}

// 📊 PROGRESS TO NEXT TIER
export async function getProgressToNextTier(userId: string) {
  const user = await kv.get(`user:${userId}`);
  if (!user) return null;
  
  const currentRep = user.reputation || 0;
  const currentDeals = user.completedDeals || 0;
  
  let nextTier = {
    name: '',
    requiredRep: 0,
    requiredDeals: 0,
    progressRep: 0,
    progressDeals: 0,
  };
  
  if (currentRep < 90 || currentDeals < 20) {
    nextTier = {
      name: 'Trusted',
      requiredRep: 90,
      requiredDeals: 20,
      progressRep: (currentRep / 90) * 100,
      progressDeals: (currentDeals / 20) * 100,
    };
  } else if (currentRep < 95 || currentDeals < 50) {
    nextTier = {
      name: 'VIP Gold',
      requiredRep: 95,
      requiredDeals: 50,
      progressRep: (currentRep / 95) * 100,
      progressDeals: (currentDeals / 50) * 100,
    };
  } else if (currentRep < 98 || currentDeals < 100) {
    nextTier = {
      name: 'VIP Elite',
      requiredRep: 98,
      requiredDeals: 100,
      progressRep: (currentRep / 98) * 100,
      progressDeals: (currentDeals / 100) * 100,
    };
  } else {
    return { maxTier: true };
  }
  
  return nextTier;
}
