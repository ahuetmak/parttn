import React, { useState } from 'react';
import { Lock, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface CapsulaProps {
  sala: any;
  onGenerateStrategy: () => void;
}

export function CapsulaDeMision({ sala, onGenerateStrategy }: CapsulaProps) {
  const [showStrategy, setShowStrategy] = useState(false);

  const handleGenerate = () => {
    setShowStrategy(true);
    onGenerateStrategy();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF41]/20 via-[#00D1FF]/10 to-transparent rounded-3xl blur-3xl" />
      
      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] border-2 border-[#00FF41]/30 rounded-3xl p-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          {/* Left: Mission Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FF41] to-[#00D1FF] flex items-center justify-center shadow-lg shadow-[#00FF41]/30">
                <Target className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{sala?.titulo || 'Misión Activa'}</h2>
                <p className="text-zinc-400 text-sm">ID: {sala?.id?.substring(0, 8)}</p>
              </div>
            </div>
            
            <p className="text-zinc-300 text-lg mb-4 leading-relaxed">
              {sala?.descripcion || 'Descripción de la misión...'}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
                <span className="text-zinc-400">Estado:</span>
                <span className="text-white font-bold capitalize">{sala?.status || 'activa'}</span>
              </div>
              <div className="h-4 w-px bg-zinc-700" />
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Progreso:</span>
                <span className="text-[#00FF41] font-bold">
                  {sala?.tareas?.filter((t: any) => t.completada).length || 0} / {sala?.tareas?.length || 0} tareas
                </span>
              </div>
            </div>
          </div>

          {/* Right: Escrow Guarantee Card */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(0, 255, 65, 0.3)',
                '0 0 40px rgba(0, 255, 65, 0.5)',
                '0 0 20px rgba(0, 255, 65, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="lg:w-80 w-full bg-gradient-to-br from-[#00FF41]/10 to-[#00D1FF]/5 border-2 border-[#00FF41]/40 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#00FF41] animate-pulse" />
              <span className="text-[#00FF41] font-bold uppercase tracking-wider text-sm">
                Garantía de Fondos
              </span>
            </div>
            
            <p className="text-5xl font-bold text-white mb-2">
              ${sala?.montoTotal?.toLocaleString('es-ES') || '0'}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm">Estado:</span>
              <div className="px-3 py-1 rounded-full bg-[#FFA500]/20 border border-[#FFA500]/40">
                <span className="text-[#FFA500] font-bold text-xs uppercase tracking-wider">
                  Bloqueado a tu favor
                </span>
              </div>
            </div>

            <p className="text-zinc-500 text-xs leading-relaxed">
              Fondos protegidos en Escrow. Se liberan automáticamente al completar todas las tareas y validar evidencia.
            </p>
          </motion.div>
        </div>

        {/* AI Assist Button - "Botón de Poder" */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <button
            onClick={handleGenerate}
            className="group w-full lg:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-[#00FF41] to-[#00D1FF] text-black hover:shadow-[0_0_60px_rgba(0,255,65,0.6)] transition-all font-bold text-lg flex items-center justify-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10">🤖 Generar Estrategia de Venta con IA</span>
            <Zap className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
          </button>

          {/* Strategy Dropdown */}
          {showStrategy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
              className="mt-4 p-6 bg-[#0F0F0F] border border-[#00D1FF]/30 rounded-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0A0A0A] border border-[#00D1FF]/20 rounded-xl hover:border-[#00D1FF]/40 transition-all cursor-pointer">
                  <h4 className="text-[#00D1FF] font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Script de Venta
                  </h4>
                  <p className="text-zinc-400 text-sm">
                    Texto persuasivo optimizado con gatillos psicológicos para cerrar la venta.
                  </p>
                </div>
                
                <div className="p-4 bg-[#0A0A0A] border border-[#00D1FF]/20 rounded-xl hover:border-[#00D1FF]/40 transition-all cursor-pointer">
                  <h4 className="text-[#00D1FF] font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Imágenes para Redes
                  </h4>
                  <p className="text-zinc-400 text-sm">
                    Templates visuales optimizados para Instagram, Facebook y TikTok.
                  </p>
                </div>
                
                <div className="p-4 bg-[#0A0A0A] border border-[#00D1FF]/20 rounded-xl hover:border-[#00D1FF]/40 transition-all cursor-pointer">
                  <h4 className="text-[#00D1FF] font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Guía de Cierre
                  </h4>
                  <p className="text-zinc-400 text-sm">
                    Paso a paso para manejar objeciones y cerrar el trato exitosamente.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
