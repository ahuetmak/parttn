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
| Git (Portable) | ✅ **v2.53.0** | `C:\Users\ahuet\OneDrive\news\PortableGit` |
| `.gitignore` | ✅ **ACTIVO** | Protege `.env*`, `node_modules`, `dist` |
| `CHANGELOG.md` | ✅ **CREADO** | Libro de cambios iniciado (2026-02-19) |
| Primer commit | ✅ **`1910d2a`** | 124 archivos · 20,659 líneas |
| Repositorio remoto | ✅ **EN GITHUB** | `github.com/ahuetmak/parttn` · branch `main` |
| Estado del repo | ✅ **SINCRONIZADO** | `main` tracking `origin/main` |

**Repositorio:** `https://github.com/ahuetmak/parttn`  
**Commit fundacional:** `1910d2a — feat: PARTTH — fundacion del sistema de confianza v0.1.0`

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
- [x] ~~Wallet con saldo visual en Dashboard~~ → ✅ `Wallet.tsx` completo
- [x] ~~Instalar Git y hacer primer commit~~ → ✅ `1910d2a`
- [x] ~~Sala Digital con flujo de evidencia completo~~ → ✅ War Room + Auditor IA completo
- [x] ~~Stripe Escrow Engine~~ → ✅ `createEscrowHold` + split 85/15 + `wallet:platform`
- [x] ~~RecargarModal~~ → ✅ Stripe Elements real + fallback demo mode
- [x] ~~Cloudflare Pages config~~ → ✅ `wrangler.toml` + `_redirects` + GitHub Actions CI/CD
- [x] ~~Instalar dependencias~~ → ✅ `npm install` exitoso — 2,098 módulos compilados
- [x] ~~Build de producción~~ → ✅ `dist/` generado — `e6fe993` pusheado a GitHub
- [ ] **🔑 FIRMA REQUERIDA: 4 secrets en GitHub** → ver instrucciones abajo

### 🔑 INSTRUCCIONES DE DEPLOY (CEO firma aquí)
Para activar el deploy automático a partth.com, agrega estos 4 secrets en:
**https://github.com/ahuetmak/parttn/settings/secrets/actions**

| Secret | Valor |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Token de tu Cloudflare Dashboard → API Tokens → Create Token → "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Tu Account ID en dashboard.cloudflare.com (barra lateral derecha) |
| `VITE_SUPABASE_URL` | `https://bxcrcumkdzzdfepjetuw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ver .env.local) |

Una vez agregados, cada push a `main` despliega automáticamente a partth.com.

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
