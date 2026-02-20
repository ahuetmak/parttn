# ⬛ ESTADO DEL SISTEMA — PARTTH
**Última actualización:** 2026-02-19 — SESIÓN DE ARRANQUE  
**Entorno:** Desarrollo Local → `partth.com` (Cloudflare / InsForge)  
**Stack:** React 18 + Vite 6 + Tailwind v4 + Supabase + Stripe + Hono (Edge Functions)

---

## 🔴 PRIORIDAD #1 — SALA DIGITAL (WAR ROOM)
> **Protocolo activo: NO EVIDENCE → NO PAYMENT**
>
> El flujo de la Sala Digital es el corazón del sistema de confianza de PARTTH.
> Ningún pago puede liberarse sin evidencia validada. Este bloqueo es sagrado.

**Estado actual:** En construcción  
**Archivos clave:**
- `src/app/pages/` — Vistas de la Sala Digital
- `supabase/functions/server/index.tsx` — Rutas `/sala/:id/evidencia` y `/sala/:id/aprobar`
- `supabase/functions/server/disputes.tsx` — Agente Concierge de Disputas

**Flujo obligatorio:**
```
Acuerdo Iniciado → Capital en Escrow (Hold)
       ↓
Socio sube evidencia → Validación IA (score ≥ 0.90)
       ↓
Marca aprueba / IA autoriza → Release automático
       ↓
Split: 85% Socio | 15% PARTTH
```

---

## ✅ CHECK #1 — TEST DE SUPABASE (Base de Datos)
> **Verificado el 2026-02-19** — Test en vivo desde PowerShell

| Elemento | Estado | Detalle |
|---|---|---|
| REST API Supabase | ✅ **HTTP 200** | `bxcrcumkdzzdfepjetuw.supabase.co/rest/v1/` responde |
| Edge Functions Server | ✅ **`{"status":"ok"}`** | `make-server-1c8a6aaa` activo y operativo |
| Tabla `kv_store_1c8a6aaa` | ✅ **LISTA** | Tabla KV principal — accesible vía REST API |
| Wallets (Diamantes) | ✅ **ARQUITECTURA OK** | Almacenados como `wallet:{userId}` en KV store |
| Wallets en DB | ⚠️ **0 registros** | Base de datos limpia — esperando primeros usuarios |
| Tabla `wallets` separada | ℹ️ **No aplica** | La arquitectura usa patrón KV, no tabla directa |

**Esquema de Wallet (en KV store):**
```json
{
  "userId": "uuid",
  "disponible": 0,        // 💎 Diamantes disponibles para uso
  "enEscrow": 0,          // 🔒 Capital bloqueado en acuerdo activo
  "enHold": 0,            // ⏳ En revisión pre-liberación
  "enRevision": 0,        // 🔍 Bajo auditoría de evidencia
  "enDisputa": 0,         // ⚖️ En proceso de disputa
  "totalIngresos": 0,     // 📈 Acumulado histórico
  "totalTarifasPagadas": 0 // 💰 Fees pagados a PARTTH
}
```

**Conexión activa en:** `src/lib/supabase.ts` → `src/lib/api.ts`

---

## ⚠️ CHECK #2 — GIT (Repositorio)
> **Verificado el 2026-02-19** — Git no instalado en PATH del sistema

| Elemento | Estado | Acción Requerida |
|---|---|---|
| Git instalado | ❌ **NO EN PATH** | Instalar Git para Windows |
| `.gitignore` | ✅ **CREADO** | Protege `.env*`, `node_modules`, `dist` |
| `CHANGELOG.md` | ✅ **CREADO** | Libro de cambios iniciado (2026-02-19) |
| Estado del repo | ⏸️ **PENDIENTE** | Requiere `git init` manual post-instalación |

**Acción requerida por el usuario:**
```bash
# 1. Descargar e instalar Git: https://git-scm.com/download/win
# 2. Abrir nueva terminal y ejecutar:
git init
git add .
git commit -m "feat: PARTTH — fundación del sistema de confianza v0.1.0"
git remote add origin <URL_DEL_REPO_EN_GITHUB>
git push -u origin main
```

---

## ✅ CHECK #3 — TAILWIND CSS v4 (Tema Premium Dark)

| Elemento | Estado | Valor |
|---|---|---|
| Versión | ✅ **v4.1.12** | Vía `@tailwindcss/vite` (sin config.js) |
| Fondo principal | ✅ **CONFIGURADO** | `#000000` |
| Acento Cian | ✅ **CONFIGURADO** | `#00F2A6` |
| Acento Azul | ✅ **CONFIGURADO** | `#0EA5E9` |
| Acento Púrpura | ✅ **CONFIGURADO** | `#8B5CF6` |
| Glassmorphism | ✅ **ACTIVO** | `.glass-card` + `.glass-card-hover` |
| Glow Effects | ✅ **ACTIVOS** | `--glow-cyan` y `--glow-blue` |
| Plugin Vite | ✅ **INTEGRADO** | `vite.config.ts` → `tailwindcss()` |

**Variables CSS activas en** `src/styles/index.css`:
```css
--color-bg-primary: #000000
--color-accent-cyan: #00F2A6    /* Color primario PARTTH */
--color-accent-blue: #0EA5E9    /* Color secundario */
--glass-bg: rgba(10, 14, 26, 0.7)
--glow-cyan: 0 0 40px rgba(0, 242, 166, 0.3)
```

---

## 📐 ARQUITECTURA TÉCNICA

### Stack Confirmado
```
Frontend:   React 18 + Vite 6 + Tailwind v4 + Radix UI + Lucide Icons
Backend:    Supabase Edge Functions (Hono framework + Deno runtime)
Database:   PostgreSQL via Supabase (KV store + Auth)
Pagos:      Stripe (configurado en stripe.tsx)
IA:         Abacus.ai (pendiente de integración activa)
Infra:      InsForge → partth.com (Cloudflare)
```

### Módulos del Servidor (Edge Functions)
| Módulo | Archivo | Estado |
|---|---|---|
| Wallet + Auth + Salas | `index.tsx` | ✅ Implementado |
| Marketplace + Ofertas | `marketplace.tsx` | ✅ Implementado |
| Motor de Disputas | `disputes.tsx` | ✅ Implementado |
| Programa de Lealtad | `loyalty.tsx` | ✅ Implementado |
| Sistema de Referidos | `referrals.tsx` | ✅ Implementado |
| Integración Stripe | `stripe.tsx` | ✅ Implementado |
| Webhooks | `webhooks.tsx` | ✅ Implementado |
| n8n Automatización | `n8n.tsx` | ✅ Implementado |

---

## 💎 MOTOR FINANCIERO — DIAMANTES

### Split Automático (confirmado en código)
```
Total de la transacción
├── 85% → Socio/Partner (liberación inmediata post-validación)
└── 15% → PARTTH (fee directo)
```

### Planes de Membresía (pendiente de activar en frontend)
| Plan | Precio | Fee | Beneficios |
|---|---|---|---|
| Starter | $0/mes | 15% | Acceso básico |
| Pro | $49/mes | 12% | +5 IA Partners |
| Elite | $299/mes | 8% | Abacus Custom Training |

---

## 🚀 PRÓXIMOS PASOS (SPRINT 1)

### Inmediato (esta sesión)
- [x] ~~Verificar deploy de Edge Functions en Supabase~~ → ✅ `{"status":"ok"}` confirmado
- [x] ~~Crear CHANGELOG.md~~ → ✅ Libro de ruta iniciado
- [x] ~~Wallet con saldo visual en Dashboard~~ → ✅ `Wallet.tsx` completo (26KB)
- [ ] **Instalar Git** y hacer primer commit → https://git-scm.com/download/win
- [ ] **Agregar STRIPE keys** a `.env.local` → `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] Activar Sala Digital con flujo de evidencia completo (War Room)

### Sprint 2
- [ ] Integrar módulo de evidencia con validación IA (Abacus)
- [ ] Activar Stripe para recargas y payouts
- [ ] Lanzar Marketplace de Misiones
- [ ] Sistema de reputación y reviews

### Sprint 3
- [ ] Agente "Cerrador de Ventas" (Abacus)
- [ ] Agente "Auditor de Verdad" (score ≥ 0.90)
- [ ] Agente "Concierge de Disputas" (< 72h)
- [ ] Deploy en partth.com

---

## 🔐 SEGURIDAD

- JWT Authentication via Supabase Auth ✅
- Service Role Key solo en Edge Functions (server-side) ✅
- Anon Key expuesta solo para lectura pública ✅
- Cifrado de evidencia: pendiente implementación en Storage bucket
- Bucket de evidencias: `make-1c8a6aaa-evidencias` (auto-creado al iniciar)

---

*"PARTTH no es una herramienta, es un ecosistema de confianza."*
