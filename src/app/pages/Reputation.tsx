import React from 'react';
import { Award, TrendingUp, Star } from 'lucide-react';

export function Reputation() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Reputación</h1>
        <p className="text-[#94A3B8] text-lg">Sistema verificable de historial</p>
      </div>

      {/* Current Reputation */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,242,166,0.3)]">
          <Award className="w-12 h-12 text-black" />
        </div>
        <h2 className="text-6xl font-bold text-white mb-2">98.5%</h2>
        <p className="text-[#00F2A6] text-xl mb-4">Excelente Reputación</p>
        <p className="text-[#94A3B8] max-w-md mx-auto">
          Basado en 47 acuerdos completados con evidencia verificada
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#10B981]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-[#10B981]" />
            <span className="text-[#64748B] text-sm font-semibold">COMPLETADOS</span>
          </div>
          <p className="text-4xl font-bold text-white">47</p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#00F2A6]" />
            <span className="text-[#64748B] text-sm font-semibold">EN TIEMPO</span>
          </div>
          <p className="text-4xl font-bold text-white">94%</p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-[#0EA5E9]" />
            <span className="text-[#64748B] text-sm font-semibold">APROBADOS</span>
          </div>
          <p className="text-4xl font-bold text-white">46</p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#EF4444]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-[#EF4444]" />
            <span className="text-[#64748B] text-sm font-semibold">DISPUTAS</span>
          </div>
          <p className="text-4xl font-bold text-white">1</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
        <h3 className="text-white font-bold text-xl mb-4">Cómo se Calcula tu Reputación</h3>
        <div className="space-y-3 text-[#94A3B8]">
          <p>
            <strong className="text-white">• Cumplimiento:</strong> Entrega dentro del SLA acordado
          </p>
          <p>
            <strong className="text-white">• Calidad:</strong> Evidencia aprobada sin solicitar cambios
          </p>
          <p>
            <strong className="text-white">• Comunicación:</strong> Respuesta a mensajes y actualizaciones
          </p>
          <p>
            <strong className="text-white">• Resolución:</strong> Disputas resueltas favorablemente
          </p>
        </div>
      </div>
    </div>
  );
}
