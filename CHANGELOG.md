# CHANGELOG — PARTTH
> *"Cada línea de código es un eslabón en la cadena de confianza."*

---

## [UNRELEASED] — Sprint 1: Fundación del Sistema de Confianza

### 2026-02-19 — SESIÓN DE ARRANQUE: WALLET + SALA DIGITAL

#### ✅ VERIFICADO
- **Supabase REST API**: Responde HTTP 200 — `bxcrcumkdzzdfepjetuw.supabase.co` operativo
- **Supabase Edge Functions**: `make-server-1c8a6aaa` responde `{"status":"ok"}` — servidor activo
- **KV Store**: Arquitectura de Wallet lista (schema: `wallet:{userId}`)
- **Tailwind v4**: Tema Premium Dark configurado (`#000000` / `#00F2A6` / `#0EA5E9`)

#### 🏗️ CONSTRUIDO
- `src/app/pages/Wallet.tsx` — Vista completa del Cashflow Dashboard con saldo en Diamantes
  - Balance Total (Disponible + Escrow + Hold)
  - Grid de 6 métricas: Disponible · Escrow · Hold · Revisión · Ingresos · Disputa
  - Historial de transacciones con estados visuales
  - Modal de Recarga con integración Stripe
  - Retiro de fondos (Instant Payout)
- `src/app/pages/SalaDetail.tsx` — Vista de la Sala Digital (War Room)
- `src/app/pages/SalasDigitales.tsx` — Listado de Salas activas
- `supabase/functions/server/index.tsx` — Rutas de Wallet, Auth y Salas
- `supabase/functions/server/disputes.tsx` — Agente Concierge de Disputas
- `supabase/functions/server/marketplace.tsx` — Motor del Marketplace
- `supabase/functions/server/stripe.tsx` — Integración Stripe (recargas + payouts)
- `supabase/functions/server/webhooks.tsx` — Webhooks de eventos
- `.gitignore` — Protección de secretos (`.env*`, `node_modules`, `dist`)
- `ESTADO_DEL_SISTEMA.md` — Libro de ruta del proyecto

#### ⚠️ PENDIENTE (requiere acción)
- **Git**: No detectado en el sistema — instalar desde https://git-scm.com/download/win
  ```
  git init && git add . && git commit -m "feat: PARTTH — fundación del sistema de confianza"
  ```
- **Stripe Keys**: No presentes en `.env.local` — agregar:
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
  ```
- **Edge Functions Deploy**: Verificar que las funciones están desplegadas en Supabase Dashboard
- **Sala Digital UI**: Activar flujo completo de evidencia + validación IA

---

## ROADMAP DE VERSIONES

### v0.1.0 — MVP de Confianza (Sprint 1)
- [ ] Git inicializado y primer commit
- [ ] Wallet funcional con saldo real desde Supabase
- [ ] Sala Digital con flujo de evidencia completo
- [ ] Stripe activo para recargas

### v0.2.0 — Motor IA (Sprint 2)
- [ ] Agente "Auditor de Verdad" (score ≥ 0.90)
- [ ] Agente "Cerrador de Ventas"
- [ ] Marketplace de Misiones con filtros

### v0.3.0 — Escala (Sprint 3)
- [ ] Agente "Concierge de Disputas" (< 72h)
- [ ] Planes de Membresía (Starter / Pro / Elite)
- [ ] Deploy en partth.com vía Cloudflare + InsForge
- [ ] Volumen objetivo: $500 → $50,000 USD/día

---

*PARTTH no es una herramienta, es un ecosistema de confianza.*
