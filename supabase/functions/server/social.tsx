// PARTTH Social Media Engine
// Instagram Graph API + X (Twitter) API v2 + LinkedIn API
// Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
// Solo configura las vars de entorno y el sistema publica solo.

// ── Env vars necesarias ───────────────────────────────────────────────────────
// INSTAGRAM_ACCESS_TOKEN       — Token de acceso de Instagram Business (Meta Graph API)
// INSTAGRAM_BUSINESS_ACCOUNT_ID — ID de la cuenta de Instagram Business
// TWITTER_BEARER_TOKEN         — Bearer token de X (Twitter API v2)
// TWITTER_API_KEY              — API Key de X
// TWITTER_API_SECRET           — API Secret de X
// TWITTER_ACCESS_TOKEN         — Access Token de X (OAuth 1.0a)
// TWITTER_ACCESS_SECRET        — Access Token Secret de X
// LINKEDIN_ACCESS_TOKEN        — Token OAuth 2.0 de LinkedIn
// LINKEDIN_PERSON_URN          — URN del perfil/página LinkedIn (ej: urn:li:person:xxxx)

interface PostResult {
  platform: string;
  ok: boolean;
  id?: string;
  error?: string;
  url?: string;
}

// ── INSTAGRAM ────────────────────────────────────────────────────────────────

export async function postInstagram(params: {
  caption: string;
  imageUrl?: string;
}): Promise<PostResult> {
  const token = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
  const igUserId = Deno.env.get('INSTAGRAM_BUSINESS_ACCOUNT_ID');

  if (!token || !igUserId) {
    return { platform: 'instagram', ok: false, error: 'INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_BUSINESS_ACCOUNT_ID no configurados. Agrega las vars en Supabase → Edge Functions → Secrets.' };
  }

  try {
    const baseUrl = `https://graph.facebook.com/v21.0/${igUserId}`;

    // Paso 1: Crear contenedor de media
    const containerBody: Record<string, string> = {
      caption: params.caption,
      access_token: token,
    };

    // Si hay imagen, es un IMAGE post; si no, es REELS/carrusel — usamos solo caption (solo disponible para Reels con video_url o imagen con image_url)
    // Para texto puro: Instagram no soporta posts de solo texto, necesita imagen. Usar imagen por defecto de PARTTH.
    if (params.imageUrl) {
      containerBody['image_url'] = params.imageUrl;
      containerBody['media_type'] = 'IMAGE';
    } else {
      // Fallback: usar imagen de marca PARTTH alojada en CDN
      containerBody['image_url'] = 'https://partth.com/logo-glow.png';
      containerBody['media_type'] = 'IMAGE';
    }

    const containerRes = await fetch(`${baseUrl}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerBody),
    });
    const container = await containerRes.json();

    if (!container.id) {
      return { platform: 'instagram', ok: false, error: `Container error: ${JSON.stringify(container)}` };
    }

    // Paso 2: Publicar el contenedor
    const publishRes = await fetch(`${baseUrl}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: container.id, access_token: token }),
    });
    const published = await publishRes.json();

    if (published.id) {
      return {
        platform: 'instagram',
        ok: true,
        id: published.id,
        url: `https://www.instagram.com/p/${published.id}/`,
      };
    }
    return { platform: 'instagram', ok: false, error: JSON.stringify(published) };
  } catch (err) {
    return { platform: 'instagram', ok: false, error: String(err) };
  }
}

// ── X (TWITTER) API v2 ────────────────────────────────────────────────────────

export async function postTwitter(text: string): Promise<PostResult> {
  const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
  const apiKey = Deno.env.get('TWITTER_API_KEY');
  const apiSecret = Deno.env.get('TWITTER_API_SECRET');
  const accessToken = Deno.env.get('TWITTER_ACCESS_TOKEN');
  const accessSecret = Deno.env.get('TWITTER_ACCESS_SECRET');

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { platform: 'twitter', ok: false, error: 'Twitter credentials no configuradas. Agrega TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET en Supabase Secrets.' };
  }

  try {
    // OAuth 1.0a signature para Twitter API v2
    const url = 'https://api.twitter.com/2/tweets';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID().replace(/-/g, '');

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: '1.0',
    };

    // Construir base string y firma
    const paramStr = Object.keys(oauthParams).sort().map(k =>
      `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`
    ).join('&');
    const baseStr = `POST&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
    const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;

    // HMAC-SHA1
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(signingKey), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
    );
    const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(baseStr));
    const signature = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
    oauthParams['oauth_signature'] = signature;

    const authHeader = 'OAuth ' + Object.keys(oauthParams).sort().map(k =>
      `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`
    ).join(', ');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.slice(0, 280) }),
    });

    const data = await res.json();
    if (data.data?.id) {
      return { platform: 'twitter', ok: true, id: data.data.id, url: `https://x.com/i/web/status/${data.data.id}` };
    }
    return { platform: 'twitter', ok: false, error: JSON.stringify(data) };
  } catch (err) {
    return { platform: 'twitter', ok: false, error: String(err) };
  }
}

// ── LINKEDIN API v2 ────────────────────────────────────────────────────────────

export async function postLinkedIn(text: string): Promise<PostResult> {
  const token = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  const personUrn = Deno.env.get('LINKEDIN_PERSON_URN');

  if (!token || !personUrn) {
    return { platform: 'linkedin', ok: false, error: 'LINKEDIN_ACCESS_TOKEN o LINKEDIN_PERSON_URN no configurados.' };
  }

  try {
    const body = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const id = res.headers.get('x-restli-id') || '';
      return { platform: 'linkedin', ok: true, id };
    }
    const err = await res.text();
    return { platform: 'linkedin', ok: false, error: err };
  } catch (err) {
    return { platform: 'linkedin', ok: false, error: String(err) };
  }
}

// ── BROADCAST — Publicar en todas las plataformas configuradas ─────────────────

export async function broadcastPost(params: {
  instagram?: { caption: string; imageUrl?: string };
  twitter?: string;
  linkedin?: string;
}): Promise<PostResult[]> {
  const tasks: Promise<PostResult>[] = [];

  if (params.instagram) tasks.push(postInstagram(params.instagram));
  if (params.twitter) tasks.push(postTwitter(params.twitter));
  if (params.linkedin) tasks.push(postLinkedIn(params.linkedin));

  if (!tasks.length) return [];
  return Promise.all(tasks);
}

// ── TEMPLATES — Copias listas para publicar ───────────────────────────────────

export function buildMisionCopy(mision: {
  titulo: string;
  presupuesto: number;
  comision: number;
  marcaNombre?: string;
}) {
  const ganancia = Math.round(mision.presupuesto * mision.comision / 100);

  return {
    instagram: `💎 NUEVA MISIÓN PARTTH\n\n"${mision.titulo}"\n\n💰 Presupuesto: $${mision.presupuesto.toLocaleString()} USD\n✅ Tu comisión: $${ganancia.toLocaleString()} (${mision.comision}%)\n🔒 Fondos en escrow — sin riesgo\n🤖 Validación IA obligatoria\n\n🔗 partth.com/app/marketplace\n\n#partth #marketplace #digitalmarketing #comisiones #dinerodigital #emprendimiento`,
    twitter: `🚨 Nueva misión en #PARTTH: "${mision.titulo}"\n\n💰 $${mision.presupuesto.toLocaleString()} USD bloqueados en escrow\n✅ Tu ganancia: $${ganancia.toLocaleString()} (${mision.comision}%)\n🤖 Score IA > 0.90 para cobrar\n\npartth.com/app/marketplace #escrow #ventas`,
    linkedin: `🚀 Nueva oportunidad en PARTTH — Infraestructura de Ventas y Confianza\n\n📋 Misión: "${mision.titulo}"\n💵 Presupuesto: $${mision.presupuesto.toLocaleString()} USD\n💰 Comisión: $${ganancia.toLocaleString()} (${mision.comision}%)\n\nSistema único: fondos bloqueados en escrow hasta validación por IA.\nSin riesgo de impago. Evidencia multimedia verificada.\n\n👉 partth.com/app/marketplace\n\n#partth #marketplace #ventas #emprendimiento #fintech`,
  };
}

export function buildDealCopy(deal: {
  productoNombre: string;
  ganancia: number;
  scoreIA: number;
}) {
  const score = (deal.scoreIA * 100).toFixed(1);
  return {
    instagram: `✅ DEAL CERRADO EN PARTTH\n\n"${deal.productoNombre}"\n\nScore de evidencia IA: ${score}%\nGanancia liberada: $${deal.ganancia.toLocaleString()} USD 💎\n\nAsí se ve cuando el sistema funciona.\n\n#partth #dealclosed #resultados #evidencia #escrow`,
    twitter: `✅ Deal cerrado en @PARTTH\n\n"${deal.productoNombre}" — Score IA: ${score}%\n💎 $${deal.ganancia.toLocaleString()} USD liberados al instante\n\n¿El sistema funciona? Aquí está la prueba. #PARTTH #resultados`,
    linkedin: `✅ Caso de éxito PARTTH\n\nMisión: "${deal.productoNombre}"\nScore de validación IA: ${score}%\nPago liberado: $${deal.ganancia.toLocaleString()} USD\n\nAsí funciona la infraestructura de confianza: evidencia multimedia, validación automática y liberación instantánea de fondos.\n\n#partth #casodeexito #automatizacion #ventas`,
  };
}
