import React, { useState } from 'react';
import { X, Download, FileSignature, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

interface AcuerdoOperativoProps {
  isOpen: boolean;
  onClose: () => void;
  salaId: string;
  marca: string;
  socio: string;
  totalProducto: number;
  comisionSocio: number;
}

export function AcuerdoOperativo({
  isOpen,
  onClose,
  salaId,
  marca,
  socio,
  totalProducto,
  comisionSocio,
}: AcuerdoOperativoProps) {
  const [accepted, setAccepted] = useState(false);
  const [firmado, setFirmado] = useState(false);

  const feePARTTH = totalProducto * 0.15;
  const gananciaSocio = totalProducto * (comisionSocio / 100);
  const netoMarca = totalProducto - feePARTTH - gananciaSocio;

  const handleFirmar = () => {
    if (accepted) {
      setFirmado(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl max-w-5xl w-full my-8 shadow-[0_0_60px_rgba(0,242,166,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-[#00F2A6]/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
              <FileSignature className="w-7 h-7 text-black" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Acuerdo Operativo de Sala Digital</h2>
              <p className="text-[#64748B]">Sala #{salaId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#00F2A6]/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-[#94A3B8]" />
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-4 gap-8 p-8">
          {/* Index Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-black/40 rounded-2xl p-4 border border-[#00F2A6]/10">
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-4">
                Índice
              </p>
              <nav className="space-y-2">
                <a href="#partes" className="block text-sm text-[#00F2A6] hover:text-[#00F2A6]/80 transition-colors">
                  1. Partes
                </a>
                <a href="#objeto" className="block text-sm text-white hover:text-[#00F2A6] transition-colors">
                  2. Objeto
                </a>
                <a href="#compensacion" className="block text-sm text-white hover:text-[#00F2A6] transition-colors">
                  3. Compensación
                </a>
                <a href="#pago" className="block text-sm text-white hover:text-[#00F2A6] transition-colors">
                  4. Condiciones de Pago
                </a>
                <a href="#evidencia" className="block text-sm text-white hover:text-[#00F2A6] transition-colors">
                  5. Evidencia
                </a>
                <a href="#disputas" className="block text-sm text-white hover:text-[#00F2A6] transition-colors">
                  6. Disputas
                </a>
                <a href="#antifraude" className="block text-sm text-white hover:text-[#00F2A6] transition-colors">
                  7. Antifraude
                </a>
                <a href="#aceptacion" className="block text-sm text-white hover:text-[#00F2A6] transition-colors">
                  8. Aceptación
                </a>
              </nav>

              <button className="w-full mt-6 px-4 py-2 rounded-xl border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-semibold hover:bg-[#00F2A6]/10 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Partes */}
            <section id="partes" className="scroll-mt-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    1
                  </span>
                  Partes del Acuerdo
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-black/60 rounded-xl border border-[#00F2A6]/10">
                    <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
                      Marca (Vendor)
                    </p>
                    <p className="text-white font-bold text-lg">{marca}</p>
                    <p className="text-[#94A3B8] text-sm mt-1">
                      Responsable de definir requisitos, revisar evidencia y liberar fondos
                    </p>
                  </div>
                  <div className="p-4 bg-black/60 rounded-xl border border-[#0EA5E9]/10">
                    <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
                      Socio (Partner)
                    </p>
                    <p className="text-white font-bold text-lg">{socio}</p>
                    <p className="text-[#94A3B8] text-sm mt-1">
                      Responsable de ejecutar trabajo y entregar evidencia verificable
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Objeto */}
            <section id="objeto" className="scroll-mt-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    2
                  </span>
                  Objeto del Acuerdo
                </h3>
                <p className="text-[#94A3B8] leading-relaxed">
                  El presente acuerdo regula la colaboración entre Marca y Socio para la ejecución de
                  tareas de <strong className="text-white">promoción, venta, entrega o prestación de servicios</strong> según
                  lo especificado en la oferta original. Toda actividad se ejecuta dentro de esta Sala Digital PARTH
                  bajo protección de escrow.
                </p>
              </div>
            </section>

            {/* Compensación */}
            <section id="compensacion" className="scroll-mt-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    3
                  </span>
                  Compensación Económica
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/60 rounded-xl border border-[#00F2A6]/10">
                    <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
                      Total del Producto
                    </p>
                    <p className="text-3xl font-bold text-white">{totalProducto.toLocaleString()} 💎</p>
                  </div>
                  <div className="p-4 bg-black/60 rounded-xl border border-[#F59E0B]/10">
                    <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
                      Fee PARTH (15%)
                    </p>
                    <p className="text-3xl font-bold text-[#F59E0B]">{feePARTTH.toLocaleString()} 💎</p>
                  </div>
                  <div className="p-4 bg-black/60 rounded-xl border border-[#0EA5E9]/10">
                    <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
                      Comisión Socio ({comisionSocio}%)
                    </p>
                    <p className="text-3xl font-bold text-[#0EA5E9]">{gananciaSocio.toLocaleString()} 💎</p>
                    <p className="text-[#64748B] text-xs mt-1">Editable por Marca hasta 40%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/10 rounded-xl border border-[#10B981]/30">
                    <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-2">
                      Neto Marca
                    </p>
                    <p className="text-3xl font-bold text-[#10B981]">{netoMarca.toLocaleString()} 💎</p>
                    <p className="text-[#10B981] text-xs mt-1">
                      {((netoMarca / totalProducto) * 100).toFixed(1)}% del total
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Condiciones de Pago */}
            <section id="pago" className="scroll-mt-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    4
                  </span>
                  Condiciones de Pago
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold">Liberación condicionada</p>
                      <p className="text-[#94A3B8] text-sm">
                        El pago se libera <strong className="text-white">solo con evidencia verificable + aprobación</strong> de
                        la Marca, o resolución favorable de disputa.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold">Sin evidencia, no hay liberación</p>
                      <p className="text-[#94A3B8] text-sm">
                        Principio fundamental de PARTH. Cualquier pago requiere evidencia inmutable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Evidencia */}
            <section id="evidencia" className="scroll-mt-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    5
                  </span>
                  Evidencia Requerida
                </h3>
                <p className="text-[#94A3B8] mb-4">
                  El Socio debe entregar evidencia que incluya, sin limitarse a:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-[#00F2A6]">•</span>
                    <p className="text-[#94A3B8]">Checklist de entregables completados</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-[#00F2A6]">•</span>
                    <p className="text-[#94A3B8]">Archivos (screenshots, PDFs, videos, links públicos)</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-[#00F2A6]">•</span>
                    <p className="text-[#94A3B8]">Notas explicativas y contexto</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-[#00F2A6]">•</span>
                    <p className="text-[#94A3B8]">Cualquier prueba que demuestre cumplimiento de requisitos</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Disputas */}
            <section id="disputas" className="scroll-mt-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    6
                  </span>
                  Resolución de Disputas
                </h3>
                <p className="text-[#94A3B8] mb-4">
                  Las disputas se resuelven mediante análisis de evidencia. Opciones de resolución:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-black/60 rounded-xl border border-[#10B981]/10">
                    <p className="text-[#10B981] font-bold mb-2">Pago Total</p>
                    <p className="text-[#64748B] text-sm">
                      100% liberado si cumple requisitos
                    </p>
                  </div>
                  <div className="p-4 bg-black/60 rounded-xl border border-[#F59E0B]/10">
                    <p className="text-[#F59E0B] font-bold mb-2">Pago Parcial</p>
                    <p className="text-[#64748B] text-sm">
                      50-99% según cumplimiento
                    </p>
                  </div>
                  <div className="p-4 bg-black/60 rounded-xl border border-[#EF4444]/10">
                    <p className="text-[#EF4444] font-bold mb-2">Reembolso</p>
                    <p className="text-[#64748B] text-sm">
                      0% si no hay evidencia válida
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Antifraude */}
            <section id="antifraude" className="scroll-mt-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#EF4444]/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm font-bold">
                    7
                  </span>
                  Política Antifraude
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold">3 faltas = suspensión</p>
                      <p className="text-[#94A3B8] text-sm">
                        Evidencia falsa, incumplimiento reiterado o fraude comprobado resulta en suspensión permanente.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold">PARTH puede pausar pagos</p>
                      <p className="text-[#94A3B8] text-sm">
                        En casos de detección de riesgo, fraude o actividad sospechosa, PARTH puede retener fondos
                        hasta investigación completa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Aceptación */}
            <section id="aceptacion" className="scroll-mt-4">
              <div className="bg-gradient-to-br from-[#00F2A6]/10 to-[#0EA5E9]/10 rounded-2xl p-6 border border-[#00F2A6]/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] text-sm font-bold">
                    8
                  </span>
                  Aceptación del Acuerdo
                </h3>

                {!firmado ? (
                  <div className="space-y-6">
                    <label className="flex items-start gap-3 p-4 bg-black/40 rounded-xl border border-[#00F2A6]/20 cursor-pointer hover:bg-black/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-white font-semibold mb-1">
                          Acepto los términos de este Acuerdo Operativo
                        </p>
                        <p className="text-[#64748B] text-sm">
                          He leído y entiendo todas las cláusulas, condiciones de pago, evidencia requerida
                          y políticas antifraude de PARTH.
                        </p>
                      </div>
                    </label>

                    <button
                      onClick={handleFirmar}
                      disabled={!accepted}
                      className={`w-full px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                        accepted
                          ? 'bg-[#00F2A6] text-black hover:bg-[#00F2A6]/90 shadow-[0_0_30px_rgba(0,242,166,0.3)]'
                          : 'bg-[#64748B]/20 text-[#64748B] cursor-not-allowed'
                      }`}
                    >
                      <FileSignature className="w-6 h-6" />
                      Firmar Acuerdo
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-[#10B981]/20 border-2 border-[#10B981] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-[#10B981]" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Acuerdo Firmado</h4>
                    <p className="text-[#94A3B8] mb-1">
                      Firmado por <strong className="text-white">{socio}</strong>
                    </p>
                    <p className="text-[#64748B] text-sm">
                      {new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-6 p-4 bg-black/40 rounded-xl border border-[#00F2A6]/10">
                      <p className="text-[#00F2A6] text-sm">
                        Versión del acuerdo: v1.0 - Sala #{salaId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}