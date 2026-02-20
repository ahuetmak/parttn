import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import { Logo } from '../components/Logo';

export function Privacy() {
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
            <div className="w-16 h-16 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#0EA5E9]" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">Política de Privacidad</h1>
              <p className="text-[#64748B] mt-2">Última actualización: Febrero 2026</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#0EA5E9]/20 rounded-3xl p-10 space-y-8">
            {/* Introducción */}
            <section>
              <p className="text-[#94A3B8] leading-relaxed">
                En PARTH, la protección de tu información personal es una prioridad. Esta Política de 
                Privacidad explica qué datos recopilamos, cómo los usamos, y tus derechos sobre ellos.
              </p>
            </section>

            {/* Sección 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Información que Recopilamos</h2>
              
              <div className="space-y-4">
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">Información de Cuenta:</p>
                  <ul className="text-[#94A3B8] text-sm space-y-1">
                    <li>• Nombre completo y email</li>
                    <li>• Rol (Marca o Socio)</li>
                    <li>• Datos de verificación de identidad</li>
                    <li>• Información de pago (procesada por Stripe)</li>
                  </ul>
                </div>

                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">Datos de Uso:</p>
                  <ul className="text-[#94A3B8] text-sm space-y-1">
                    <li>• Acuerdos creados y completados</li>
                    <li>• Transacciones de diamantes</li>
                    <li>• Evidencia subida a Salas Digitales</li>
                    <li>• Historial de disputas y resoluciones</li>
                    <li>• Reputación y métricas de rendimiento</li>
                  </ul>
                </div>

                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">Información Técnica:</p>
                  <ul className="text-[#94A3B8] text-sm space-y-1">
                    <li>• Dirección IP y ubicación aproximada</li>
                    <li>• Tipo de navegador y dispositivo</li>
                    <li>• Cookies y tecnologías similares</li>
                    <li>• Logs de actividad en la plataforma</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sección 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Cómo Usamos tu Información</h2>
              <div className="space-y-3 text-[#94A3B8]">
                <p className="leading-relaxed">
                  • <strong className="text-white">Operar la plataforma:</strong> Procesar acuerdos, 
                  gestionar escrow, validar evidencia y resolver disputas.
                </p>
                <p className="leading-relaxed">
                  • <strong className="text-white">Seguridad y fraude:</strong> Detectar y prevenir 
                  actividades sospechosas, proteger fondos bloqueados.
                </p>
                <p className="leading-relaxed">
                  • <strong className="text-white">Comunicación:</strong> Enviarte notificaciones 
                  importantes sobre tus acuerdos, transacciones y actualizaciones del sistema.
                </p>
                <p className="leading-relaxed">
                  • <strong className="text-white">Mejora del servicio:</strong> Analizar patrones de 
                  uso para optimizar funcionalidades y experiencia de usuario.
                </p>
                <p className="leading-relaxed">
                  • <strong className="text-white">Cumplimiento legal:</strong> Responder a 
                  requerimientos legales y regulatorios.
                </p>
              </div>
            </section>

            {/* Sección 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Compartir Información</h2>
              
              <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 rounded-lg p-4 mb-4">
                <p className="text-[#0EA5E9] font-semibold mb-2">⚠️ Importante:</p>
                <p className="text-[#94A3B8] text-sm">
                  PARTH NUNCA vende tu información personal a terceros.
                </p>
              </div>

              <p className="text-[#94A3B8] mb-3">Compartimos información solo en estos casos:</p>
              
              <div className="space-y-3">
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">Con otros usuarios:</p>
                  <p className="text-[#94A3B8] text-sm">
                    Información básica de perfil y reputación visible en marketplace. 
                    Evidencia compartida dentro de Salas Digitales activas.
                  </p>
                </div>

                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">Proveedores de servicios:</p>
                  <p className="text-[#94A3B8] text-sm">
                    • Stripe (procesamiento de pagos)<br/>
                    • Supabase (infraestructura y base de datos)<br/>
                    • Cloudflare (hosting y CDN)
                  </p>
                </div>

                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">Cumplimiento legal:</p>
                  <p className="text-[#94A3B8] text-sm">
                    Si es requerido por ley, orden judicial, o para proteger derechos y seguridad.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Seguridad de Datos</h2>
              <p className="text-[#94A3B8] mb-4">
                Implementamos medidas de seguridad de nivel empresarial:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <Shield className="w-6 h-6 text-[#00F2A6] mb-2" />
                  <p className="text-white font-semibold text-sm mb-1">Encriptación</p>
                  <p className="text-[#94A3B8] text-xs">
                    TLS/SSL en tránsito, AES-256 en reposo
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <Lock className="w-6 h-6 text-[#00F2A6] mb-2" />
                  <p className="text-white font-semibold text-sm mb-1">Autenticación</p>
                  <p className="text-[#94A3B8] text-xs">
                    Supabase Auth con protección contra ataques
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <Shield className="w-6 h-6 text-[#00F2A6] mb-2" />
                  <p className="text-white font-semibold text-sm mb-1">Infraestructura</p>
                  <p className="text-[#94A3B8] text-xs">
                    Servidores seguros con auditorías regulares
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#00F2A6]/10">
                  <Lock className="w-6 h-6 text-[#00F2A6] mb-2" />
                  <p className="text-white font-semibold text-sm mb-1">Monitoreo</p>
                  <p className="text-[#94A3B8] text-xs">
                    Detección de amenazas 24/7
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Tus Derechos</h2>
              <div className="space-y-3">
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">✓ Acceso</p>
                  <p className="text-[#94A3B8] text-sm">
                    Solicitar copia de toda tu información personal almacenada.
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">✓ Corrección</p>
                  <p className="text-[#94A3B8] text-sm">
                    Actualizar información incorrecta o desactualizada.
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">✓ Eliminación</p>
                  <p className="text-[#94A3B8] text-sm">
                    Solicitar eliminación de tu cuenta y datos (sujeto a obligaciones legales).
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">✓ Portabilidad</p>
                  <p className="text-[#94A3B8] text-sm">
                    Exportar tus datos en formato estructurado.
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                  <p className="text-white font-semibold mb-2">✓ Objeción</p>
                  <p className="text-[#94A3B8] text-sm">
                    Optar por no recibir comunicaciones de marketing.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies</h2>
              <p className="text-[#94A3B8] mb-3">
                Usamos cookies esenciales para el funcionamiento de la plataforma:
              </p>
              <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                <ul className="text-[#94A3B8] text-sm space-y-2">
                  <li>• <strong className="text-white">Autenticación:</strong> Mantener tu sesión activa</li>
                  <li>• <strong className="text-white">Preferencias:</strong> Recordar configuraciones</li>
                  <li>• <strong className="text-white">Seguridad:</strong> Prevenir fraude y ataques</li>
                </ul>
              </div>
              <p className="text-[#94A3B8] text-sm mt-3">
                Puedes controlar cookies desde la configuración de tu navegador.
              </p>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Retención de Datos</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                Conservamos tu información mientras tu cuenta esté activa y durante el período necesario 
                para cumplir obligaciones legales y resolver disputas. Los datos de acuerdos completados 
                se mantienen por al menos 7 años por requisitos fiscales y legales.
              </p>
            </section>

            {/* Sección 8 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Menores de Edad</h2>
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4">
                <p className="text-[#EF4444] font-semibold mb-2">⚠️ Restricción de Edad:</p>
                <p className="text-[#94A3B8] text-sm">
                  PARTH es solo para usuarios mayores de 18 años. No recopilamos intencionalmente 
                  información de menores. Si detectamos una cuenta de menor, será eliminada inmediatamente.
                </p>
              </div>
            </section>

            {/* Sección 9 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Cambios a esta Política</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                Podemos actualizar esta política ocasionalmente. Los cambios significativos serán 
                notificados con al menos 30 días de anticipación. La fecha de "Última actualización" 
                al inicio indica la versión vigente.
              </p>
            </section>

            {/* Sección 10 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contacto</h2>
              <div className="bg-black/40 rounded-lg p-4 border border-[#0EA5E9]/10">
                <p className="text-[#94A3B8] text-sm mb-3">
                  Para ejercer tus derechos o preguntas sobre privacidad:
                </p>
                <p className="text-[#0EA5E9] font-mono text-sm">privacy@partth.com</p>
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