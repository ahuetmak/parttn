import { supabase } from './supabase';

const API_BASE_URL = 'https://bxcrcumkdzzdfepjetuw.supabase.co/functions/v1/make-server-1c8a6aaa';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
  };
}

// Wallet API
export const walletAPI = {
  async getBalance(userId: string) {
    const response = await fetch(`${API_BASE_URL}/wallet/${userId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo balance');
    return response.json();
  },

  async recharge(userId: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/wallet/recharge`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ userId, amount }),
    });
    if (!response.ok) throw new Error('Error procesando recarga');
    return response.json();
  },

  async withdraw(userId: string, amount: number, connectedAccountId?: string) {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ userId, amount, connectedAccountId }),
    });
    if (!response.ok) throw new Error('Error procesando retiro');
    return response.json();
  },

  async getTransactions(userId: string) {
    const response = await fetch(`${API_BASE_URL}/transactions/${userId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo transacciones');
    return response.json();
  },
};

// Salas API
export const salasAPI = {
  async getSalas(userId: string) {
    const response = await fetch(`${API_BASE_URL}/salas/${userId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo salas');
    return response.json();
  },

  async getSala(salaId: string) {
    const response = await fetch(`${API_BASE_URL}/sala/${salaId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo sala');
    return response.json();
  },

  async createSala(data: {
    marcaId: string;
    socioId: string;
    titulo: string;
    descripcion: string;
    totalProducto: number;
    comisionSocio: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/salas`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error creando sala');
    }
    return response.json();
  },

  async entregarEvidencia(salaId: string, socioId: string, notas: string, archivos: any[]) {
    const response = await fetch(`${API_BASE_URL}/sala/${salaId}/evidencia`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ socioId, notas, archivos }),
    });
    if (!response.ok) throw new Error('Error entregando evidencia');
    return response.json();
  },

  async aprobarEvidencia(salaId: string, marcaId: string) {
    const response = await fetch(`${API_BASE_URL}/sala/${salaId}/aprobar`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ marcaId }),
    });
    if (!response.ok) throw new Error('Error aprobando evidencia');
    return response.json();
  },

  async abrirDisputa(salaId: string, userId: string, razon: string, descripcion: string) {
    const response = await fetch(`${API_BASE_URL}/sala/${salaId}/disputa`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ userId, razon, descripcion }),
    });
    if (!response.ok) throw new Error('Error abriendo disputa');
    return response.json();
  },
};

// Marketplace API
export const marketplaceAPI = {
  async getOfertas() {
    const response = await fetch(`${API_BASE_URL}/ofertas`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo ofertas');
    return response.json();
  },

  async getOferta(ofertaId: string) {
    const response = await fetch(`${API_BASE_URL}/oferta/${ofertaId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo oferta');
    return response.json();
  },

  async crearOferta(data: {
    marcaId: string;
    marcaNombre: string;
    titulo: string;
    descripcion: string;
    categoria: string;
    presupuesto: number;
    comisionSocio: number;
    duracion: string;
    requisitos: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/ofertas`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creando oferta');
    return response.json();
  },

  async aplicarAOferta(data: {
    ofertaId: string;
    socioId: string;
    socioNombre: string;
    socioReputacion: number;
    propuesta: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/ofertas/${data.ofertaId}/aplicar`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error aplicando a oferta');
    return response.json();
  },

  async getAplicacionesMarca(marcaId: string) {
    const response = await fetch(`${API_BASE_URL}/ofertas-aplicaciones/${marcaId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo aplicaciones');
    return response.json();
  },

  async getMisAplicaciones(socioId: string) {
    const response = await fetch(`${API_BASE_URL}/mis-aplicaciones/${socioId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo aplicaciones');
    return response.json();
  },

  async aceptarAplicacion(aplicacionId: string, marcaId: string) {
    const response = await fetch(`${API_BASE_URL}/aplicaciones/${aplicacionId}/aceptar`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ marcaId }),
    });
    if (!response.ok) throw new Error('Error aceptando aplicación');
    return response.json();
  },

  async rechazarAplicacion(aplicacionId: string, marcaId: string) {
    const response = await fetch(`${API_BASE_URL}/aplicaciones/${aplicacionId}/rechazar`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ marcaId }),
    });
    if (!response.ok) throw new Error('Error rechazando aplicación');
    return response.json();
  },
};

// User API
export const userAPI = {
  async getPerfilPublico(userId: string) {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo perfil');
    return response.json();
  },
};

// Reviews API
export const reviewsAPI = {
  async crearReview(data: {
    salaId: string;
    fromUserId: string;
    fromUserName: string;
    fromUserType: string;
    toUserId: string;
    toUserName: string;
    rating: number;
    comment: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creando review');
    return response.json();
  },

  async getReviews(userId: string) {
    const response = await fetch(`${API_BASE_URL}/reviews/${userId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo reviews');
    return response.json();
  },

  async getPendingReviews(userId: string) {
    const response = await fetch(`${API_BASE_URL}/pending-reviews/${userId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo pendientes');
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  async getNotifications(userId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error obteniendo notificaciones');
    return response.json();
  },

  async markAsRead(notificationId: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Error marcando notificación');
    return response.json();
  },
};