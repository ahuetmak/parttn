# CHANGELOG — PARTTH
> *"Cada línea de código es un eslabón en la cadena de confianza."*

---

## [UNRELEASED] — Sprint 1: Fundación del Sistema de Confianza

---

### 2026-02-19 — SESIÓN 2: WAR ROOM COMPLETA + MOTOR IA + ESCROW ENGINE

#### 🧠 CEREBRO DE AUDITORÍA — Agente "Auditor de Verdad"

**Archivo:** `supabase/functions/server/index.tsx`

Motor de validación `calcularScoreIA()` con 4 criterios ponderados:

| Criterio | Peso | Cómo maximizarlo |
|---|---|---|
| Cantidad de archivos | 30% | ≥5 archivos = score máximo |
| Diversidad de tipos | 25% | Imagen + Video + Doc = 100% |
| Calidad de notas | 25% | ≥80 palabras + links + números |
| Capturas de pantalla | 20% | Nombres: `screenshot_`, `venta_`, `comprobante_` |

**Flujos automáticos implementados:**
- Score ≥ 90% → `APROBADO` → Split ejecutado sin intervención humana
- Score 70–89% → `REVISION_MANUAL` → Marca aprueba o re-valida
- Score < 70% → `RECHAZADO` → Fondos bloqueados, socio mejora evidencia

**Nuevos endpoints:**
- `POST /sala/:id/evidencia` — recibe archivos, dispara IA, auto-libera si ≥ 90%
- `POST /sala/:id/validar-ia` — re-validación bajo demanda (solo Marca)

#### 💰 ESCROW ENGINE — Motor Financiero

**Archivo:** `supabase/functions/server/stripe.tsx` — Reescrito completamente

| Función | Descripción |
|---|---|
| `createEscrowHold()` | PaymentIntent con `capture_method: 'manual'` → Hold real en Stripe |
| `captureEscrowAndSplit()` | Captura + Transfer 85% al Socio vía Stripe Connect |
| `cancelEscrowHold()` | Cancela hold sin cobro (en caso de disputa) |
| `createInstantPayout()` | Retiro instantáneo a cuenta bancaria del Socio |
| `createConnectedAccountLink()` | Onboarding Stripe Express para el Socio |

**Tracking del 15% PARTTH:**
- Al crear sala: `totalProducto` bloqueado en `enEscrow` (wallet KV)
- `feePARTTH` calculado y etiquetado como fee PARTTH desde el inicio
- Al aprobar: `feePARTTH` → `wallet:platform` (PARTTH revenue)
- Stripe: `application_fee_amount: feePARTTH` en el Payment Intent

#### 🏗️ MÓDULO DE EVIDENCIA — Componente `EvidenciaModule`

**Archivo:** `src/app/components/EvidenciaModule.tsx` — Componente nuevo (400+ líneas)

- **Drag & Drop** con validación de tipos y tamaño (máx. 50MB/archivo)
- **Categorización automática**: imagen / video / documento / otro
- **Detección de capturas**: keywords `screenshot`, `venta`, `comprobante`, etc.
- **Estimación de score en tiempo real** (client-side, mismo algoritmo que backend)
- **Barra de progreso de upload** con estados: subiendo → Auditor IA evaluando
- **Desglose de Escrow colapsable**: Total / Ganancia Socio / Fee PARTTH
- **CTA inteligente** que muestra el score estimado antes de enviar

#### 🎨 WAR ROOM UI — `SalaDetail.tsx` (reescrito completo)

- `ScoreGauge` — gauge SVG circular animado con counter 0→score en 1.2s
- `ScoreBar` — 4 barras de progreso por criterio IA con animación staggered
- `EscrowBadge` — filas de desglose del escrow con iconos y colores semánticos
- Tab **Escrow** — barra de composición animada (Marca/Socio/PARTTH)
- Timeline enriquecido con eventos del Auditor IA + scores históricos
- Panel **"Reglas del Auditor IA"** en sidebar con guía visual
- Estado de la Sala con indicador de pulso animado según estado

---

### 2026-02-19 — SESIÓN 1: FUNDACIÓN DEL SISTEMA

#### ✅ INFRAESTRUCTURA VERIFICADA

| Sistema | Estado | Detalle |
|---|---|---|
| Supabase REST API | ✅ HTTP 200 | `bxcrcumkdzzdfepjetuw.supabase.co` operativo |
| Edge Functions | ✅ `{"status":"ok"}` | `make-server-1c8a6aaa` activo |
| Tailwind v4 | ✅ Configurado | `#000000` / `#00F2A6` / `#0EA5E9` |
| Git Portable v2.53.0 | ✅ Operativo | `C:\Users\ahuet\OneDrive\news\PortableGit` |
| GitHub | ✅ Conectado | `github.com/ahuetmak/parttn` · branch `main` |

#### 🏗️ CONSTRUIDO EN SESIÓN 1

- `src/app/pages/Wallet.tsx` — Dashboard Cashflow completo (26KB)
  - Saldo en Diamantes con indicador LIVE pulsante
  - Grid 6 métricas: Disponible · Escrow · Hold · Revisión · Ingresos · Disputa
  - Barra de composición de saldo animada
  - Historial de transacciones con estados visuales
- `ESTADO_DEL_SISTEMA.md` — Libro de ruta del proyecto
- `CHANGELOG.md` — Este archivo

---

## COMMITS EN GITHUB

| Hash | Mensaje | Archivos |
|---|---|---|
| `d178a45` | feat(war-room): Sala Digital + Auditor IA + Escrow 15% | 3 archivos · 1,032 inserciones |
| `1910d2a` | feat: PARTTH — fundación del sistema de confianza v0.1.0 | 124 archivos · 20,659 inserciones |

---

## ROADMAP

### v0.1.0 — MVP de Confianza ✅ En progreso
- [x] Git + GitHub operativo
- [x] Supabase + Edge Functions activos
- [x] Wallet Dashboard con saldo en Diamantes
- [x] Motor IA `calcularScoreIA()` con umbral 90%
- [x] Escrow Hold con Stripe `capture_method: manual`
- [x] Módulo de Evidencia con estimación en tiempo real
- [x] War Room UI completa
- [ ] Stripe Keys activas en `.env.local`
- [ ] Deploy en `partth.com`

### v0.2.0 — Motor IA Real
- [ ] Conectar Abacus.ai API para análisis visual real de imágenes
- [ ] Agente "Cerrador de Ventas" (generación de copies y embudos)
- [ ] Marketplace de Misiones con filtros

### v0.3.0 — Escala
- [ ] Agente "Concierge de Disputas" (< 72h)
- [ ] Planes de Membresía: Starter / Pro / Elite
- [ ] Stripe Connect onboarding para socios
- [ ] Objetivo: $500 → $50,000 USD/día

---

*PARTTH no es una herramienta, es un ecosistema de confianza.*
