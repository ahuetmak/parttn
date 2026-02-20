# PARTH - Marketplace Fintech Premium

## 🚀 Instalación Rápida

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## 📦 Deploy a Cloudflare Pages (SIN Git)

### Opción 1: Arrastrar carpeta (MÁS FÁCIL)

1. Compila el proyecto:
   ```bash
   npm run build
   ```

2. Ve a https://dash.cloudflare.com/
3. Workers & Pages > Create > Pages > Upload assets
4. Arrastra la carpeta **dist**
5. Nombre: `partth`
6. Deploy site ✅

Tu URL será: `https://partth.pages.dev`

### Opción 2: CLI de Cloudflare

```bash
npm run build
npx wrangler pages deploy dist --project-name=parth
```

## ⚙️ Variables de Entorno en Cloudflare

En Dashboard > Tu Proyecto > Settings > Environment Variables, agrega:

```
VITE_SUPABASE_URL=https://bxcrcumkdzzdfepjetuw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=(pide a tu equipo)
SUPABASE_DB_URL=(pide a tu equipo)
STRIPE_SECRET_KEY=(tu clave de Stripe)
STRIPE_WEBHOOK_SECRET=(tu webhook de Stripe)
```

## 📂 Estructura

- `/src/app` - Componentes y páginas React
- `/supabase/functions/server` - Edge Functions (Hono)
- `/utils` - Utilidades compartidas
- `/public` - Assets estáticos

## 🎯 Stack

- React 18 + TypeScript
- Vite + Tailwind CSS v4
- Supabase (Auth + Edge Functions + Storage)
- Stripe
- React Router v7

## 💰 Objetivo

Generar $500 USD diarios desde el día 1
