import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Diamond, Shield, Clock, TrendingUp, Award, Filter, Search, Users, Building2, CheckCircle, Zap, ArrowRight, AlertCircle } from 'lucide-react';
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

  const loadOfertas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/ofertas`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar ofertas');
      }

      const data = await response.json();
      setOfertas(data);
    } catch (err: any) {
      console.error('Error loading ofertas:', err);
      setError(err.message);
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Marketplace</h1>
            <p className="text-zinc-400 text-lg">Oportunidades protegidas con escrow · Evidencia obligatoria · Reputación verificable</p>
          </div>
          {(userProfile?.userType === 'marca' || user?.user_metadata?.userType === 'marca') && (
            <button
              onClick={() => navigate('/app/crear-oferta')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Crear Oferta
            </button>
          )}
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
          className={`px-6 py-3 font-bold transition-all border-b-2 relative ${
            activeTab === 'ofertas'
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
          className={`px-6 py-3 font-bold transition-all border-b-2 relative ${
            activeTab === 'socios'
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
            <div className="grid md:grid-cols-2 gap-6">
              {filteredOfertas.map((oferta, index) => (
                <motion.div
                  key={oferta.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                  <div className="relative bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 hover:border-[#00F2A6]/40 transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/30 text-[#00F2A6] text-xs font-bold">
                            🔒 ESCROW
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-bold">
                            {oferta.categoria}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{oferta.titulo}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">{oferta.descripcion}</p>
                      </div>
                    </div>

                    {/* Marca Info */}
                    <div className="bg-black/60 rounded-xl p-4 mb-4 border border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Marca</p>
                          <p className="text-white font-bold">{oferta.marcaNombre || 'Marca Verificada'}</p>
                        </div>
                        {oferta.marcaReputacion && (
                          <div className="text-right">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Reputación</p>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 font-bold">{oferta.marcaReputacion}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Diamond className="w-6 h-6 text-[#00F2A6] fill-current" />
                        <span className="text-white font-bold text-2xl">{oferta.presupuesto?.toLocaleString('es-ES') || 0}</span>
                        <span className="text-zinc-500">💎</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{oferta.aplicaciones || 0} aplicaciones</span>
                      </div>
                    </div>

                    {/* Comisión */}
                    <div className="mb-4 p-3 bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#0EA5E9] text-xs font-bold uppercase tracking-wider mb-1">Tu ganancia (Socio)</p>
                          <p className="text-white font-bold text-lg">{oferta.comisionSocio || 25}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-500 text-xs mb-1">Neto para ti</p>
                          <p className="text-[#00F2A6] font-bold text-lg">
                            {Math.round((oferta.presupuesto || 0) * ((oferta.comisionSocio || 25) / 100)).toLocaleString('es-ES')} 💎
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleAplicar(oferta.id)}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all flex items-center justify-center gap-2 group"
                    >
                      Ver Oferta Completa
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
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