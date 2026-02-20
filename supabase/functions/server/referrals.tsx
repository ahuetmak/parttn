import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// 🎁 PROGRAMA DE REFERIDOS AGRESIVO
export async function createReferralCode(c: Context) {
  try {
    const { userId } = await c.req.json();
    
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    // Generar código único
    const referralCode = `PARTH-${user.name.toUpperCase().substring(0, 3)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const referralData = {
      code: referralCode,
      userId,
      userName: user.name,
      userType: user.userType,
      createdAt: new Date().toISOString(),
      uses: 0,
      earnings: 0,
      referrals: [],
    };
    
    await kv.set(`referral:${referralCode}`, referralData);
    
    // Actualizar usuario con su código
    user.referralCode = referralCode;
    await kv.set(`user:${userId}`, user);
    
    return c.json(referralData);
  } catch (error) {
    console.error(`Error creando código de referido: ${error}`);
    return c.json({ error: 'Error creando código' }, 500);
  }
}

// 💰 APLICAR CÓDIGO DE REFERIDO (EN SIGNUP)
export async function applyReferralCode(referralCode: string, newUserId: string) {
  try {
    const referralData = await kv.get(`referral:${referralCode}`);
    if (!referralData) {
      return { success: false, error: 'Código inválido' };
    }
    
    const newUser = await kv.get(`user:${newUserId}`);
    const referrer = await kv.get(`user:${referralData.userId}`);
    
    if (!newUser || !referrer) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // BENEFICIO PARA EL NUEVO USUARIO
    const newUserWallet = await kv.get(`wallet:${newUserId}`);
    newUserWallet.disponible += 50; // $50 USD bonus de bienvenida
    newUserWallet.referralBonus = 50;
    await kv.set(`wallet:${newUserId}`, newUserWallet);
    
    // Marcar usuario como referido
    newUser.referredBy = referralData.userId;
    newUser.referralCode_used = referralCode;
    await kv.set(`user:${newUserId}`, newUser);
    
    // BENEFICIO PARA EL REFERRER (ahora)
    const referrerWallet = await kv.get(`wallet:${referralData.userId}`);
    referrerWallet.disponible += 25; // $25 USD por referir
    await kv.set(`wallet:${referralData.userId}`, referrerWallet);
    
    // Actualizar data de referidos
    referralData.uses += 1;
    referralData.earnings += 25;
    referralData.referrals.push({
      userId: newUserId,
      userName: newUser.name,
      userType: newUser.userType,
      joinedAt: new Date().toISOString(),
      immediateReward: 25,
      futureRewards: 0,
    });
    
    await kv.set(`referral:${referralCode}`, referralData);
    
    // Crear transacciones
    const referralTransaction = {
      id: crypto.randomUUID(),
      userId: referralData.userId,
      type: 'referral_bonus',
      amount: 25,
      referredUser: newUser.name,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    await kv.set(`transaction:${referralData.userId}:${referralTransaction.id}`, referralTransaction);
    
    const welcomeTransaction = {
      id: crypto.randomUUID(),
      userId: newUserId,
      type: 'welcome_bonus',
      amount: 50,
      referrer: referrer.name,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    await kv.set(`transaction:${newUserId}:${welcomeTransaction.id}`, welcomeTransaction);
    
    return {
      success: true,
      newUserBonus: 50,
      referrerBonus: 25,
    };
  } catch (error) {
    console.error(`Error aplicando código de referido: ${error}`);
    return { success: false, error: 'Error procesando referido' };
  }
}

// 🔥 BONUS RECURRENTE: 2% de cada transacción del referido
export async function trackReferralRevenue(salaId: string) {
  try {
    const sala = await kv.get(`sala:${salaId}`);
    if (!sala) return;
    
    // Verificar si el socio fue referido
    const socio = await kv.get(`user:${sala.socioId}`);
    if (!socio || !socio.referredBy) return;
    
    // Calcular 2% del fee PARTH como bonus al referrer
    const referralBonus = sala.feePARTTH * 0.02;
    
    // Agregar al wallet del referrer
    const referrerWallet = await kv.get(`wallet:${socio.referredBy}`);
    if (referrerWallet) {
      referrerWallet.disponible += referralBonus;
      referrerWallet.referralEarnings = (referrerWallet.referralEarnings || 0) + referralBonus;
      await kv.set(`wallet:${socio.referredBy}`, referrerWallet);
      
      // Actualizar data de referidos
      const referrer = await kv.get(`user:${socio.referredBy}`);
      if (referrer?.referralCode) {
        const referralData = await kv.get(`referral:${referrer.referralCode}`);
        if (referralData) {
          referralData.earnings += referralBonus;
          
          // Actualizar el referido específico
          const referredIndex = referralData.referrals.findIndex((r: any) => r.userId === socio.id);
          if (referredIndex !== -1) {
            referralData.referrals[referredIndex].futureRewards += referralBonus;
          }
          
          await kv.set(`referral:${referrer.referralCode}`, referralData);
        }
      }
      
      // Registrar transacción
      const transaction = {
        id: crypto.randomUUID(),
        userId: socio.referredBy,
        type: 'referral_recurring',
        amount: referralBonus,
        salaId: sala.id,
        referredUser: socio.name,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
      await kv.set(`transaction:${socio.referredBy}:${transaction.id}`, transaction);
    }
  } catch (error) {
    console.error(`Error tracking referral revenue: ${error}`);
  }
}

// 🎯 PROGRAMA DE EMBAJADORES
export async function checkAmbassadorTier(userId: string) {
  const user = await kv.get(`user:${userId}`);
  if (!user || !user.referralCode) return null;
  
  const referralData = await kv.get(`referral:${user.referralCode}`);
  if (!referralData) return null;
  
  let tier = {
    name: 'Starter',
    level: 1,
    color: '#64748B',
    benefits: ['$25 por referido', '2% recurring'],
    nextTier: 'Bronze',
    progress: 0,
  };
  
  const totalReferrals = referralData.uses;
  const totalEarnings = referralData.earnings;
  
  // DIAMOND (100+ referidos)
  if (totalReferrals >= 100) {
    tier = {
      name: 'Diamond Ambassador',
      level: 5,
      color: '#B4F8C8',
      benefits: [
        '💎 $75 por referido',
        '🔥 5% recurring de por vida',
        '👑 Featured en landing page',
        '⚡ Soporte VIP dedicado',
        '🎁 Bonus trimestral de $5,000',
      ],
      nextTier: null,
      progress: 100,
    };
  }
  // PLATINUM (50-99 referidos)
  else if (totalReferrals >= 50) {
    tier = {
      name: 'Platinum Ambassador',
      level: 4,
      color: '#A7A7A7',
      benefits: [
        '💎 $60 por referido',
        '🔥 4% recurring',
        '🏆 Badge exclusivo',
        '📊 Analytics dashboard',
      ],
      nextTier: 'Diamond',
      progress: (totalReferrals / 100) * 100,
    };
  }
  // GOLD (20-49 referidos)
  else if (totalReferrals >= 20) {
    tier = {
      name: 'Gold Ambassador',
      level: 3,
      color: '#FFD700',
      benefits: [
        '💰 $45 por referido',
        '🔥 3% recurring',
        '🎯 Materiales de marketing exclusivos',
      ],
      nextTier: 'Platinum',
      progress: (totalReferrals / 50) * 100,
    };
  }
  // BRONZE (5-19 referidos)
  else if (totalReferrals >= 5) {
    tier = {
      name: 'Bronze Ambassador',
      level: 2,
      color: '#CD7F32',
      benefits: [
        '💵 $35 por referido',
        '🔥 2.5% recurring',
      ],
      nextTier: 'Gold',
      progress: (totalReferrals / 20) * 100,
    };
  }
  // STARTER (0-4 referidos)
  else {
    tier.progress = (totalReferrals / 5) * 100;
  }
  
  return {
    ...tier,
    totalReferrals,
    totalEarnings,
    activeReferrals: referralData.referrals.length,
  };
}

// 📊 LEADERBOARD DE REFERIDOS
export async function getReferralLeaderboard() {
  const allReferrals = await kv.getByPrefix('referral:');
  
  const leaderboard = allReferrals
    .map((ref: any) => ({
      userName: ref.userName,
      userType: ref.userType,
      totalReferrals: ref.uses,
      totalEarnings: ref.earnings,
      code: ref.code,
    }))
    .sort((a: any, b: any) => b.totalReferrals - a.totalReferrals)
    .slice(0, 10);
  
  return leaderboard;
}
