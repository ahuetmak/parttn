import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Briefcase,
  Clock,
  CheckCircle,
  Shield,
  Diamond,
  AlertCircle,
  ArrowRight,
  FileText,
  Eye,
  Lock,
  Send,
  Timer,
  Search,
  Zap,
  Award,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { salasAPI, marketplaceAPI } from '../../lib/api';

type TabKey = 'activas' | 'aplicaciones' | 'completadas';

const estadoConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  activa: { label: 'Activa', color: 'text-[#00F2A6] bg-[#00F2A6]/10 border-[#00F2A6]/30', icon: Zap },
  esperando_evidencia: { label: 'Esperando Evidencia', color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30', icon: FileText },
  evidencia_entregada: { label: 'En Revision', color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30', icon: Eye },
  completada: { label: 'Completada', color: 'text-green-400 bg-green-500/10 border-green-500/30', icon: CheckCircle },
  en_disputa: { label: 'En Disputa', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: AlertCircle },
  en_hold: { label: 'En Hold', color: 'text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/30', icon: Timer },
};

const aplicacionEstado: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30' },
  aceptada: { label: 'Aceptada', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  rechazada: { label: 'Rechazada', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
};

export function Work() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('activas');
  const [salas, setSalas] = useState<any[]>([]);
  const [aplicaciones, setAplicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserType = userProfile?.userType || user?.user_metadata?.userType;

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const [salasData, appsData] = await Promise.allSettled([
        salasAPI.getSalas(user.id),
        marketplaceAPI.getMisAplicaciones(user.id),
      ]);

      if (salasData.status === 'fulfilled') {
        setSalas(salasData.value);
      }
      if (appsData.status === 'fulfilled') {
        setAplicaciones(appsData.value);
      }
    } catch (err: any) {
      console.error('Error loading work data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Categorize salas
  const salasActivas = salas.filter(
    (s) =>
      s.estado !== 'completada' &&
      s.estado !== 'cancelada'
  );
  const salasCompletadas = salas.filter((s) => s.estado === 'completada');
  const aplicacionesPendientes = aplicaciones.filter((a) => a.estado === 'pendiente');
  const aplicacionesAceptadas = aplicaciones.filter((a) => a.estado === 'aceptada');

  // Stats
  const totalEnEscrow = salasActivas.reduce(
    (sum, s) => sum + (s.totalProducto || 0),
    0
  );
  const totalGanado = salasCompletadas.reduce(
    (sum, s) => sum + (s.gananciaSocio || 0),
    0
  );

  const tabs: { key: TabKey; label: string; count: number; icon: React.ElementType }[] = [
    { key: 'activas', label: 'Activas', count: salasActivas.length, icon: Zap },
    { key: 'aplicaciones', label: 'Aplicaciones', count: aplicaciones.length, icon: Send },
    { key: 'completadas', label: 'Completadas', count: salasCompletadas.length, icon: CheckCircle },
  ];

  function getSalaEstado(sala: any): string {
    if (sala.tieneDisputa || sala.estado === 'en_disputa') return 'en_disputa';
    if (sala.enHold) return 'en_hold';
    if (sala.evidenciaAprobada || sala.estado === 'completada') return 'completada';
    if (sala.evidenciaEntregada) return 'evidencia_entregada';
    if (sala.estado === 'activa') return 'esperando_evidencia';
    return sala.estado || 'activa';
  }

  function getRolLabel(sala: any): string {
    if (!user) return '';
    if (sala.marcaId === user.id) return 'Marca';
    if (sala.socioId === user.id) return 'Socio';
    return '';
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          Work
        </h1>
        <p className="text-zinc-400 text-lg">
          {currentUserType === 'marca'
            ? 'Gestiona tus Salas Digitales, ofertas y proyectos activos'
            : 'Tus tareas activas, aplicaciones y proyectos completados'}
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#00F2A6]/20 rounded-2xl p-5 hover:border-[#00F2A6]/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#00F2A6]" />
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Activas
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{salasActivas.length}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#0EA5E9]/20 rounded-2xl p-5 hover:border-[#0EA5E9]/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-[#0EA5E9]" />
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                En Escrow
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {totalEnEscrow.toLocaleString('es-ES')}
              <span className="text-lg ml-1">💎</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#F59E0B]/20 rounded-2xl p-5 hover:border-[#F59E0B]/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Pendientes
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {aplicacionesPendientes.length}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-green-500/20 rounded-2xl p-5 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Diamond className="w-4 h-4 text-green-400" />
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Ganado
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {totalGanado.toLocaleString('es-ES')}
              <span className="text-lg ml-1">💎</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-[#00F2A6] text-[#00F2A6]'
                  : 'border-transparent text-zinc-500 hover:text-white'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="workTab"
                  className="absolute inset-0 bg-[#00F2A6]/5 rounded-t-xl"
                  transition={{ duration: 0.3 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2 text-sm">
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400">
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-[#00F2A6]/20 border-t-[#00F2A6] rounded-full animate-spin mb-4" />
          <p className="text-zinc-400">Cargando proyectos...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error al cargar datos</h3>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── TAB: Activas ── */}
      {!loading && activeTab === 'activas' && (
        <div className="space-y-4">
          {salasActivas.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Sin proyectos activos"
              description="Cuando una Marca acepte tu aplicacion y cree una Sala Digital, aparecera aqui."
              ctaLabel="Explorar Marketplace"
              ctaPath="/app/marketplace"
            />
          ) : (
            salasActivas.map((sala, index) => {
              const estado = getSalaEstado(sala);
              const config = estadoConfig[estado] || estadoConfig['activa'];
              const StatusIcon = config.icon;
              const rol = getRolLabel(sala);

              return (
                <motion.div
                  key={sala.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-5 md:p-6 hover:border-[#00F2A6]/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${config.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold">
                            {rol}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {sala.titulo || `Sala #${sala.id?.slice(0, 8)}`}
                        </h3>
                        <p className="text-zinc-500 text-sm truncate">
                          {sala.descripcion || 'Sin descripcion'}
                        </p>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">
                            Valor
                          </p>
                          <p className="text-white font-bold text-lg">
                            {(sala.totalProducto || 0).toLocaleString('es-ES')} 💎
                          </p>
                        </div>

                        <Link
                          to={`/app/sala/${sala.id}`}
                          className="px-4 py-2.5 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] hover:bg-[#00F2A6]/20 transition-all font-bold text-sm flex items-center gap-2 whitespace-nowrap"
                        >
                          Ver Sala
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {sala.timeline && sala.timeline.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  (sala.timeline.length / 5) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-zinc-500 text-xs whitespace-nowrap">
                            {sala.timeline.length} evento{sala.timeline.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB: Aplicaciones ── */}
      {!loading && activeTab === 'aplicaciones' && (
        <div className="space-y-4">
          {aplicaciones.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Sin aplicaciones"
              description="Aun no has aplicado a ninguna oferta. Explora el marketplace y envia tu primera propuesta."
              ctaLabel="Ir al Marketplace"
              ctaPath="/app/marketplace"
            />
          ) : (
            <>
              {/* Quick filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-zinc-500 text-sm">Filtro rapido:</span>
                <span className="px-3 py-1 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-bold">
                  {aplicacionesPendientes.length} pendiente{aplicacionesPendientes.length !== 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-bold">
                  {aplicacionesAceptadas.length} aceptada{aplicacionesAceptadas.length !== 1 ? 's' : ''}
                </span>
              </div>

              {aplicaciones.map((app, index) => {
                const appEstado = aplicacionEstado[app.estado] || aplicacionEstado['pendiente'];
                const createdDate = app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : '';

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-5 md:p-6 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${appEstado.color}`}
                          >
                            {appEstado.label}
                          </span>
                          {createdDate && (
                            <span className="text-zinc-600 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {createdDate}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {app.ofertaTitulo || 'Oferta'}
                        </h3>
                        <p className="text-zinc-500 text-sm line-clamp-2">
                          {app.propuesta}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">
                            Presupuesto
                          </p>
                          <p className="text-white font-bold">
                            {(app.presupuestoOferta || 0).toLocaleString('es-ES')} 💎
                          </p>
                        </div>

                        <Link
                          to={`/app/task/${app.ofertaId}`}
                          className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-white transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                        >
                          Ver Oferta
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── TAB: Completadas ── */}
      {!loading && activeTab === 'completadas' && (
        <div className="space-y-4">
          {salasCompletadas.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Sin proyectos completados"
              description="Cuando completes tu primer acuerdo con evidencia aprobada, aparecera aqui."
              ctaLabel="Ver Salas Activas"
              ctaPath="/app/salas"
            />
          ) : (
            salasCompletadas.map((sala, index) => {
              const rol = getRolLabel(sala);

              return (
                <motion.div
                  key={sala.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-5 md:p-6 hover:border-green-500/20 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold text-green-400 bg-green-500/10 border-green-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Completada
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold">
                          {rol}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {sala.titulo || `Sala #${sala.id?.slice(0, 8)}`}
                      </h3>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">
                          Ganancia
                        </p>
                        <p className="text-[#00F2A6] font-bold text-lg">
                          +{(sala.gananciaSocio || 0).toLocaleString('es-ES')} 💎
                        </p>
                      </div>

                      <Link
                        to={`/app/sala/${sala.id}`}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-white transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                      >
                        Detalle
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ── Empty state helper ── */
function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaPath,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLabel: string;
  ctaPath: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-zinc-600" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-zinc-400 mb-6 leading-relaxed">{description}</p>
        <Link
          to={ctaPath}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/30 transition-all"
        >
          <Search className="w-5 h-5" />
          {ctaLabel}
        </Link>
      </div>
    </motion.div>
  );
}
