import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Diamond, TrendingUp, Shield, AlertTriangle, Clock, CheckCircle, ArrowRight, Zap, Plus, Users, Building2, Award, Eye, FileCheck, Hammer } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { walletAPI, salasAPI } from '../../lib/api';
import { OnboardingChecklist } from '../components/OnboardingChecklist';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [salas, setSalas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      // Refresh every 30 seconds
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [walletData, salasData] = await Promise.all([
        walletAPI.getBalance(user!.id),
        salasAPI.getSalas(user!.id),
      ]);
      setWallet(walletData);
      setSalas(salasData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-[#00F2A6]/20 border-t-[#00F2A6] rounded-full animate-spin mb-6" />
        <p className="text-zinc-400 text-lg">Cargando tu dashboard...</p>
      </div>
    );
  }

  // Filtrar salas activas y recientes
  const salasActivas = salas.filter(s => s.estado === 'activa' || s.estado === 'en_revision').slice(0, 3);
  const salasPendientes = salas.filter(s => s.estado === 'pendiente_aprobacion' || s.estado === 'pendiente_evidencia');
  
  // Calcular reputación
  const totalCompletadas = salas.filter(s => s.estado === 'completada').length;
  const totalSalas = salas.length;
  const reputacion = totalSalas > 0 ? ((totalCompletadas / totalSalas) * 100).toFixed(1) : '0.0';

  // Determinar CTA según tipo de usuario
  const isMarca = userProfile?.userType === 'marca' || user?.user_metadata?.userType === 'marca';
  const isSocio = userProfile?.userType === 'socio' || user?.user_metadata?.userType === 'socio';

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Hola, {userProfile?.name || user?.email?.split('@')[0] || 'Usuario'} 👋
            </h1>
            <p className="text-zinc-400 text-lg">
              {isMarca ? 'Gestiona tus ofertas y contrata socios verificados' : 'Explora oportunidades y construye tu reputación'}
            </p>
          </div>
          
          {/* CTA según tipo de usuario */}
          {isMarca ? (
            <button
              onClick={() => navigate('/app/crear-oferta')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all flex items-center gap-2 group whitespace-nowrap"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Crear Oferta
            </button>
          ) : (
            <button
              onClick={() => navigate('/app/marketplace')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all flex items-center gap-2 group whitespace-nowrap"
            >
              <Zap className="w-5 h-5" />
              Explorar Ofertas
            </button>
          )}
        </div>
      </motion.div>

      {/* Diamond Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative group overflow-hidden cursor-pointer"
          onClick={() => navigate('/app/wallet')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#00F2A6]/20 rounded-2xl p-6 hover:border-[#00F2A6]/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00F2A6]/10 flex items-center justify-center">
                <Diamond className="w-5 h-5 text-[#00F2A6] fill-current" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Disponible</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{wallet?.disponible?.toLocaleString('es-ES') || 0}</p>
            <p className="text-[#00F2A6] text-sm font-semibold">${wallet?.disponible?.toLocaleString('es-ES') || 0} USD</p>
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0EA5E9]" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">En Escrow</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{wallet?.enEscrow?.toLocaleString('es-ES') || 0}</p>
            <p className="text-[#0EA5E9] text-sm font-semibold">{salas.filter(s => s.estado === 'activa').length} acuerdos activos</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">En Hold</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{wallet?.enHold?.toLocaleString('es-ES') || 0}</p>
            <p className="text-yellow-500 text-sm font-semibold">Liberación en 14 días</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative group overflow-hidden cursor-pointer"
          onClick={() => navigate('/app/reviews')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Reputación</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{reputacion}%</p>
            <p className="text-green-500 text-sm font-semibold">{totalCompletadas} completadas</p>
          </div>
        </motion.div>
      </div>

      {/* Alerts / Pending Actions */}
      {salasPendientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Tienes acciones pendientes</h3>
                <p className="text-zinc-400 mb-4">
                  {salasPendientes.length} {salasPendientes.length === 1 ? 'sala requiere' : 'salas requieren'} tu atención
                </p>
                <button
                  onClick={() => navigate('/app/salas')}
                  className="px-6 py-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 font-bold hover:bg-yellow-500/30 transition-all inline-flex items-center gap-2"
                >
                  Ver ahora
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link to="/app/marketplace" className="group block h-full">
            <div className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#00F2A6]/20 rounded-2xl p-6 hover:border-[#00F2A6]/40 transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 flex items-center justify-center mb-4">
                  {isMarca ? <Users className="w-6 h-6 text-[#00F2A6]" /> : <Building2 className="w-6 h-6 text-[#00F2A6]" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Marketplace</h3>
                <p className="text-zinc-400 mb-4 flex-1">
                  {isMarca ? 'Publicar ofertas y contratar socios' : 'Ver oportunidades disponibles'}
                </p>
                <div className="flex items-center gap-2 text-[#00F2A6] font-semibold">
                  {isMarca ? 'Ver ofertas' : 'Explorar'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link to="/app/salas" className="group block h-full">
            <div className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#0EA5E9]/20 rounded-2xl p-6 hover:border-[#0EA5E9]/40 transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#0EA5E9]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Salas Digitales</h3>
                <p className="text-zinc-400 mb-4 flex-1">Gestionar acuerdos protegidos con escrow</p>
                <div className="flex items-center gap-2 text-[#0EA5E9] font-semibold">
                  Ver salas
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <Link to="/app/work" className="group block h-full">
            <div className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#F59E0B]/20 rounded-2xl p-6 hover:border-[#F59E0B]/40 transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                  <Hammer className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Work</h3>
                <p className="text-zinc-400 mb-4 flex-1">
                  {isMarca ? 'Proyectos activos y aplicaciones recibidas' : 'Tareas activas, aplicaciones y completadas'}
                </p>
                <div className="flex items-center gap-2 text-[#F59E0B] font-semibold">
                  Ver trabajo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link to="/app/wallet" className="group block h-full">
            <div className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#8B5CF6]/20 rounded-2xl p-6 hover:border-[#8B5CF6]/40 transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center mb-4">
                  <Diamond className="w-6 h-6 text-[#8B5CF6] fill-current" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Wallet</h3>
                <p className="text-zinc-400 mb-4 flex-1">Recargar, retirar y gestionar diamantes</p>
                <div className="flex items-center gap-2 text-[#8B5CF6] font-semibold">
                  Ir a wallet
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Acuerdos Activos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Acuerdos Activos</h2>
          <Link to="/app/salas" className="text-[#00F2A6] hover:text-[#00F2A6]/80 font-semibold text-sm flex items-center gap-2 group">
            Ver todos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {salasActivas.length === 0 ? (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No tienes acuerdos activos</h3>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                {isMarca 
                  ? 'Crea tu primera oferta y conecta con socios verificados'
                  : 'Explora el marketplace y aplica a oportunidades'}
              </p>
              <button
                onClick={() => navigate(isMarca ? '/app/crear-oferta' : '/app/marketplace')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all inline-flex items-center gap-2"
              >
                {isMarca ? (
                  <>
                    <Plus className="w-5 h-5" />
                    Crear Primera Oferta
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Explorar Marketplace
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {salasActivas.map((sala, index) => {
              const estadoColor = sala.estado === 'activa' ? '#00F2A6' :
                                 sala.estado === 'en_revision' ? '#F59E0B' :
                                 '#0EA5E9';
              const estadoText = sala.estado === 'activa' ? 'ACTIVO' :
                                sala.estado === 'en_revision' ? 'REVISIÓN' :
                                'INICIANDO';
              const Icon = sala.estado === 'activa' ? CheckCircle :
                          sala.estado === 'en_revision' ? Clock :
                          Shield;
              
              // Calcular progreso
              let progreso = 10;
              if (sala.evidenciaEntregada) progreso = 70;
              if (sala.evidenciaAprobada) progreso = 100;

              return (
                <motion.div
                  key={sala.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link to={`/app/sala/${sala.id}`} className="group block">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                      <div className="relative bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 hover:border-[#00F2A6]/40 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-[#00F2A6] transition-colors">{sala.titulo}</h3>
                              <span 
                                className="px-3 py-1 rounded-xl text-xs font-bold"
                                style={{
                                  backgroundColor: `${estadoColor}10`,
                                  border: `1px solid ${estadoColor}30`,
                                  color: estadoColor
                                }}
                              >
                                {estadoText}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-3 line-clamp-1">{sala.descripcion}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Diamond className="w-4 h-4 text-[#00F2A6] fill-current" />
                                <span className="text-white font-bold">{sala.totalProducto?.toLocaleString('es-ES') || 0} 💎</span>
                              </div>
                              <div className="text-zinc-600">•</div>
                              <div className="text-zinc-500">
                                {new Date(sala.createdAt).toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                              backgroundColor: `${estadoColor}10`,
                              border: `1px solid ${estadoColor}30`
                            }}>
                              <Icon className="w-5 h-5" style={{ color: estadoColor }} />
                            </div>
                            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-[#00F2A6] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-zinc-800">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progreso}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9]"
                            />
                          </div>
                          <span className="text-[#00F2A6] text-sm font-bold min-w-[40px]">{progreso}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Timeline de Actividad */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Actividad Reciente</h2>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6">
            {salas.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500">No hay actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {salas.slice(0, 4).flatMap(sala => 
                  sala.timeline?.slice(-2).map((event: any, idx: number) => {
                    const iconMap: any = {
                      'creacion': { Icon: Shield, color: '#0EA5E9' },
                      'evidencia_entregada': { Icon: FileCheck, color: '#F59E0B' },
                      'evidencia_aprobada': { Icon: CheckCircle, color: '#10B981' },
                      'fondos_liberados': { Icon: TrendingUp, color: '#00F2A6' },
                      'disputa_abierta': { Icon: AlertTriangle, color: '#EF4444' },
                    };
                    const iconData = iconMap[event.tipo] || { Icon: Clock, color: '#94A3B8' };

                    return (
                      <motion.div
                        key={`${event.id}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-900/30 transition-colors"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${iconData.color}10`,
                            border: `1px solid ${iconData.color}30`
                          }}
                        >
                          <iconData.Icon className="w-5 h-5" style={{ color: iconData.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold leading-snug">{event.descripcion}</p>
                          <p className="text-zinc-500 text-sm truncate">Sala: {sala.titulo}</p>
                          <p className="text-zinc-600 text-xs mt-1">
                            {new Date(event.timestamp).toLocaleString('es-ES', { 
                              dateStyle: 'medium', 
                              timeStyle: 'short' 
                            })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ).filter(Boolean).slice(0, 5)}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Onboarding Checklist (solo si hay pasos pendientes) */}
      <OnboardingChecklist />
    </div>
  );
}