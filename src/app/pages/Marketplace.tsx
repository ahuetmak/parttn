import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Diamond, Shield, Clock, TrendingUp, Award, Filter, Search, Users, Building2, CheckCircle, Zap, ArrowRight, AlertCircle, Cpu, Star, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useAuth } from '../context/AuthContext';

export function Marketplace() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'ofertas' | 'socios'>('ofertas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categorias = ['todas', 'Marketing', 'Desarrollo', 'Diseño', 'Contenido', 'Consultoría', 'Ventas'];

  // Load ofertas from backend
  useEffect(() => {
    loadOfertas();
  }, []);

  // Misiones de alto valor garantizadas — siempre visibles aunque el backend falle
  const MISIONES_GARANTIZADAS = [
    {
      id: 'oferta-lanzamiento-viral-partth',
      titulo: 'Estrategia de Lanzamiento Viral',
      descripcion: 'Plan completo de lanzamiento en redes sociales con 5 videos IA, estrategia de contenido viral y growth hacking. Entregables validados por IA score ≥ 90%.',
      categoria: 'Marketing', presupuesto: 2500, comisionSocio: 30, duracion: '14 días',
      estado: 'abierta', aplicaciones: 0, nivel: 'PREMIUM', badge: 'ALTO_VALOR',
      marcaNombre: 'PARTTH Official', partthOriginal: true,
      feePARTTH: 375, fondoReserva: 50, gananciaSocio: 750,
      createdAt: new Date().toISOString(),
      requisitos: ['Plan de Social Media (PDF)', '5 Videos con IA generados', 'Métricas de alcance (screenshots)', 'Report de engagement', 'Template de contenido viral'],
    },
    {
      id: 'oferta-automatizacion-abacus-partth',
      titulo: 'Automatización de Ventas con Abacus',
      descripcion: 'Configuración completa de bots de ventas con IA, 50 leads validados y pipeline automatizado con seguimiento en tiempo real.',
      categoria: 'Ventas', presupuesto: 5000, comisionSocio: 25, duracion: '21 días',
      estado: 'abierta', aplicaciones: 0, nivel: 'ELITE', badge: 'ELITE_MISSION',
      marcaNombre: 'PARTTH Official', partthOriginal: true,
      feePARTTH: 750, fondoReserva: 100, gananciaSocio: 1250,
      createdAt: new Date().toISOString(),
      requisitos: ['Configuración de Bots documentada', '50 Leads validados con datos', 'Pipeline screenshot', 'Reporte de conversiones', 'Video de demostración del sistema'],
    },
    {
      id: 'oferta-afiliacion-highticket-partth',
      titulo: 'Campaña de Afiliación High-Ticket',
      descripcion: 'Embudo de ventas completo para productos de alto valor. 10 cierres confirmados, scripts personalizados y sistema de seguimiento con evidencia de cada transacción.',
      categoria: 'Ventas', presupuesto: 10000, comisionSocio: 20, duracion: '30 días',
      estado: 'abierta', aplicaciones: 0, nivel: 'ELITE', badge: 'ELITE_MISSION',
      marcaNombre: 'PARTTH Official', partthOriginal: true,
      feePARTTH: 1500, fondoReserva: 200, gananciaSocio: 2000,
      createdAt: new Date().toISOString(),
      requisitos: ['Embudo documentado (screenshots)', '10 comprobantes de cierre', 'Video proceso de venta', 'Capturas de cada transacción', 'Reporte final de resultados'],
    },
  ];

  const loadOfertas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/ofertas`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );

      if (!response.ok) throw new Error('Backend no disponible');

      const data = await response.json();

      if (!data || data.length === 0) {
        // Backend vacío — mostrar misiones garantizadas mientras se siembra el backend
        setOfertas(MISIONES_GARANTIZADAS);

        // Intentar seed en background sin bloquear la UI
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/admin/seed-marketplace`,
          { method: 'POST', headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' }, body: '{}' }
        ).catch(() => {/* no bloquear */});
      } else {
        // Combinar misiones del backend + garantizadas (sin duplicados por id)
        const backendIds = new Set(data.map((o: any) => o.id));
        const extras = MISIONES_GARANTIZADAS.filter(m => !backendIds.has(m.id));
        setOfertas([...data, ...extras]);
      }
    } catch (err: any) {
      // Si el backend falla, mostrar misiones garantizadas sin error visible
      console.warn('Backend no disponible, usando misiones locales:', err.message);
      setOfertas(MISIONES_GARANTIZADAS);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfertas = ofertas.filter((oferta) => {
    const matchesSearch =
      oferta.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oferta.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategoria = filterCategoria === 'todas' || oferta.categoria === filterCategoria;
    return matchesSearch && matchesCategoria && oferta.estado === 'abierta';
  });

  const handleAplicar = (ofertaId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const currentUserType = userProfile?.userType || user?.user_metadata?.userType;
    if (currentUserType === 'marca') {
      alert('Las Marcas no pueden aplicar a ofertas. Solo los Socios pueden aplicar.');
      return;
    }
    navigate(`/app/task/${ofertaId}`);
  };

  const totalVolume = ofertas
    .filter((o) => o.estado === 'abierta')
    .reduce((sum, o) => sum + (o.presupuesto || 0), 0);
  const avgPago = ofertas.length > 0 ? totalVolume / ofertas.length : 0;
  const avgRep = ofertas.length > 0
    ? ofertas.reduce((sum, o) => sum + (o.marcaReputacion || 0), 0) / ofertas.length
    : 0;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black text-white tracking-tight">Marketplace</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00F2A6]/10 border border-[#00F2A6]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2A6] animate-pulse" />
                <span className="text-[#00F2A6] text-xs font-black">LIVE</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm">Escrow automático · Evidencia obligatoria · IA Auditor Score ≥ 90%</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/app/agente-ia"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#00F2A6]/30 bg-[#00F2A6]/5 text-[#00F2A6] font-bold text-sm hover:bg-[#00F2A6]/10 transition-all"
            >
              <Cpu className="w-4 h-4" />
              Agente IA
            </Link>
            {(userProfile?.userType === 'marca' || user?.user_metadata?.userType === 'marca') && (
              <button
                onClick={() => navigate('/app/crear-oferta')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black hover:shadow-lg hover:shadow-[#00F2A6]/40 transition-all flex items-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4" />
                Publicar Misión
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#00F2A6]/20 rounded-2xl p-6 hover:border-[#00F2A6]/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F2A6]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#00F2A6]" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Ofertas Activas</span>
            </div>
            <p className="text-4xl font-bold text-white">{ofertas.filter((o) => o.estado === 'abierta').length}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#0EA5E9]/20 rounded-2xl p-6 hover:border-[#0EA5E9]/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
                <Diamond className="w-5 h-5 text-[#0EA5E9] fill-current" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Volumen Total</span>
            </div>
            <p className="text-4xl font-bold text-white">{totalVolume.toLocaleString('es-ES')} 💎</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#8B5CF6]/20 rounded-2xl p-6 hover:border-[#8B5CF6]/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Promedio</span>
            </div>
            <p className="text-4xl font-bold text-white">{Math.round(avgPago).toLocaleString('es-ES')} 💎</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Rep. Promedio</span>
            </div>
            <p className="text-4xl font-bold text-white">{avgRep > 0 ? avgRep.toFixed(1) : '—'}%</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('ofertas')}
          className={`px-6 py-3 font-bold transition-all border-b-2 relative ${activeTab === 'ofertas'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-zinc-500 hover:text-white'
            }`}
        >
          {activeTab === 'ofertas' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-[#00F2A6]/5 rounded-t-xl"
              transition={{ duration: 0.3 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Ofertas de Marcas
          </span>
        </button>
        <button
          onClick={() => setActiveTab('socios')}
          className={`px-6 py-3 font-bold transition-all border-b-2 relative ${activeTab === 'socios'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-zinc-500 hover:text-white'
            }`}
        >
          {activeTab === 'socios' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-[#00F2A6]/5 rounded-t-xl"
              transition={{ duration: 0.3 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Directorio de Socios
          </span>
        </button>
      </div>

      {activeTab === 'ofertas' && (
        <>
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 flex items-center gap-3 bg-zinc-900/50 px-4 py-3.5 rounded-xl border border-zinc-800 focus-within:border-[#00F2A6]/30 transition-colors">
              <Search className="w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por título, descripción, categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-3.5 rounded-xl border border-zinc-800">
              <Filter className="w-5 h-5 text-zinc-500" />
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat} className="bg-black">
                    {cat === 'todas' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-[#00F2A6]/20 border-t-[#00F2A6] rounded-full animate-spin mb-4" />
              <p className="text-zinc-400">Cargando ofertas...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Error al cargar ofertas</h3>
              <p className="text-zinc-400 mb-4">{error}</p>
              <button
                onClick={loadOfertas}
                className="px-6 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredOfertas.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No se encontraron ofertas</h3>
                <p className="text-zinc-400 mb-6">
                  {searchQuery || filterCategoria !== 'todas'
                    ? 'Prueba ajustando los filtros de búsqueda'
                    : 'Aún no hay ofertas publicadas en el marketplace'}
                </p>
                {(userProfile?.userType === 'marca' || user?.user_metadata?.userType === 'marca') && (
                  <button
                    onClick={() => navigate('/app/crear-oferta')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all inline-flex items-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Crear Primera Oferta
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Ofertas Grid */}
          {!loading && !error && filteredOfertas.length > 0 && (
            <div className="grid md:grid-cols-2 gap-5">
              {filteredOfertas.map((oferta, index) => {
                const ganancia = Math.round((oferta.presupuesto || 0) * ((oferta.comisionSocio || 25) / 100));
                const nivelColor: Record<string, string> = { ELITE: '#F59E0B', PREMIUM: '#8B5CF6', ALTO_VALOR: '#0EA5E9', default: '#00F2A6' };
                const nivel = oferta.nivel || 'default';
                const nColor = nivelColor[nivel] || nivelColor.default;

                return (
                  <motion.div
                    key={oferta.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${nColor}15, transparent 70%)` }} />

                    <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 hover:border-zinc-700 transition-all overflow-hidden">
                      {/* Glow corner */}
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                        style={{ background: nColor }} />

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
                        <span className="px-2.5 py-1 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/25 text-[#00F2A6] text-xs font-black">
                          🔒 ESCROW
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black border"
                          style={{ background: `${nColor}10`, borderColor: `${nColor}25`, color: nColor }}>
                          {nivel === 'ELITE' ? '👑 ELITE' : nivel === 'PREMIUM' ? '⚡ PREMIUM' : nivel === 'ALTO_VALOR' ? '🔥 ALTO VALOR' : oferta.categoria}
                        </span>
                        {oferta.badge === 'VERIFICADO' || oferta.marcaNombre?.includes('PARTTH') ? (
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-black flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-[#00F2A6]" /> PARTTH ORIGINAL
                          </span>
                        ) : null}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-black text-white mb-2 leading-tight relative z-10">{oferta.titulo}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-4 relative z-10">{oferta.descripcion}</p>

                      {/* Split visual */}
                      <div className="mb-4 relative z-10">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-zinc-600 text-xs font-bold">Split del pago</span>
                          <span className="text-zinc-600 text-xs">${(oferta.presupuesto || 0).toLocaleString()} total</span>
                        </div>
                        <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                          <div className="bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] rounded-l-full"
                            style={{ width: `${oferta.comisionSocio || 25}%` }} />
                          <div className="bg-zinc-700 rounded-r-full flex-1" />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[#00F2A6] text-xs font-bold">{oferta.comisionSocio || 25}% Socio</span>
                          <span className="text-zinc-600 text-xs">15% PARTTH · 2% Reserva</span>
                        </div>
                      </div>

                      {/* Pago principal */}
                      <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-black/50 border border-zinc-800/60 relative z-10">
                        <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-0.5">Tu comisión</p>
                          <div className="flex items-center gap-2">
                            <Diamond className="w-4 h-4 fill-current" style={{ color: nColor }} />
                            <span className="text-2xl font-black text-white">{ganancia.toLocaleString()}</span>
                            <span className="text-zinc-500 text-sm">💎</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-500 text-xs mb-0.5">Aplicaciones</p>
                          <div className="flex items-center gap-1.5 justify-end">
                            <Users className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-white font-bold">{oferta.aplicaciones || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Requisitos preview */}
                      {oferta.requisitos?.length > 0 && (
                        <div className="mb-4 relative z-10">
                          <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider mb-2">Checklist IA ({oferta.requisitos.length} ítems)</p>
                          <div className="space-y-1">
                            {oferta.requisitos.slice(0, 2).map((req: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                                <div className="w-1 h-1 rounded-full bg-[#00F2A6]" />
                                {req}
                              </div>
                            ))}
                            {oferta.requisitos.length > 2 && (
                              <div className="text-xs text-zinc-600">+{oferta.requisitos.length - 2} más...</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="grid grid-cols-2 gap-2 relative z-10">
                        <Link
                          to={`/app/agente-ia?mision=${encodeURIComponent(oferta.titulo)}&precio=${oferta.presupuesto}&comision=${oferta.comisionSocio || 25}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs hover:border-[#00F2A6]/30 hover:text-[#00F2A6] transition-all"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          Generar Script
                        </Link>
                        <button
                          onClick={() => handleAplicar(oferta.id)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs text-black hover:shadow-lg transition-all"
                          style={{ background: `linear-gradient(135deg, ${nColor}, #0EA5E9)` }}
                        >
                          Aplicar Ahora
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'socios' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#00F2A6]" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Directorio de Socios</h3>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Explora perfiles verificados de Socios con reputación, portfolio y reviews reales.
              <br />
              <span className="text-white font-semibold">Próximamente disponible.</span>
            </p>
            <div className="px-6 py-3 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] inline-flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4" />
              En desarrollo
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}