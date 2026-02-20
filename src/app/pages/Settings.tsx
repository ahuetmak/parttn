import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Ajustes</h1>
        <p className="text-[#94A3B8] text-lg">Configura tu cuenta y preferencias</p>
      </div>

      <div className="grid gap-6">
        {/* Perfil */}
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-[#00F2A6]" />
            <h2 className="text-2xl font-bold text-white">Perfil</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[#94A3B8] text-sm mb-2">Nombre completo</label>
              <input
                type="text"
                value="María González"
                className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F2A6]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] text-sm mb-2">Email</label>
              <input
                type="email"
                value="maria.gonzalez@example.com"
                className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F2A6]"
              />
            </div>
            <button className="px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all">
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#0EA5E9]" />
            <h2 className="text-2xl font-bold text-white">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-[#00F2A6]/10 cursor-pointer">
              <span className="text-white">Nuevas oportunidades en marketplace</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-[#00F2A6]/10 cursor-pointer">
              <span className="text-white">Evidencia subida en mis salas</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-[#00F2A6]/10 cursor-pointer">
              <span className="text-white">Fondos liberados</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#8B5CF6]" />
            <h2 className="text-2xl font-bold text-white">Seguridad</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full px-6 py-3 rounded-xl border-2 border-[#00F2A6]/30 text-[#00F2A6] font-bold hover:bg-[#00F2A6]/10 transition-all text-left">
              Cambiar contraseña
            </button>
            <button className="w-full px-6 py-3 rounded-xl border-2 border-[#00F2A6]/30 text-[#00F2A6] font-bold hover:bg-[#00F2A6]/10 transition-all text-left">
              Autenticación de dos factores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
