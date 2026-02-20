import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { Logo } from '../components/Logo';

export function Terms() {
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

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[#00F2A6] hover:text-[#00F2A6]/80 transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#00F2A6]" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">Términos y Condiciones</h1>
              <p className="text-[#64748B] mt-2">Última actualización: Febrero 2026</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-10 space-y-8">
            {/* Sección 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Aceptación de Términos</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                Al acceder y utilizar PARTH, aceptas estar sujeto a estos Términos y Condiciones. 
                Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
              </p>
            </section>

            {/* Sección 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Definiciones</h2>
              <div className="space-y-3">
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-1">Marca</p>
                  <p className="text-[#94A3B8] text-sm">
                    Usuario que publica tareas y contrata Socios para realizarlas.
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-1">Socio</p>
                  <p className="text-[#94A3B8] text-sm">
                    Usuario que aplica a tareas publicadas y realiza el trabajo acordado.
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-1">Sala Digital</p>
                  <p className="text-[#94A3B8] text-sm">
                    Espacio protegido donde se ejecuta cada acuerdo con fondos bloqueados en escrow.
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-1">Diamantes (💎)</p>
                  <p className="text-[#94A3B8] text-sm">
                    Unidad interna estructurada de PARTH. 1 Diamante = 1 USD.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Sistema de Escrow</h2>
              <div className="space-y-3 text-[#94A3B8]">
                <p className="leading-relaxed">
                  • Los fondos se bloquean automáticamente al crear un acuerdo y permanecen en escrow 
                  hasta la aprobación o resolución de disputa.
                </p>
                <p className="leading-relaxed">
                  • PARTH actúa como custodio neutral de los fondos bloqueados.
                </p>
                <p className="leading-relaxed">
                  • Los fondos solo se liberan cuando la Marca aprueba el trabajo o el sistema de 
                  disputas resuelve a favor del Socio.
                </p>
                <p className="leading-relaxed">
                  • Existe un período de Hold de 14 días calendario desde la aprobación antes de la 
                  liberación final de fondos.
                </p>
              </div>
            </section>

            {/* Sección 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Tarifas y Comisiones</h2>
              <div className="space-y-3">
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-2">Fee PARTH: 15% fijo</p>
                  <p className="text-[#94A3B8] text-sm">
                    Se calcula sobre el total del producto y se distribuye en:
                  </p>
                  <ul className="text-[#94A3B8] text-sm mt-2 space-y-1 ml-4">
                    <li>• 3% al crear el acuerdo (Tarifa de Protección)</li>
                    <li>• 2% al completar el acuerdo (Tarifa de Liberación)</li>
                    <li>• Costos operativos del sistema</li>
                  </ul>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-2">Comisión del Socio: 25% default (editable 0-40%)</p>
                  <p className="text-[#94A3B8] text-sm">
                    La Marca establece la comisión al publicar la tarea. El Socio recibe este porcentaje 
                    del total del producto al completar el trabajo.
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-2">Tarifa de Retiro: 1.5%</p>
                  <p className="text-[#94A3B8] text-sm">
                    Se cobra al retirar diamantes a cuenta bancaria externa. Cubre costos de 
                    procesamiento de pago.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Evidencia Obligatoria</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-3">
                Todo trabajo entregado debe incluir evidencia documentada que demuestre la 
                realización del servicio acordado.
              </p>
              <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                <p className="text-white font-semibold mb-2">Requisitos:</p>
                <ul className="text-[#94A3B8] text-sm space-y-1">
                  <li>• Archivos fuente del trabajo realizado</li>
                  <li>• Capturas de pantalla o documentación del proceso</li>
                  <li>• Timestamps verificables de cada entregable</li>
                  <li>• Cualquier material adicional especificado en el acuerdo</li>
                </ul>
              </div>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Resolución de Disputas</h2>
              <div className="space-y-3 text-[#94A3B8]">
                <p className="leading-relaxed">
                  • Si una Marca rechaza el trabajo, puede abrir una disputa especificando las razones.
                </p>
                <p className="leading-relaxed">
                  • El sistema revisa automáticamente la evidencia presentada por ambas partes.
                </p>
                <p className="leading-relaxed">
                  • La decisión se basa en: cumplimiento de requisitos, evidencia presentada, 
                  historial de reputación y términos del acuerdo original.
                </p>
                <p className="leading-relaxed">
                  • Las decisiones del sistema son vinculantes. Opcionalmente, se puede solicitar 
                  arbitraje humano experto (servicio adicional de $49 USD).
                </p>
              </div>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Responsabilidades del Usuario</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <p className="text-white font-semibold mb-2">Como Marca:</p>
                  <ul className="text-[#94A3B8] text-sm space-y-1">
                    <li>• Definir requisitos claros</li>
                    <li>• Revisar evidencia en tiempo</li>
                    <li>• Comunicación profesional</li>
                    <li>• No solicitar trabajo fuera de PARTH</li>
                  </ul>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">Como Socio:</p>
                  <ul className="text-[#94A3B8] text-sm space-y-1">
                    <li>• Cumplir deadlines acordados</li>
                    <li>• Entregar con evidencia completa</li>
                    <li>• Calidad según lo prometido</li>
                    <li>• No aceptar pagos externos</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sección 8 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Prohibiciones</h2>
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4">
                <p className="text-[#EF4444] font-semibold mb-3">Está estrictamente prohibido:</p>
                <ul className="text-[#94A3B8] text-sm space-y-2">
                  <li>• Realizar transacciones fuera de la plataforma para evadir tarifas</li>
                  <li>• Subir evidencia falsa o manipulada</li>
                  <li>• Abusar del sistema de disputas</li>
                  <li>• Crear múltiples cuentas para manipular reputación</li>
                  <li>• Compartir credenciales de cuenta</li>
                  <li>• Actividades ilegales o fraudulentas</li>
                </ul>
              </div>
            </section>

            {/* Sección 9 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Propiedad Intelectual</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                El trabajo entregado y sus derechos de propiedad intelectual se transfieren a la Marca 
                al momento de la aprobación y liberación de fondos, salvo que se especifique lo contrario 
                en el Acuerdo Operativo de la Sala Digital.
              </p>
            </section>

            {/* Sección 10 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modificaciones</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                PARTH se reserva el derecho de modificar estos términos en cualquier momento. 
                Los cambios significativos serán notificados con al menos 30 días de anticipación. 
                El uso continuado de la plataforma después de los cambios constituye aceptación de los 
                nuevos términos.
              </p>
            </section>

            {/* Sección 11 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contacto</h2>
              <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                <p className="text-[#94A3B8] text-sm">
                  Para preguntas sobre estos términos, contacta a:
                </p>
                <p className="text-[#00F2A6] font-mono text-sm mt-2">legal@partth.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00F2A6]/10 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold text-white mb-4">PARTH</div>
          <div className="flex items-center justify-center gap-6 text-[#64748B] text-sm">
            <Link to="/terms" className="hover:text-[#00F2A6] transition-colors">Términos</Link>
            <Link to="/privacy" className="hover:text-[#00F2A6] transition-colors">Privacidad</Link>
            <Link to="/como-funciona" className="hover:text-[#00F2A6] transition-colors">Cómo Funciona</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}