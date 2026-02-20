import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ========================================
// HELPER: Push notification to user
// ========================================

async function pushNotification(userId: string, notification: {
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}) {
  try {
    const existing = await kv.get(`notifications:${userId}`) || [];
    existing.unshift({
      id: crypto.randomUUID(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    });
    // Keep max 50 notifications
    if (existing.length > 50) existing.length = 50;
    await kv.set(`notifications:${userId}`, existing);
  } catch (err) {
    console.error(`Error pushing notification to ${userId}: ${err}`);
  }
}

// ========================================
// OFERTAS (MARKETPLACE)
// ========================================

export async function crearOferta(c: Context) {
  try {
    const oferta = await c.req.json();
    
    const nuevaOferta = {
      ...oferta,
      id: crypto.randomUUID(),
      estado: 'abierta',
      aplicaciones: [],
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`oferta:${nuevaOferta.id}`, nuevaOferta);
    
    return c.json(nuevaOferta);
  } catch (error) {
    console.error(`Error creando oferta: ${error}`);
    return c.json({ error: 'Error creando oferta' }, 500);
  }
}

export async function obtenerOfertas(c: Context) {
  try {
    const ofertas = await kv.getByPrefix('oferta:');
    
    // Filtrar solo ofertas abiertas
    const ofertasAbiertas = ofertas.filter((o: any) => o.estado === 'abierta');
    
    // Ordenar por fecha de creación (más recientes primero)
    ofertasAbiertas.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json(ofertasAbiertas);
  } catch (error) {
    console.error(`Error obteniendo ofertas: ${error}`);
    return c.json({ error: 'Error obteniendo ofertas' }, 500);
  }
}

export async function obtenerOferta(c: Context) {
  try {
    const ofertaId = c.req.param("ofertaId");
    const oferta = await kv.get(`oferta:${ofertaId}`);
    
    if (!oferta) {
      return c.json({ error: 'Oferta no encontrada' }, 404);
    }
    
    return c.json(oferta);
  } catch (error) {
    console.error(`Error obteniendo oferta: ${error}`);
    return c.json({ error: 'Error obteniendo oferta' }, 500);
  }
}

// ========================================
// APLICACIONES
// ========================================

export async function aplicarAOferta(c: Context) {
  try {
    const { ofertaId, socioId, socioNombre, socioReputacion, propuesta } = await c.req.json();
    
    const oferta = await kv.get(`oferta:${ofertaId}`);
    if (!oferta) {
      return c.json({ error: 'Oferta no encontrada' }, 404);
    }
    
    // Verificar que no haya aplicado antes
    const yaAplico = oferta.aplicaciones?.some((a: any) => a.socioId === socioId);
    if (yaAplico) {
      return c.json({ error: 'Ya aplicaste a esta oferta' }, 400);
    }
    
    const aplicacion = {
      id: crypto.randomUUID(),
      ofertaId,
      ofertaTitulo: oferta.titulo,
      marcaId: oferta.marcaId,
      socioId,
      socioNombre,
      socioReputacion,
      propuesta,
      presupuestoOferta: oferta.presupuesto,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
    };
    
    // Agregar a la oferta
    oferta.aplicaciones = oferta.aplicaciones || [];
    oferta.aplicaciones.push(aplicacion);
    await kv.set(`oferta:${ofertaId}`, oferta);
    
    // Guardar aplicación individual
    await kv.set(`aplicacion:${aplicacion.id}`, aplicacion);
    
    // Notificar a la marca
    await pushNotification(oferta.marcaId, {
      type: 'aplicacion',
      title: 'Nueva aplicación a tu oferta',
      message: `El socio ${socioNombre} ha aplicado a tu oferta "${oferta.titulo}".`,
      link: `/marketplace/ofertas/${ofertaId}`,
      metadata: { aplicacionId: aplicacion.id },
    });
    
    return c.json(aplicacion);
  } catch (error) {
    console.error(`Error aplicando a oferta: ${error}`);
    return c.json({ error: 'Error aplicando a oferta' }, 500);
  }
}

export async function obtenerAplicacionesMarca(c: Context) {
  try {
    const marcaId = c.req.param("marcaId");
    const aplicaciones = await kv.getByPrefix('aplicacion:');
    
    // Filtrar aplicaciones a ofertas de esta marca
    const aplicacionesMarca = aplicaciones.filter((a: any) => a.marcaId === marcaId);
    
    // Ordenar por fecha
    aplicacionesMarca.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json(aplicacionesMarca);
  } catch (error) {
    console.error(`Error obteniendo aplicaciones: ${error}`);
    return c.json({ error: 'Error obteniendo aplicaciones' }, 500);
  }
}

export async function obtenerMisAplicaciones(c: Context) {
  try {
    const socioId = c.req.param("socioId");
    const aplicaciones = await kv.getByPrefix('aplicacion:');
    
    // Filtrar aplicaciones de este socio
    const misAplicaciones = aplicaciones.filter((a: any) => a.socioId === socioId);
    
    // Ordenar por fecha
    misAplicaciones.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json(misAplicaciones);
  } catch (error) {
    console.error(`Error obteniendo mis aplicaciones: ${error}`);
    return c.json({ error: 'Error obteniendo aplicaciones' }, 500);
  }
}

export async function aceptarAplicacion(c: Context) {
  try {
    const aplicacionId = c.req.param("aplicacionId");
    const { marcaId } = await c.req.json();
    
    const aplicacion = await kv.get(`aplicacion:${aplicacionId}`);
    if (!aplicacion) {
      return c.json({ error: 'Aplicación no encontrada' }, 404);
    }
    
    if (aplicacion.marcaId !== marcaId) {
      return c.json({ error: 'No autorizado' }, 403);
    }
    
    aplicacion.estado = 'aceptada';
    aplicacion.respondidaAt = new Date().toISOString();
    await kv.set(`aplicacion:${aplicacionId}`, aplicacion);
    
    // Actualizar en la oferta
    const oferta = await kv.get(`oferta:${aplicacion.ofertaId}`);
    if (oferta) {
      const index = oferta.aplicaciones.findIndex((a: any) => a.id === aplicacionId);
      if (index !== -1) {
        oferta.aplicaciones[index] = aplicacion;
        await kv.set(`oferta:${aplicacion.ofertaId}`, oferta);
      }
    }
    
    // Notificar al socio
    await pushNotification(aplicacion.socioId, {
      type: 'aplicacion',
      title: 'Aplicación aceptada',
      message: `Tu aplicación a la oferta "${aplicacion.ofertaTitulo}" ha sido aceptada.`,
      link: `/marketplace/ofertas/${aplicacion.ofertaId}`,
      metadata: { aplicacionId: aplicacion.id },
    });
    
    return c.json(aplicacion);
  } catch (error) {
    console.error(`Error aceptando aplicación: ${error}`);
    return c.json({ error: 'Error aceptando aplicación' }, 500);
  }
}

export async function rechazarAplicacion(c: Context) {
  try {
    const aplicacionId = c.req.param("aplicacionId");
    const { marcaId } = await c.req.json();
    
    const aplicacion = await kv.get(`aplicacion:${aplicacionId}`);
    if (!aplicacion) {
      return c.json({ error: 'Aplicación no encontrada' }, 404);
    }
    
    if (aplicacion.marcaId !== marcaId) {
      return c.json({ error: 'No autorizado' }, 403);
    }
    
    aplicacion.estado = 'rechazada';
    aplicacion.respondidaAt = new Date().toISOString();
    await kv.set(`aplicacion:${aplicacionId}`, aplicacion);
    
    // Actualizar en la oferta
    const oferta = await kv.get(`oferta:${aplicacion.ofertaId}`);
    if (oferta) {
      const index = oferta.aplicaciones.findIndex((a: any) => a.id === aplicacionId);
      if (index !== -1) {
        oferta.aplicaciones[index] = aplicacion;
        await kv.set(`oferta:${aplicacion.ofertaId}`, oferta);
      }
    }
    
    // Notificar al socio
    await pushNotification(aplicacion.socioId, {
      type: 'aplicacion',
      title: 'Aplicación rechazada',
      message: `Tu aplicación a la oferta "${aplicacion.ofertaTitulo}" ha sido rechazada.`,
      link: `/marketplace/ofertas/${aplicacion.ofertaId}`,
      metadata: { aplicacionId: aplicacion.id },
    });
    
    return c.json(aplicacion);
  } catch (error) {
    console.error(`Error rechazando aplicación: ${error}`);
    return c.json({ error: 'Error rechazando aplicación' }, 500);
  }
}

// ========================================
// PERFIL PÚBLICO
// ========================================

export async function obtenerPerfilPublico(c: Context) {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    // No devolver información sensible
    const { password, ...publicProfile } = user;
    
    return c.json(publicProfile);
  } catch (error) {
    console.error(`Error obteniendo perfil: ${error}`);
    return c.json({ error: 'Error obteniendo perfil' }, 500);
  }
}

// ========================================
// REVIEWS
// ========================================

export async function crearReview(c: Context) {
  try {
    const { salaId, fromUserId, fromUserName, fromUserType, toUserId, toUserName, rating, comment } = await c.req.json();
    
    const review = {
      id: crypto.randomUUID(),
      salaId,
      fromUserId,
      fromUserName,
      fromUserType,
      toUserId,
      toUserName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`review:${review.id}`, review);
    
    // Actualizar reputación del usuario
    const user = await kv.get(`user:${toUserId}`);
    if (user) {
      // Calcular nueva reputación (promedio simple)
      const allReviews = await kv.getByPrefix('review:');
      const userReviews = allReviews.filter((r: any) => r.toUserId === toUserId);
      const avgRating = userReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / userReviews.length;
      
      user.reputation = Math.round((avgRating / 5) * 100); // Convertir a escala 0-100
      await kv.set(`user:${toUserId}`, user);
    }
    
    return c.json(review);
  } catch (error) {
    console.error(`Error creando review: ${error}`);
    return c.json({ error: 'Error creando review' }, 500);
  }
}

export async function obtenerReviews(c: Context) {
  try {
    const userId = c.req.param("userId");
    const allReviews = await kv.getByPrefix('review:');
    
    // Filtrar reviews recibidas por este usuario
    const userReviews = allReviews.filter((r: any) => r.toUserId === userId);
    
    // Ordenar por fecha
    userReviews.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json(userReviews);
  } catch (error) {
    console.error(`Error obteniendo reviews: ${error}`);
    return c.json({ error: 'Error obteniendo reviews' }, 500);
  }
}

export async function obtenerSalasPendientesReview(c: Context) {
  try {
    const userId = c.req.param("userId");
    
    // Obtener todas las salas del usuario que estén completadas
    const allSalas = await kv.getByPrefix('sala:');
    const salasCompletadas = allSalas.filter((s: any) => 
      (s.marcaId === userId || s.socioId === userId) && 
      s.estado === 'completada'
    );
    
    // Obtener reviews ya hechas
    const allReviews = await kv.getByPrefix('review:');
    const reviewsHechas = allReviews.filter((r: any) => r.fromUserId === userId);
    
    // Filtrar salas que no tienen review
    const pending = salasCompletadas
      .filter((sala: any) => !reviewsHechas.some((r: any) => r.salaId === sala.id))
      .map((sala: any) => ({
        salaId: sala.id,
        salaTitulo: sala.titulo,
        otherUserId: sala.marcaId === userId ? sala.socioId : sala.marcaId,
        otherUserName: sala.marcaId === userId ? 'Socio' : 'Marca', // TODO: obtener nombre real
        otherUserType: sala.marcaId === userId ? 'socio' : 'marca',
        completedAt: sala.timeline.find((t: any) => t.tipo === 'evidencia_aprobada')?.timestamp || sala.createdAt,
      }));
    
    return c.json(pending);
  } catch (error) {
    console.error(`Error obteniendo pendientes: ${error}`);
    return c.json({ error: 'Error obteniendo pendientes' }, 500);
  }
}