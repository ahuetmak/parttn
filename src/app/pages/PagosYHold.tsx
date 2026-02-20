import React from 'react';
import { Link } from 'react-router';
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export function PagosYHold() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/app/wallet" className="text-[#64748B] hover:text-white transition-colors">
          Wallet
        </Link>
        <span className="text-[#64748B]">/</span>
        <span className="text-white font-semibold">Pagos y Hold</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00F2A6]/10 rounded-full blur-[150px]"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#00F2A6]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Política de Pagos y Hold</h1>
              <p className="text-[#94A3B8] text-lg">
                Sistema de protección temporal para ventas y afiliación
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Regla Hold Default */}
      <div className="bg-gradient-to-br from-[#F59E0B]/10 to-transparent border border-[#F59E0B]/30 rounded-3xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#F59E0B]/20 border-2 border-[#F59E0B] flex items-center justify-center flex-shrink-0">
            <Clock className="w-10 h-10 text-[#F59E0B]" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-4">Hold Default: 14 Días</h2>
            <p className="text-[#94A3B8] text-lg mb-6 leading-relaxed">
              Para todas las transacciones de <strong className="text-white">ventas y afiliación</strong>, 
              los fondos permanecen en estado <strong className="text-[#F59E0B]">"Hold"</strong> durante 
              <strong className="text-[#F59E0B]"> 14 días calendario</strong> antes de liberarse automáticamente 
              al Socio. Este período protege contra fraudes, reembolsos y disputas tempranas.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/40 rounded-xl p-4 border border-[#F59E0B]/10">
                <p className="text-[#F59E0B] font-bold text-sm mb-2">Día 0</p>
                <p className="text-white font-semibold mb-1">Pago aprobado</p>
                <p className="text-[#64748B] text-sm">Fondos entran en hold</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-[#F59E0B]/10">
                <p className="text-[#F59E0B] font-bold text-sm mb-2">Días 1-13</p>
                <p className="text-white font-semibold mb-1">Período de protección</p>
                <p className="text-[#64748B] text-sm">Monitoreo de fraude activo</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-[#10B981]/10">
                <p className="text-[#10B981] font-bold text-sm mb-2">Día 14</p>
                <p className="text-white font-semibold mb-1">Liberación automática</p>
                <p className="text-[#64748B] text-sm">Fondos disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extensión del Hold */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#EF4444]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
            <h3 className="text-xl font-bold text-white">Extensión por Riesgo</h3>
          </div>
          <p className="text-[#94A3B8] mb-4">
            El hold puede extenderse automáticamente si se detecta:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8] text-sm">Actividad sospechosa o fraude potencial</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8] text-sm">Disputa abierta por la Marca o cliente final</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8] text-sm">Solicitudes de reembolso en proceso</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <span className="text-[#94A3B8] text-sm">Verificación manual requerida por PARTH</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#8B5CF6]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#8B5CF6]" />
            <h3 className="text-xl font-bold text-white">Principio Fundamental</h3>
          </div>
          <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl p-4 mb-4">
            <p className="text-white font-bold text-lg text-center">
              "Sin evidencia, no hay liberación"
            </p>
          </div>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            Incluso después del período de hold de 14 días, <strong className="text-white">cualquier pago 
            requiere evidencia inmutable</strong>. El hold temporal protege contra fraudes inmediatos, pero 
            la evidencia obligatoria es el requisito permanente del sistema PARTH.
          </p>
        </div>
      </div>

      {/* Tipos de Acuerdos y Hold */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Hold Según Tipo de Acuerdo</h2>
        <div className="space-y-4">
          {/* Ventas/Afiliación */}
          <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-[#F59E0B]/10">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white font-bold text-lg">Ventas / Afiliación</h3>
                <span className="px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-bold">
                  HOLD 14 DÍAS
                </span>
              </div>
              <p className="text-[#94A3B8] text-sm mb-3">
                Aplica hold temporal por riesgo de reembolsos, devoluciones o fraude en transacciones de venta.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-[#64748B] border border-[#64748B]/20">
                  E-commerce
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-[#64748B] border border-[#64748B]/20">
                  Afiliados
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-[#64748B] border border-[#64748B]/20">
                  Marketing de productos
                </span>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-[#00F2A6]/10">
            <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-[#00F2A6]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white font-bold text-lg">Servicios / Trabajo</h3>
                <span className="px-3 py-1 rounded-full bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-xs font-bold">
                  SIN HOLD
                </span>
              </div>
              <p className="text-[#94A3B8] text-sm mb-3">
                No aplica hold temporal. Liberación inmediata tras aprobación de evidencia por la Marca.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-[#64748B] border border-[#64748B]/20">
                  Diseño
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-[#64748B] border border-[#64748B]/20">
                  Desarrollo
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-[#64748B] border border-[#64748B]/20">
                  Consultoría
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-[#64748B] border border-[#64748B]/20">
                  Marketing digital
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estados de Dinero */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Flujo de Estados del Dinero</h2>
        <div className="grid md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="w-full aspect-square rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-[#00F2A6]" />
            </div>
            <p className="text-white font-bold text-sm mb-1">Disponible</p>
            <p className="text-[#64748B] text-xs">En tu wallet</p>
          </div>

          <div className="text-center">
            <div className="w-full aspect-square rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-[#0EA5E9]" />
            </div>
            <p className="text-white font-bold text-sm mb-1">En Escrow</p>
            <p className="text-[#64748B] text-xs">Bloqueado en sala</p>
          </div>

          <div className="text-center">
            <div className="w-full aspect-square rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <p className="text-white font-bold text-sm mb-1">En Hold</p>
            <p className="text-[#64748B] text-xs">14 días espera</p>
          </div>

          <div className="text-center">
            <div className="w-full aspect-square rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8 text-[#8B5CF6]" />
            </div>
            <p className="text-white font-bold text-sm mb-1">En Revisión</p>
            <p className="text-[#64748B] text-xs">Validando evidencia</p>
          </div>

          <div className="text-center">
            <div className="w-full aspect-square rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <p className="text-white font-bold text-sm mb-1">Liberado</p>
            <p className="text-[#64748B] text-xs">Ya disponible</p>
          </div>

          <div className="text-center">
            <div className="w-full aspect-square rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center mb-3">
              <XCircle className="w-8 h-8 text-[#EF4444]" />
            </div>
            <p className="text-white font-bold text-sm mb-1">En Disputa</p>
            <p className="text-[#64748B] text-xs">Resolución pendiente</p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          <div className="bg-black/40 rounded-xl p-6 border border-[#00F2A6]/10">
            <h3 className="text-white font-bold mb-2">¿Puedo retirar fondos en hold?</h3>
            <p className="text-[#94A3B8] text-sm">
              No. Los fondos en hold están temporalmente bloqueados hasta completar el período de 14 días 
              o hasta resolución de disputa si aplica.
            </p>
          </div>

          <div className="bg-black/40 rounded-xl p-6 border border-[#00F2A6]/10">
            <h3 className="text-white font-bold mb-2">¿El hold se aplica a todos los acuerdos?</h3>
            <p className="text-[#94A3B8] text-sm">
              No. Solo aplica para ventas y afiliación. Servicios y trabajo freelance se liberan inmediatamente 
              tras aprobación de evidencia.
            </p>
          </div>

          <div className="bg-black/40 rounded-xl p-6 border border-[#00F2A6]/10">
            <h3 className="text-white font-bold mb-2">¿Qué pasa si hay una disputa durante el hold?</h3>
            <p className="text-[#94A3B8] text-sm">
              El hold se extiende automáticamente hasta que la disputa se resuelva. PARTH analiza la evidencia 
              y determina el resultado: pago total, parcial o reembolso.
            </p>
          </div>

          <div className="bg-black/40 rounded-xl p-6 border border-[#00F2A6]/10">
            <h3 className="text-white font-bold mb-2">¿Puedo acelerar la liberación?</h3>
            <p className="text-[#94A3B8] text-sm">
              No. El período de hold de 14 días es fijo para proteger contra fraudes. Sin embargo, para acuerdos 
              de servicios (sin hold), la liberación es inmediata tras aprobación.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#00F2A6]/10 to-[#0EA5E9]/10 border border-[#00F2A6]/20 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">¿Tienes más preguntas?</h3>
        <p className="text-[#94A3B8] mb-6">
          Nuestro equipo de soporte está disponible 24/7 para ayudarte
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/app/wallet">
            <button className="px-8 py-4 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all">
              Volver al Wallet
            </button>
          </Link>
          <button className="px-8 py-4 rounded-xl border-2 border-[#00F2A6]/30 text-[#00F2A6] font-bold hover:bg-[#00F2A6]/10 transition-all">
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  );
}