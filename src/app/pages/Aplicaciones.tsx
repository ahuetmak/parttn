import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Aplicacion {
  id: string;
  ofertaId: string;
  ofertaTitulo: string;
  socioId: string;
  socioNombre: string;
  socioReputacion: number;
  propuesta: string;
  presupuestoOferta: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  createdAt: string;
  respondidaAt?: string;
}

export function Aplicaciones() {
  const { user, userProfile } = useAuth();
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'aceptada' | 'rechazada'>('todas');

  useEffect(() => {
    loadAplicaciones();
  }, [user]);

  const loadAplicaciones = async () => {
    if (!user) return;

    try {
      const userType = userProfile?.userType || user?.user_metadata?.userType;
      const endpoint =
        userType === 'marca'
          ? `/ofertas-aplicaciones/${user.id}`
          : `/mis-aplicaciones/${user.id}`;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAplicaciones(data);
      }
    } catch (error) {
      console.error('Error cargando aplicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespuesta = async (aplicacionId: string, accion: 'aceptar' | 'rechazar') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/aplicaciones/${aplicacionId}/${accion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ marcaId: user?.id }),
        }
      );

      if (response.ok) {
        loadAplicaciones();
      }
    } catch (error) {
      console.error('Error respondiendo aplicación:', error);
    }
  };

  const filteredAplicaciones =
    filter === 'todas'
      ? aplicaciones
      : aplicaciones.filter((app) => app.estado === filter);

  const stats = {
    total: aplicaciones.length,
    pendientes: aplicaciones.filter((a) => a.estado === 'pendiente').length,
    aceptadas: aplicaciones.filter((a) => a.estado === 'aceptada').length,
    rechazadas: aplicaciones.filter((a) => a.estado === 'rechazada').length,
  };

  const currentUserType = userProfile?.userType || user?.user_metadata?.userType;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00F2A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-black" />
            </div>
            {currentUserType === 'marca' ? 'Aplicaciones Recibidas' : 'Mis Aplicaciones'}
          </h1>
          <p className="text-zinc-400 text-lg">
            {currentUserType === 'marca'
              ? 'Revisa y gestiona las aplicaciones a tus ofertas'
              : 'Seguimiento de tus aplicaciones a ofertas del marketplace'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-5 h-5 text-[#00F2A6]" />
              <span className="text-zinc-400 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-zinc-900 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-zinc-400 text-sm">Pendientes</span>
            </div>
            <p className="text-3xl font-bold text-yellow-500">{stats.pendientes}</p>
          </div>

          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#00F2A6]" />
              <span className="text-zinc-400 text-sm">Aceptadas</span>
            </div>
            <p className="text-3xl font-bold text-[#00F2A6]">{stats.aceptadas}</p>
          </div>

          <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-zinc-400 text-sm">Rechazadas</span>
            </div>
            <p className="text-3xl font-bold text-red-500">{stats.rechazadas}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'todas' as const, label: 'Todas', icon: Briefcase },
            { value: 'pendiente' as const, label: 'Pendientes', icon: Clock },
            { value: 'aceptada' as const, label: 'Aceptadas', icon: CheckCircle2 },
            { value: 'rechazada' as const, label: 'Rechazadas', icon: XCircle },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                filter === f.value
                  ? 'bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-[#00F2A6]/20'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Aplicaciones */}
        {filteredAplicaciones.length === 0 ? (
          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay aplicaciones</h3>
            <p className="text-zinc-400 mb-6">
              {filter === 'todas'
                ? currentUserType === 'marca'
                  ? 'Aún no has recibido aplicaciones a tus ofertas.'
                  : 'No has aplicado a ninguna oferta todavía.'
                : `No hay aplicaciones ${filter}s.`}
            </p>
            {currentUserType === 'socio' && (
              <Link
                to="/app/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all"
              >
                Explorar Ofertas
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAplicaciones.map((app) => (
              <div
                key={app.id}
                className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-6 hover:border-[#00F2A6]/50 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Contenido Principal */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar del Socio */}
                      {currentUserType === 'marca' && (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center text-xl font-bold text-black flex-shrink-0">
                          {app.socioNombre.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        {/* Título y Estado */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {app.ofertaTitulo}
                            </h3>
                            {currentUserType === 'marca' && (
                              <Link
                                to={`/app/profile/${app.socioId}`}
                                className="text-[#00F2A6] hover:text-[#0EA5E9] font-semibold flex items-center gap-2"
                              >
                                {app.socioNombre}
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="w-3 h-3 fill-[#00F2A6]" />
                                  <span>{app.socioReputacion}/100</span>
                                </div>
                              </Link>
                            )}
                          </div>

                          {/* Badge de Estado */}
                          <div
                            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                              app.estado === 'pendiente'
                                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                : app.estado === 'aceptada'
                                ? 'bg-[#00F2A6]/20 text-[#00F2A6] border border-[#00F2A6]/30'
                                : 'bg-red-500/20 text-red-500 border border-red-500/30'
                            }`}
                          >
                            {app.estado === 'pendiente' && <Clock className="w-4 h-4" />}
                            {app.estado === 'aceptada' && <CheckCircle2 className="w-4 h-4" />}
                            {app.estado === 'rechazada' && <XCircle className="w-4 h-4" />}
                            {app.estado === 'pendiente' && 'Pendiente'}
                            {app.estado === 'aceptada' && 'Aceptada'}
                            {app.estado === 'rechazada' && 'Rechazada'}
                          </div>
                        </div>

                        {/* Propuesta */}
                        <div className="bg-black border border-[#00F2A6]/20 rounded-lg p-4 mb-4">
                          <p className="text-sm text-zinc-400 mb-2 font-semibold">Propuesta:</p>
                          <p className="text-white">{app.propuesta}</p>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-6 text-sm text-zinc-400">
                          <span className="flex items-center gap-2">
                            💎 {app.presupuestoOferta} DMT
                          </span>
                          <span>
                            Aplicó{' '}
                            {new Date(app.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          {app.respondidaAt && (
                            <span>
                              Respondida{' '}
                              {new Date(app.respondidaAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones (solo para Marcas con aplicaciones pendientes) */}
                    {currentUserType === 'marca' && app.estado === 'pendiente' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-[#00F2A6]/10">
                        <Link
                          to={`/app/profile/${app.socioId}`}
                          className="flex-1 px-4 py-3 bg-black border border-[#00F2A6]/30 rounded-xl text-white font-semibold hover:border-[#00F2A6] transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Perfil
                        </Link>
                        <button
                          onClick={() => handleRespuesta(app.id, 'aceptar')}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all flex items-center justify-center gap-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleRespuesta(app.id, 'rechazar')}
                          className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-2"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    )}

                    {/* Ver Oferta (para Socios) */}
                    {currentUserType === 'socio' && (
                      <Link
                        to={`/app/marketplace?oferta=${app.ofertaId}`}
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-black border border-[#00F2A6]/30 rounded-lg text-[#00F2A6] text-sm hover:border-[#00F2A6] transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Oferta Completa
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}