import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Shield, FileCheck, Award, Lock, Diamond, Users, Building2, ArrowRight, CheckCircle, Zap, TrendingUp, Clock } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';

export function Landing() {
  const [stats, setStats] = useState({
    deals: 0,
    volume: 0,
    users: 0
  });

  // Animated counters
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        deals: Math.floor(Math.random() * 100) + 850,
        volume: Math.floor(Math.random() * 50000) + 450000,
        users: Math.floor(Math.random() * 200) + 2100
      });
    }, 3000);
    
    // Initial values
    setStats({
      deals: 847,
      volume: 447320,
      users: 2087
    });
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-[#00F2A6]/10 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30 group-hover:shadow-[#00F2A6]/50 transition-all">
              <Logo size={24} className="text-black" />
            </div>
            <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white to-[#00F2A6] bg-clip-text text-transparent">PARTTH</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/export" className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold hidden sm:block">
              Exportar
            </Link>
            <Link to="/pricing" className="text-zinc-400 hover:text-white transition-colors font-semibold hidden sm:block">
              Tarifas
            </Link>
            <Link to="/login">
              <button className="px-6 py-2.5 rounded-xl border border-[#00F2A6]/30 text-[#00F2A6] hover:bg-[#00F2A6]/10 transition-all font-semibold shadow-[0_0_20px_rgba(0,242,166,0.1)] hover:shadow-[0_0_30px_rgba(0,242,166,0.3)]">
                Iniciar Sesión
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Animated Glow effects */}
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#00F2A6]/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-20 right-1/4 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6 px-6 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5 backdrop-blur-sm"
          >
            <span className="text-[#00F2A6] font-semibold text-sm tracking-wider">MARKETPLACE FINTECH PROTEGIDO</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold mb-8 text-white leading-[1.05] tracking-tight"
          >
            Trabaja con Pruebas.<br />
            <span className="bg-gradient-to-r from-[#00F2A6] via-[#0EA5E9] to-[#00F2A6] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Cobra con Protección.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            El primer marketplace donde <span className="text-white font-semibold">cada pago está protegido</span>, 
            <span className="text-white font-semibold"> cada entrega verificada</span> y 
            <span className="text-white font-semibold"> cada disputa resuelta</span> con IA y evidencia.
          </motion.p>
          
          {/* Live Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-8 mb-12 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-zinc-500">En vivo:</span>
              <span className="text-white font-bold">{stats.deals}</span>
              <span className="text-zinc-500">acuerdos activos</span>
            </div>
            <div className="flex items-center gap-2">
              <Diamond className="w-4 h-4 text-[#00F2A6] fill-current" />
              <span className="text-white font-bold">${(stats.volume / 1000).toFixed(0)}K</span>
              <span className="text-zinc-500">en escrow</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0EA5E9]" />
              <span className="text-white font-bold">{stats.users}+</span>
              <span className="text-zinc-500">usuarios verificados</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link to="/role-selection">
              <button className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black hover:shadow-[0_0_60px_rgba(0,242,166,0.5)] transition-all font-bold text-lg flex items-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Soy Marca</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </Link>
            <Link to="/role-selection">
              <button className="group px-10 py-5 rounded-2xl border-2 border-[#00F2A6] text-[#00F2A6] hover:bg-[#00F2A6]/10 transition-all font-bold text-lg flex items-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#00F2A6]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Soy Socio</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-6 text-sm flex-wrap"
          >
            <div className="flex items-center gap-2 text-zinc-500">
              <Lock className="w-4 h-4 text-[#00F2A6]" />
              <span>Pagos en escrow</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <FileCheck className="w-4 h-4 text-[#0EA5E9]" />
              <span>Evidencia obligatoria</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Shield className="w-4 h-4 text-[#8B5CF6]" />
              <span>Resolución con IA</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-24 px-6 bg-gradient-to-b from-black via-[#0A0E1A]/50 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4 px-6 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5">
                <span className="text-[#00F2A6] font-semibold text-sm tracking-wider">SISTEMA ÚNICO</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Cómo Funciona</h2>
              <p className="text-zinc-400 text-xl max-w-2xl mx-auto">3 pilares que eliminan el riesgo en cada acuerdo</p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pilar 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/20 via-[#00F2A6]/5 to-transparent rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-50 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#00F2A6]/20 rounded-3xl p-8 hover:border-[#00F2A6]/40 transition-all h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F2A6]/20 to-[#00F2A6]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-[#00F2A6]" />
                </div>
                <div className="text-[#00F2A6] text-sm font-bold mb-2">PASO 1</div>
                <h3 className="text-2xl font-bold text-white mb-4">Fondos Bloqueados</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Cada pago se bloquea en escrow automáticamente. El dinero solo se libera cuando el trabajo es validado. 
                  <span className="text-white font-semibold"> Protección total para ambos.</span>
                </p>
              </div>
            </motion.div>

            {/* Pilar 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/20 via-[#0EA5E9]/5 to-transparent rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-50 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#0EA5E9]/20 rounded-3xl p-8 hover:border-[#0EA5E9]/40 transition-all h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0EA5E9]/20 to-[#0EA5E9]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <div className="text-[#0EA5E9] text-sm font-bold mb-2">PASO 2</div>
                <h3 className="text-2xl font-bold text-white mb-4">Evidencia Obligatoria</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Sin evidencia, no hay pago. Cada entrega requiere prueba verificable (capturas, enlaces, documentos). 
                  <span className="text-white font-semibold"> Sistema de validación con IA.</span>
                </p>
              </div>
            </motion.div>

            {/* Pilar 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-[#8B5CF6]/5 to-transparent rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-50 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#8B5CF6]/20 rounded-3xl p-8 hover:border-[#8B5CF6]/40 transition-all h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-[#8B5CF6]" />
                </div>
                <div className="text-[#8B5CF6] text-sm font-bold mb-2">PASO 3</div>
                <h3 className="text-2xl font-bold text-white mb-4">Reputación Inmutable</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Cada transacción construye tu historial público. Reviews verificadas, stats reales, transparencia total. 
                  <span className="text-white font-semibold"> Tu reputación es tu activo.</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN CLAVE - Salas Digitales */}
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        {/* Animated Glow */}
        <motion.div 
          className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-[#00F2A6]/5 rounded-full blur-[150px]"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-4 px-6 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5">
              <span className="text-[#00F2A6] font-semibold text-sm tracking-wider">TECNOLOGÍA PARTTH</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">Salas Digitales PARTTH</h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Cada acuerdo vive en una <span className="text-white font-semibold">Sala Digital blindada</span>.<br />
              Fondos bloqueados · Evidencia timestamped · Timeline inmutable · Resolución con IA
            </p>
          </motion.div>

          {/* Ejemplo Visual de Sala */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative group">
              {/* Glow de la tarjeta */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/20 via-[#0EA5E9]/10 to-transparent rounded-3xl blur-3xl group-hover:blur-[50px] transition-all" />
              
              {/* Tarjeta Principal */}
              <div className="relative bg-gradient-to-br from-zinc-900/80 to-black/90 border border-[#00F2A6]/30 rounded-3xl p-8 md:p-10 backdrop-blur-xl hover:border-[#00F2A6]/50 transition-all">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] border border-[#00F2A6]/30 flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                      <Shield className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Sala Digital Protegida</h3>
                      <p className="text-zinc-500 text-sm">Sistema de acuerdos verificables</p>
                    </div>
                  </div>
                  
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/30">
                    <span className="text-[#00F2A6] font-bold text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00F2A6] animate-pulse" />
                      ESCROW ACTIVO
                    </span>
                  </div>
                </div>

                {/* Participantes */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-black/60 rounded-2xl p-6 border border-[#00F2A6]/20 hover:border-[#00F2A6]/40 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-[#00F2A6]" />
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Marca</span>
                    </div>
                    <p className="text-white font-bold text-lg mb-1">Empresa Verificada</p>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#00F2A6]" />
                      <p className="text-zinc-400 text-sm">Rating: 4.9/5 · 142 deals</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/60 rounded-2xl p-6 border border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-[#0EA5E9]" />
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Socio</span>
                    </div>
                    <p className="text-white font-bold text-lg mb-1">Socio Verificado</p>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#0EA5E9]" />
                      <p className="text-zinc-400 text-sm">Rating: 5.0/5 · 89 deals</p>
                    </div>
                  </div>
                </div>

                {/* Fondos */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-[#00F2A6]/10 via-[#0EA5E9]/10 to-[#00F2A6]/10 rounded-2xl p-6 border border-[#00F2A6]/30">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                          <Diamond className="w-6 h-6 text-black fill-black" />
                        </div>
                        <div>
                          <p className="text-zinc-400 text-sm font-semibold mb-1">Bloqueados en Escrow</p>
                          <p className="text-3xl md:text-4xl font-bold text-white">5,000 💎</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-400 text-sm mb-1">Equivalente</p>
                        <p className="text-2xl md:text-3xl font-bold text-[#00F2A6]">$5,000</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-8">
                  <h4 className="text-white font-bold mb-5 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#00F2A6]" />
                    Timeline del Acuerdo
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-white font-semibold mb-1">Fondos bloqueados en escrow</p>
                        <p className="text-zinc-500 text-sm">Sistema de protección activado</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/20 border-2 border-[#0EA5E9] flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] animate-pulse" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-white font-semibold mb-1">Trabajo en progreso</p>
                        <p className="text-zinc-500 text-sm">Socio ejecutando la tarea</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 opacity-50">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/20 border-2 border-zinc-700 flex-shrink-0" />
                      <div className="flex-1 pt-1">
                        <p className="text-zinc-600 font-semibold mb-1">Validación de evidencia</p>
                        <p className="text-zinc-700 text-sm">Pendiente de entrega</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-4 py-2 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    🔒 Escrow Locked
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#0EA5E9] text-sm font-bold">
                    ✓ Proof Required
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-sm font-bold">
                    🛡️ Protected
                  </span>
                </div>

                {/* CTA */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Link to="/role-selection" className="block">
                    <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-[0_0_30px_rgba(0,242,166,0.5)] transition-all">
                      Crear mi Primera Sala
                    </button>
                  </Link>
                  <Link to="/pricing" className="block">
                    <button className="w-full px-6 py-4 rounded-xl border-2 border-[#00F2A6]/30 text-[#00F2A6] font-bold hover:bg-[#00F2A6]/10 transition-all">
                      Ver Cómo Funciona
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto"
          >
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#00F2A6]/30 transition-all">
                <Lock className="w-8 h-8 text-[#00F2A6]" />
              </div>
              <h4 className="text-white font-bold mb-2">Escrow Automático</h4>
              <p className="text-zinc-500 text-sm">Bloqueo instantáneo de fondos</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#0EA5E9]/30 transition-all">
                <FileCheck className="w-8 h-8 text-[#0EA5E9]" />
              </div>
              <h4 className="text-white font-bold mb-2">Validación IA</h4>
              <p className="text-zinc-500 text-sm">GPT-4 verifica evidencia</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#8B5CF6]/30 transition-all">
                <Shield className="w-8 h-8 text-[#8B5CF6]" />
              </div>
              <h4 className="text-white font-bold mb-2">Resolución de Disputas</h4>
              <p className="text-zinc-500 text-sm">Mediación estructurada</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-white font-bold mb-2">Historial Público</h4>
              <p className="text-zinc-500 text-sm">Reputación inmutable</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-[#0A0E1A]/30 to-black relative overflow-hidden">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00F2A6]/5 rounded-full blur-[200px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight leading-[1.1]">
            Elimina el riesgo.<br />
            <span className="bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] bg-clip-text text-transparent">
              Trabaja con confianza.
            </span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12 leading-relaxed max-w-2xl mx-auto">
            Únete al marketplace donde <span className="text-white font-semibold">cada acuerdo está blindado</span> por tecnología, 
            evidencia verificable y reputación inmutable.
          </p>
          <Link to="/role-selection">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 rounded-2xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold text-xl shadow-[0_0_60px_rgba(0,242,166,0.4)] hover:shadow-[0_0_80px_rgba(0,242,166,0.6)] transition-all inline-flex items-center gap-3"
            >
              Crear Cuenta Gratis
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </Link>
          
          <p className="text-zinc-600 text-sm mt-6">
            Sin tarjeta de crédito · Setup en 2 minutos · Comisión solo al cobrar
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00F2A6]/10 py-16 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                  <Logo size={24} className="text-black" />
                </div>
                <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white to-[#00F2A6] bg-clip-text text-transparent">PARTTH</span>
              </div>
              <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
                Marketplace fintech protegido. Conecta Marcas con Socios bajo un sistema de escrow, evidencia obligatoria y reputación verificable.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Producto</h3>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><Link to="/pricing" className="hover:text-[#00F2A6] transition-colors">Tarifas</Link></li>
                <li><Link to="/role-selection" className="hover:text-[#00F2A6] transition-colors">Comenzar</Link></li>
                <li><Link to="/login" className="hover:text-[#00F2A6] transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><Link to="/terms" className="hover:text-[#00F2A6] transition-colors">Términos</Link></li>
                <li><Link to="/privacy" className="hover:text-[#00F2A6] transition-colors">Privacidad</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-sm">
              © 2026 PARTTH. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sistema operativo
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}