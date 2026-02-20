import React from 'react';
import { Link } from 'react-router';
import { 
  ArrowLeft, 
  Shield, 
  FileCheck, 
  Clock, 
  CheckCircle, 
  Lock,
  Upload,
  DollarSign,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Logo } from '../components/Logo';

export function ComoFunciona() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-[#00F2A6]/10 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} className="text-[#00F2A6]" />
            <span className="text-2xl font-bold tracking-wider text-white">PARTH</span>
          </Link>
          <Link to="/login">
            <button className="px-6 py-2.5 rounded-xl border border-[#00F2A6]/30 text-[#00F2A6] hover:bg-[#00F2A6]/10 transition-all font-semibold">
              Iniciar Sesión
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00F2A6]/10 rounded-full blur-[150px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[#00F2A6] hover:text-[#00F2A6]/80 transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
          
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-white mb-6">
              ¿Cómo Funciona <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9]">PARTH</span>?
            </h1>
            <p className="text-[#94A3B8] text-xl max-w-3xl mx-auto">
              Un sistema de protección total en 5 pasos simples
            </p>
          </div>

          {/* Flujo Visual - Para MARCAS */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#00F2A6]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Para Marcas</h2>
                <p className="text-[#64748B]">Contrata con protección total</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Paso 1 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-[#00F2A6]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#00F2A6]">1</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-7 h-7 text-[#00F2A6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Publica tu Tarea</h3>
                    <p className="text-[#94A3B8] mb-4">
                      Define el trabajo que necesitas: diseño, video, código, contenido, etc. 
                      Establece el presupuesto total y la comisión del Socio (25-40%).
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-black/40 rounded-lg p-3 border border-[#00F2A6]/10">
                        <p className="text-xs text-[#64748B] mb-1">Total Producto</p>
                        <p className="text-white font-bold">2,500 💎</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 border border-[#00F2A6]/10">
                        <p className="text-xs text-[#64748B] mb-1">Comisión Socio</p>
                        <p className="text-white font-bold">25%</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 border border-[#00F2A6]/10">
                        <p className="text-xs text-[#64748B] mb-1">Fee PARTH</p>
                        <p className="text-white font-bold">15%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#0EA5E9]">2</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-7 h-7 text-[#0EA5E9]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Recibe Propuestas</h3>
                    <p className="text-[#94A3B8] mb-4">
                      Los Socios verificados aplican a tu tarea. Revisa su reputación, portafolio 
                      y propuesta. Elige al mejor candidato para tu proyecto.
                    </p>
                    <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/20"></div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">Juan Pérez</p>
                          <p className="text-xs text-[#64748B]">⭐ 4.9 • 127 acuerdos completados</p>
                        </div>
                        <span className="text-[#00F2A6] text-sm font-semibold">✓ Verificado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#F59E0B]/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#F59E0B]">3</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-7 h-7 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Bloquea Fondos en Escrow</h3>
                    <p className="text-[#94A3B8] mb-4">
                      Aceptas al Socio y los fondos se bloquean en la Sala Digital PARTH. 
                      <strong className="text-white"> El dinero NO se mueve hasta que apruebes el trabajo.</strong>
                    </p>
                    <div className="bg-black/40 rounded-lg p-4 border border-[#F59E0B]/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#64748B] text-sm">Estado:</span>
                        <span className="px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold">
                          🔒 FONDOS BLOQUEADOS
                        </span>
                      </div>
                      <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-[#F59E0B]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#8B5CF6]/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#8B5CF6]">4</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-7 h-7 text-[#8B5CF6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Recibe Evidencia</h3>
                    <p className="text-[#94A3B8] mb-4">
                      El Socio sube el trabajo completado con evidencia obligatoria. 
                      Revisas, solicitas cambios o apruebas. Todo queda documentado.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-black/40 rounded-lg p-3 border border-[#8B5CF6]/10">
                        <div className="flex items-center gap-2 mb-1">
                          <FileCheck className="w-4 h-4 text-[#8B5CF6]" />
                          <p className="text-white text-sm font-semibold">Entregable Final</p>
                        </div>
                        <p className="text-xs text-[#64748B]">logo-final-v3.pdf • 2.4 MB</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 border border-[#8B5CF6]/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-[#8B5CF6]" />
                          <p className="text-white text-sm font-semibold">Entregado</p>
                        </div>
                        <p className="text-xs text-[#64748B]">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 5 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-[#00F2A6]/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#00F2A6]">5</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-[#00F2A6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Aprueba y Libera</h3>
                    <p className="text-[#94A3B8] mb-4">
                      Si estás satisfecho, apruebas el trabajo. Los fondos se liberan automáticamente 
                      después del período de Hold (14 días) y la reputación se actualiza.
                    </p>
                    <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold mb-1">Acuerdo Completado ✓</p>
                          <p className="text-xs text-[#64748B]">Fondos liberados en 14 días</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#00F2A6] text-2xl font-bold">2,125 💎</p>
                          <p className="text-xs text-[#64748B]">Pagado al Socio</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flujo Visual - Para SOCIOS */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#0EA5E9]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Para Socios</h2>
                <p className="text-[#64748B]">Gana con protección garantizada</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Paso 1 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#00F2A6]">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Explora el Marketplace</h3>
                    <p className="text-[#94A3B8]">
                      Busca tareas que coincidan con tus habilidades. Filtra por categoría, 
                      presupuesto, deadline y tu comisión potencial.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-2xl p-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#0EA5E9]">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Aplica con Propuesta</h3>
                    <p className="text-[#94A3B8]">
                      Envía tu propuesta detallada, timeline y portafolio. La Marca revisa y 
                      selecciona al mejor candidato.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#F59E0B]/20 rounded-2xl p-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#F59E0B]">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Trabaja Protegido</h3>
                    <p className="text-[#94A3B8]">
                      Si te seleccionan, los fondos ya están bloqueados en escrow. 
                      <strong className="text-white"> Tu pago está garantizado si cumples.</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#8B5CF6]/20 rounded-2xl p-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#8B5CF6]">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Entrega con Evidencia</h3>
                    <p className="text-[#94A3B8]">
                      Sube tu trabajo completado con evidencia obligatoria. Cada entregable 
                      queda documentado y protege tu reputación.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 5 */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#00F2A6]">5</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">Recibe tu Pago</h3>
                    <p className="text-[#94A3B8] mb-4">
                      Cuando la Marca aprueba, tus diamantes se liberan automáticamente después 
                      del período de Hold. Retiras a tu cuenta o reinviertes en el marketplace.
                    </p>
                    <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Tu ganancia:</span>
                        <span className="text-[#00F2A6] text-2xl font-bold">625 💎</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Garantías */}
          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-10 mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Garantías del Sistema</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#00F2A6]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Fondos Bloqueados</h3>
                <p className="text-[#64748B] text-sm">
                  El dinero nunca se mueve sin aprobación. Escrow automático desde el inicio.
                </p>
              </div>

              <div className="bg-black/40 rounded-2xl p-6 border border-[#0EA5E9]/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Evidencia Obligatoria</h3>
                <p className="text-[#64748B] text-sm">
                  Todo trabajo requiere evidencia documentada. Sin excepciones.
                </p>
              </div>

              <div className="bg-black/40 rounded-2xl p-6 border border-[#F59E0B]/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Resolución de Disputas</h3>
                <p className="text-[#64748B] text-sm">
                  Sistema automatizado que revisa evidencia y resuelve conflictos de forma justa.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link to="/role-selection">
              <button className="px-12 py-5 rounded-2xl bg-[#00F2A6] text-black hover:bg-[#00F2A6]/90 transition-all font-bold text-xl shadow-[0_0_40px_rgba(0,242,166,0.4)] mb-4">
                Comenzar Ahora
              </button>
            </Link>
            <p className="text-[#64748B] text-sm">Sin setup. Sin suscripción. Solo pagas por acuerdo completado.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00F2A6]/10 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold text-white mb-4">PARTH</div>
          <p className="text-[#64748B] text-sm">
            Marketplace protegido de acuerdos verificables
          </p>
        </div>
      </footer>
    </div>
  );
}