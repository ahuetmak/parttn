import React, { useState } from 'react';
import { QrCode, Download, Share2, Eye, TrendingUp, Users, Link as LinkIcon } from 'lucide-react';

export function QRCenter() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'oferta' | 'sala'>('perfil');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">QR Center</h1>
        <p className="text-[#94A3B8] text-lg">Genera y gestiona códigos QR para trackear y compartir</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-5 h-5 text-[#00F2A6]" />
            <span className="text-[#64748B] text-sm font-semibold">VISTAS TOTALES</span>
          </div>
          <p className="text-4xl font-bold text-white">1,247</p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#0EA5E9]" />
            <span className="text-[#64748B] text-sm font-semibold">CONVERSIONES</span>
          </div>
          <p className="text-4xl font-bold text-white">89</p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#8B5CF6]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Share2 className="w-5 h-5 text-[#8B5CF6]" />
            <span className="text-[#64748B] text-sm font-semibold">QRS ACTIVOS</span>
          </div>
          <p className="text-4xl font-bold text-white">12</p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#10B981]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            <span className="text-[#64748B] text-sm font-semibold">TASA CONV.</span>
          </div>
          <p className="text-4xl font-bold text-white">7.1%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#00F2A6]/20">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'perfil'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-[#64748B] hover:text-white'
          }`}
        >
          QR de Perfil
        </button>
        <button
          onClick={() => setActiveTab('oferta')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'oferta'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-[#64748B] hover:text-white'
          }`}
        >
          QR de Oferta
        </button>
        <button
          onClick={() => setActiveTab('sala')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'sala'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-[#64748B] hover:text-white'
          }`}
        >
          QR de Sala
        </button>
      </div>

      {/* QR Generator */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* QR Preview */}
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {activeTab === 'perfil' && 'QR de tu Perfil'}
            {activeTab === 'oferta' && 'QR de Oferta'}
            {activeTab === 'sala' && 'QR de Sala Digital'}
          </h2>
          
          <div className="aspect-square bg-white rounded-2xl p-8 mb-6 flex items-center justify-center">
            <QrCode className="w-full h-full text-black" />
          </div>

          <div className="flex gap-3">
            <button className="flex-1 px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Descargar QR
            </button>
            <button className="flex-1 px-6 py-3 rounded-xl border-2 border-[#00F2A6]/30 text-[#00F2A6] font-bold hover:bg-[#00F2A6]/10 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartir
            </button>
          </div>
        </div>

        {/* QR Info & Config */}
        <div className="space-y-6">
          {activeTab === 'perfil' && (
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Tu Perfil Público</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Nombre visible</label>
                  <input
                    type="text"
                    value="María González"
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F2A6]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Bio</label>
                  <textarea
                    value="Especialista en marketing digital y redes sociales. +5 años de experiencia."
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F2A6] min-h-[100px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[#00F2A6]" />
                  <a href="#" className="text-[#00F2A6] hover:text-[#00F2A6]/80 text-sm">
                    partth.io/maria-gonzalez
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'oferta' && (
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Crear QR de Oferta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Título de la oferta</label>
                  <input
                    type="text"
                    placeholder="Ej: Campaña de marketing digital"
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Monto en 💎</label>
                  <input
                    type="number"
                    placeholder="2500"
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Descripción breve</label>
                  <textarea
                    placeholder="Describe la oferta..."
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] min-h-[100px]"
                  />
                </div>
                <button className="w-full px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all">
                  Generar QR de Oferta
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sala' && (
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">QR de Sala Digital</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Selecciona una sala</label>
                  <select className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F2A6]">
                    <option>Sala #2847 - Campaña marketing</option>
                    <option>Sala #2846 - Desarrollo web</option>
                    <option>Sala #2845 - Consultoría</option>
                  </select>
                </div>
                <div className="p-4 bg-[#00F2A6]/10 border border-[#00F2A6]/20 rounded-xl">
                  <p className="text-[#00F2A6] text-sm font-semibold mb-1">Uso del QR de Sala</p>
                  <p className="text-[#94A3B8] text-sm">
                    Comparte este QR para dar acceso directo al estado y evidencia de la sala.
                    Útil para validadores externos o stakeholders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Métricas */}
          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Métricas de este QR</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-[#00F2A6]/10">
                <span className="text-[#94A3B8]">Escaneos totales</span>
                <span className="text-white font-bold">247</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-[#00F2A6]/10">
                <span className="text-[#94A3B8]">Últimos 7 días</span>
                <span className="text-white font-bold">58</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-[#00F2A6]/10">
                <span className="text-[#94A3B8]">Conversiones</span>
                <span className="text-[#10B981] font-bold">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-[#00F2A6]/10">
                <span className="text-[#94A3B8]">Tasa de conversión</span>
                <span className="text-[#10B981] font-bold">4.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
            <QrCode className="w-6 h-6 text-[#00F2A6]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-xl mb-3">Usos de los Códigos QR en PARTH</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-[#00F2A6] font-bold mb-2">QR de Perfil</p>
                <p className="text-[#94A3B8] text-sm">
                  Comparte tu perfil verificado en eventos, tarjetas de presentación o redes sociales.
                  Aumenta tu visibilidad y genera conexiones.
                </p>
              </div>
              <div>
                <p className="text-[#0EA5E9] font-bold mb-2">QR de Oferta</p>
                <p className="text-[#94A3B8] text-sm">
                  Promociona oportunidades específicas en físico o digital. 
                  Trackea qué canales generan más interés.
                </p>
              </div>
              <div>
                <p className="text-[#8B5CF6] font-bold mb-2">QR de Sala</p>
                <p className="text-[#94A3B8] text-sm">
                  Comparte el progreso de un acuerdo con stakeholders.
                  Transparencia y validación externa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}