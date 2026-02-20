import React from 'react';
import { Link } from 'react-router';
import { Shield, Target, Users, Zap, Lock, Award, ArrowLeft, CheckCircle, Building2 } from 'lucide-react';
import { Logo } from '../components/Logo';

export function About() {
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

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00F2A6]/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-[150px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[#00F2A6] hover:text-[#00F2A6]/80 transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
          
          <div className="text-center mb-20">
            <div className="inline-block mb-6 px-6 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5 backdrop-blur-sm">
              <span className="text-[#00F2A6] font-semibold text-sm tracking-wider">QUIÉNES SOMOS</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Protegiendo cada <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9]">acuerdo digital</span>
            </h1>
            <p className="text-[#94A3B8] text-xl max-w-3xl mx-auto leading-relaxed">
              PARTH nació para resolver el problema de confianza en los acuerdos digitales. 
              Creamos un sistema donde la protección, la evidencia y la transparencia son obligatorias.
            </p>
          </div>

          {/* Misión y Visión */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-10 relative overflow-hidden group hover:border-[#00F2A6]/40 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00F2A6]/5 rounded-full blur-[80px] group-hover:blur-[100px] transition-all"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-[#00F2A6]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Nuestra Misión</h2>
                <p className="text-[#94A3B8] text-lg leading-relaxed">
                  Eliminar el riesgo en acuerdos digitales mediante un sistema de escrow inteligente, 
                  evidencia obligatoria y resolución estructurada de disputas. Cada acuerdo en PARTH 
                  está protegido desde el primer momento hasta el pago final.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-3xl p-10 relative overflow-hidden group hover:border-[#0EA5E9]/40 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#0EA5E9]/5 rounded-full blur-[80px] group-hover:blur-[100px] transition-all"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Nuestra Visión</h2>
                <p className="text-[#94A3B8] text-lg leading-relaxed">
                  Convertirnos en el estándar global de confianza para acuerdos digitales. 
                  Imaginamos un mundo donde cada colaboración esté protegida por defecto, 
                  donde la evidencia sea transparente y la reputación sea verificable.
                </p>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Nuestros Valores</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 hover:border-[#00F2A6]/40 transition-all">
                <Shield className="w-10 h-10 text-[#00F2A6] mb-4" />
                <h3 className="text-white font-bold text-xl mb-3">Protección Absoluta</h3>
                <p className="text-[#94A3B8]">
                  Los fondos siempre están en escrow. Ni Marcas ni Socios pueden perder su dinero sin evidencia verificable.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 hover:border-[#00F2A6]/40 transition-all">
                <CheckCircle className="w-10 h-10 text-[#00F2A6] mb-4" />
                <h3 className="text-white font-bold text-xl mb-3">Transparencia Total</h3>
                <p className="text-[#94A3B8]">
                  Cada acción queda registrada. Cada tarifa es visible. Cada decisión tiene evidencia documentada.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 hover:border-[#00F2A6]/40 transition-all">
                <Award className="w-10 h-10 text-[#00F2A6] mb-4" />
                <h3 className="text-white font-bold text-xl mb-3">Reputación Real</h3>
                <p className="text-[#94A3B8]">
                  Tu historial es verificable. No hay reviews falsas. Solo acuerdos completados con evidencia aprobada.
                </p>
              </div>
            </div>
          </div>

          {/* El Sistema PARTH */}
          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-12 mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">El Sistema PARTH</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[#00F2A6]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Fondos Bloqueados (Escrow)</h3>
                  <p className="text-[#94A3B8]">
                    Cada acuerdo comienza con fondos bloqueados. La Marca paga por adelantado, pero el dinero 
                    no se libera hasta que el trabajo esté validado. Protección total para ambas partes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-[#00F2A6]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Evidencia Obligatoria</h3>
                  <p className="text-[#94A3B8]">
                    Cada entrega requiere evidencia: capturas, archivos, reportes. La evidencia debe ser 
                    aprobada antes de liberar los fondos. Sin evidencia, no hay pago.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#00F2A6]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Período de Hold (14 días)</h3>
                  <p className="text-[#94A3B8]">
                    Después de aprobar la evidencia, hay 14 días de protección adicional. Si surge un problema, 
                    la Marca puede abrir una disputa. Pasados los 14 días, los fondos se liberan automáticamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[#00F2A6]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Reputación Verificable</h3>
                  <p className="text-[#94A3B8]">
                    Cada acuerdo completado suma a tu reputación. No hay manera de falsificar tu historial: 
                    todo está respaldado por Salas Digitales completadas con evidencia aprobada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-[#00F2A6] mb-2">100%</p>
              <p className="text-[#94A3B8]">Fondos Protegidos</p>
            </div>

            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-[#00F2A6] mb-2">14d</p>
              <p className="text-[#94A3B8]">Período de Hold</p>
            </div>

            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-[#00F2A6] mb-2">5%</p>
              <p className="text-[#94A3B8]">Tarifa Total</p>
            </div>

            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 text-center">
              <p className="text-5xl font-bold text-[#00F2A6] mb-2">24/7</p>
              <p className="text-[#94A3B8]">Disponibilidad</p>
            </div>
          </div>

          {/* Para Quién Es PARTH */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">¿Para Quién es PARTH?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-10 hover:border-[#00F2A6]/40 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-[#00F2A6]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">Para Marcas</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Paga solo cuando el trabajo esté validado y aprobado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Exige evidencia obligatoria en cada entrega</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Dispones de 14 días de protección adicional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Accede a Socios con reputación verificable</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-3xl p-10 hover:border-[#0EA5E9]/40 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">Para Socios</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Recibe tu pago garantizado con fondos bloqueados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Tu trabajo está protegido con evidencia documentada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Construye reputación verificable con cada acuerdo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <span className="text-[#94A3B8]">Accede a Marcas serias que pagan en tiempo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="bg-gradient-to-br from-[#00F2A6]/10 to-[#0EA5E9]/10 border border-[#00F2A6]/30 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">¿Listo para proteger tus acuerdos?</h2>
            <p className="text-[#94A3B8] text-xl mb-8 max-w-2xl mx-auto">
              Únete a PARTH y trabaja con la tranquilidad de que cada acuerdo está protegido desde el primer momento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/role-selection">
                <button className="px-10 py-5 rounded-2xl bg-[#00F2A6] text-black hover:bg-[#00F2A6]/90 transition-all font-bold text-lg shadow-[0_0_40px_rgba(0,242,166,0.3)]">
                  Comenzar Ahora
                </button>
              </Link>
              <Link to="/pricing">
                <button className="px-10 py-5 rounded-2xl border-2 border-[#00F2A6] text-[#00F2A6] hover:bg-[#00F2A6]/10 transition-all font-bold text-lg">
                  Ver Tarifas
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00F2A6]/10 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size={32} className="text-[#00F2A6]" />
              <span className="text-2xl font-bold text-white">PARTH</span>
            </div>
            <div className="flex gap-8 text-[#64748B] text-sm">
              <Link to="/terms" className="hover:text-[#00F2A6] transition-colors">Términos</Link>
              <Link to="/privacy" className="hover:text-[#00F2A6] transition-colors">Privacidad</Link>
              <Link to="/como-funciona" className="hover:text-[#00F2A6] transition-colors">Cómo Funciona</Link>
            </div>
            <p className="text-[#64748B] text-sm">
              © 2025 PARTH. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}