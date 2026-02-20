// ============================================
// PARTTH Brand Constants
// Información centralizada de marca y contacto
// ============================================

export const BRAND = {
  name: 'PARTTH',
  domain: 'partth.com',
  url: 'https://partth.com',
  tagline: 'Marketplace Fintech Protegido',
  description: 'Conecta Marcas con Socios bajo un sistema de escrow, evidencia obligatoria y reputación verificable',
} as const;

export const CONTACT = {
  support: 'support@partth.com',
  admin: 'admin@partth.com',
  legal: 'legal@partth.com',
  privacy: 'privacy@partth.com',
} as const;

export const FEES = {
  platform: 0.15, // 15% fee PARTTH
  platformPercent: '15%',
} as const;

export const CURRENCY = {
  name: 'Diamantes',
  symbol: '💎',
  ratio: 1, // 1 💎 = 1 USD
} as const;
