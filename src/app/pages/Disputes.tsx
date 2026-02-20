import React, { useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, Shield, FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

const disputes = [
  {
    id: 1,
    salaId: 2842,
    title: 'Integración API externa',
    marca: 'DevCompany',
    socio: 'Miguel Ángel',
    diamonds: 5000,
    motivo: 'Evidencia incompleta',
    descripcion: 'El código entregado no incluye los webhooks solicitados',
    estado: 'abierta',
    createdAt: 'Hace 1 día',
  },
  {
    id: 2,
    salaId: 2839,
    title: 'Campaña publicitaria',
    marca: 'MarketPro',
    socio: 'Laura Sánchez',
    diamonds: 3200,
    motivo: 'Métricas no cumplidas',
    descripcion: 'Las impresiones son 40% menores a lo acordado',
    estado: 'en_revision',
    createdAt: 'Hace 3 días',
  },
  {
    id: 3,
    salaId: 2835,
    title: 'Rediseño de sitio web',
    marca: 'WebStudio',
    socio: 'Carlos Méndez',
    diamonds: 4500,
    motivo: 'Incumplimiento de deadline',
    descripcion: 'Entrega tardía sin aviso previo',
    estado: 'resuelta_parcial',
    createdAt: 'Hace 1 semana',
    resolucion: 'Pago parcial: 70% liberado',
  },
];

export function Disputes() {
  const [filterEstado, setFilterEstado] = useState<'todas' | 'abierta' | 'en_revision' | 'resuelta'>('todas');

  const estadoConfig = {
    abierta: {
      label: 'ABIERTA',
      color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
      icon: AlertTriangle,
    },
    en_revision: {
      label: 'EN REVISIÓN',
      color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
      icon: Eye,
    },
    resuelta_parcial: {
      label: 'RESUELTA (PARCIAL)',
      color: 'text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/30',
      icon: CheckCircle,
    },
    resuelta_completa: {
      label: 'RESUELTA (COMPLETA)',
      color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
      icon: CheckCircle,
    },
  };

  const filteredDisputes = filterEstado === 'todas' 
    ? disputes 
    : disputes.filter(d => d.estado === filterEstado);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Disputas</h1>
        <p className="text-[#94A3B8] text-lg">Sistema de resolución estructurada</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#EF4444]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            <span className="text-[#64748B] text-sm font-semibold">ABIERTAS</span>
          </div>
          <p className="text-4xl font-bold text-white">
            {disputes.filter(d => d.estado === 'abierta').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#F59E0B]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-[#64748B] text-sm font-semibold">EN REVISIÓN</span>
          </div>
          <p className="text-4xl font-bold text-white">
            {disputes.filter(d => d.estado === 'en_revision').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#10B981]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-[#64748B] text-sm font-semibold">RESUELTAS</span>
          </div>
          <p className="text-4xl font-bold text-white">
            {disputes.filter(d => d.estado.includes('resuelta')).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-[#00F2A6]" />
            <span className="text-[#64748B] text-sm font-semibold">TASA ÉXITO</span>
          </div>
          <p className="text-4xl font-bold text-white">92%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterEstado('todas')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'todas'
                ? 'bg-[#00F2A6]/10 text-[#00F2A6] border border-[#00F2A6]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterEstado('abierta')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'abierta'
                ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            Abiertas
          </button>
          <button
            onClick={() => setFilterEstado('en_revision')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'en_revision'
                ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            En Revisión
          </button>
          <button
            onClick={() => setFilterEstado('resuelta')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'resuelta'
                ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            Resueltas
          </button>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-6">
        {filteredDisputes.map((dispute) => {
          const config = estadoConfig[dispute.estado as keyof typeof estadoConfig];
          const Icon = config.icon;

          return (
            <div
              key={dispute.id}
              className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#EF4444]/20 rounded-2xl p-6 hover:border-[#EF4444]/40 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link to={`/app/sala/${dispute.salaId}`}>
                      <h3 className="text-xl font-bold text-white hover:text-[#00F2A6] transition-colors">
                        Disputa - Sala #{dispute.salaId}
                      </h3>
                    </Link>
                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] mb-1">{dispute.title}</p>
                  <p className="text-[#64748B] text-sm">{dispute.createdAt}</p>
                </div>
                <Icon className="w-6 h-6 text-[#EF4444]" />
              </div>

              {/* Participants */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/40 rounded-xl p-3 border border-[#00F2A6]/10">
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">
                    Marca
                  </p>
                  <p className="text-white font-semibold">{dispute.marca}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-[#0EA5E9]/10">
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">
                    Socio
                  </p>
                  <p className="text-white font-semibold">{dispute.socio}</p>
                </div>
              </div>

              {/* Dispute Info */}
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  <p className="text-[#EF4444] font-bold text-sm">Motivo de Disputa</p>
                </div>
                <p className="text-white font-semibold mb-1">{dispute.motivo}</p>
                <p className="text-[#94A3B8] text-sm">{dispute.descripcion}</p>
              </div>

              {/* Resolution */}
              {dispute.resolucion && (
                <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    <p className="text-[#10B981] font-bold text-sm">Resolución</p>
                  </div>
                  <p className="text-white">{dispute.resolucion}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#00F2A6]/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#00F2A6]" />
                  <span className="text-white font-bold text-lg">{dispute.diamonds.toLocaleString()} 💎</span>
                  <span className="text-[#64748B] text-sm">en disputa</span>
                </div>
                <button className="px-6 py-2 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all">
                  Ver Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-[#00F2A6]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-xl mb-3">Cómo Funciona el Sistema de Disputas</h3>
            <div className="space-y-3 text-[#94A3B8]">
              <p>
                <strong className="text-white">1. Apertura:</strong> Cualquier parte puede abrir una disputa durante el periodo de revisión.
              </p>
              <p>
                <strong className="text-white">2. Evidencia:</strong> Ambas partes presentan evidencia y argumentos.
              </p>
              <p>
                <strong className="text-white">3. Revisión:</strong> El sistema analiza automáticamente la evidencia contra los requisitos originales.
              </p>
              <p>
                <strong className="text-white">4. Resolución:</strong> Se determina el porcentaje de pago basado en cumplimiento verificable:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Pago completo (100%) si evidencia cumple requisitos</li>
                <li>Pago parcial (50-99%) según cumplimiento demostrado</li>
                <li>Reembolso completo si no hay evidencia válida</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
