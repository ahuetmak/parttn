import React from 'react';
import { Link } from 'react-router';
import { Shield, Diamond, TrendingUp, CheckCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { CalculadoraTarifas } from '../components/CalculadoraTarifas';

export function Pricing() {
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
          
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6">
              Tarifas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9]">Transparentes</span>
            </h1>
            <p className="text-[#94A3B8] text-xl max-w-3xl mx-auto">
              Sistema de compensación claro y justo. Solo cobramos cuando se libera el pago.
            </p>
          </div>

          {/* Calculadora Rápida */}
          <CalculadoraTarifas />

          {/* Modelo de Tarifas */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-[#00F2A6]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Tarifa de Protección</h3>
              <p className="text-6xl font-bold text-[#00F2A6] mb-4">3%</p>
              <p className="text-[#94A3B8] mb-6">
                Se cobra al crear el acuerdo y bloquear fondos en escrow. Garantiza la protección del sistema.
              </p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#00F2A6]" />
                  <span>Fondos bloqueados en escrow</span>
                </div>
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#00F2A6]" />
                  <span>Sala Digital segura</span>
                </div>
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#00F2A6]" />
                  <span>Sistema de evidencia</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-[#0EA5E9]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Tarifa de Liberación</h3>
              <p className="text-6xl font-bold text-[#0EA5E9] mb-4">2%</p>
              <p className="text-[#94A3B8] mb-6">
                Se cobra al completar el acuerdo y liberar fondos. Cubre validación y procesamiento.
              </p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Validación de evidencia</span>
                </div>
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Liberación automática</span>
                </div>
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Actualización reputación</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#8B5CF6]/20 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-6">
                <Diamond className="w-8 h-8 text-[#8B5CF6] fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Retiro</h3>
              <p className="text-6xl font-bold text-[#8B5CF6] mb-4">1.5%</p>
              <p className="text-[#94A3B8] mb-6">
                Se cobra al retirar diamantes a cuenta bancaria externa. Cubre costos de procesamiento.
              </p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Retiro a cuenta externa</span>
                </div>
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Procesamiento rápido</span>
                </div>
                <div className="flex items-center gap-2 text-[#64748B] text-sm">
                  <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Conversión a moneda local</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Servicios Opcionales</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-white font-bold text-lg mb-2">Verificación Premium</h3>
                <p className="text-4xl font-bold text-[#00F2A6] mb-3">$99/año</p>
                <p className="text-[#64748B] text-sm mb-4">
                  Badge verificado, prioridad en marketplace, soporte prioritario
                </p>
                <button className="w-full px-4 py-2 rounded-xl border border-[#00F2A6]/30 text-[#00F2A6] font-semibold hover:bg-[#00F2A6]/10 transition-all">
                  Próximamente
                </button>
              </div>

              <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
                <h3 className="text-white font-bold text-lg mb-2">Arbitraje Experto</h3>
                <p className="text-4xl font-bold text-[#0EA5E9] mb-3">$49</p>
                <p className="text-[#64748B] text-sm mb-4">
                  Resolución de disputa con revisor humano experto en el área
                </p>
                <button className="w-full px-4 py-2 rounded-xl border border-[#0EA5E9]/30 text-[#0EA5E9] font-semibold hover:bg-[#0EA5E9]/10 transition-all">
                  Próximamente
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link to="/role-selection">
              <button className="px-12 py-5 rounded-2xl bg-[#00F2A6] text-black hover:bg-[#00F2A6]/90 transition-all font-bold text-xl shadow-[0_0_40px_rgba(0,242,166,0.4)]">
                Comenzar Ahora
              </button>
            </Link>
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