import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GradientButton } from '../components/GradientButton';
import { Building2, TrendingUp, Shield, Lock, FileCheck, Mail, User, Key, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export function RoleSelection() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'marca' | 'socio' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'marca' | 'socio') => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) return;

    setError('');
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, name, selectedRole);

    if (signUpError) {
      setError(typeof signUpError === 'string' ? signUpError : 'Error al crear cuenta');
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F2A6]/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-[150px]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-3">
              <Logo size={48} className="text-[#00F2A6]" />
              <span className="text-4xl font-bold tracking-wider text-white">PARTTH</span>
            </Link>
            <p className="text-[#94A3B8] mt-3 text-lg">
              Crear cuenta como <span className="text-[#00F2A6] font-bold">{selectedRole === 'marca' ? 'Marca' : 'Socio'}</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-3xl p-8 backdrop-blur-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-white font-semibold">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-12 py-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-white font-semibold">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-12 py-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-white font-semibold">Contraseña</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-12 py-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <GradientButton 
                type="submit" 
                className="w-full py-4 text-lg" 
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </GradientButton>
            </form>

            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="w-full mt-4 text-[#94A3B8] hover:text-white transition-colors text-sm"
            >
              ← Volver a selección de rol
            </button>

            <div className="mt-6 text-center text-sm text-[#94A3B8]">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#00F2A6] hover:text-[#00F2A6]/80 font-semibold">
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00F2A6]/10 rounded-full blur-[200px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#0EA5E9]/10 rounded-full blur-[200px]"></div>
      
      <div className="w-full max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Logo size={56} className="text-[#00F2A6]" />
            <span className="text-5xl font-bold tracking-wider text-white">PARTTH</span>
          </Link>
          <p className="text-[#94A3B8] mt-4 text-2xl">Selecciona tu rol en el marketplace</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Marca Card */}
          <button onClick={() => handleRoleSelect('marca')} className="text-left">
            <div className="group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/20 to-transparent rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-[#0A0E1A] to-black border-2 border-[#00F2A6]/30 rounded-3xl p-10 hover:border-[#00F2A6]/60 transition-all duration-300 cursor-pointer h-full">
                <div className="w-20 h-20 rounded-2xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-10 h-10 text-[#00F2A6]" />
                </div>
                
                <h3 className="text-4xl text-center mb-3 text-white font-bold">Marca</h3>
                <p className="text-center text-[#94A3B8] mb-8 text-lg">Empresas que publican oportunidades</p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-3 bg-black/40 rounded-xl p-4 border border-[#00F2A6]/10">
                    <Shield className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Publica oportunidades protegidas</p>
                      <p className="text-[#64748B] text-sm">Fondos en escrow hasta validación</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-black/40 rounded-xl p-4 border border-[#00F2A6]/10">
                    <FileCheck className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Valida evidencia de trabajo</p>
                      <p className="text-[#64748B] text-sm">Sistema de pruebas verificables</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-black/40 rounded-xl p-4 border border-[#00F2A6]/10">
                    <Lock className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Control total del proceso</p>
                      <p className="text-[#64748B] text-sm">Aprueba o disputa con evidencia</p>
                    </div>
                  </div>
                </div>
                
                <GradientButton className="w-full py-4 text-lg">
                  Continuar como Marca
                </GradientButton>
              </div>
            </div>
          </button>

          {/* Socio Card */}
          <button onClick={() => handleRoleSelect('socio')} className="text-left">
            <div className="group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/20 to-transparent rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-[#0A0E1A] to-black border-2 border-[#0EA5E9]/30 rounded-3xl p-10 hover:border-[#0EA5E9]/60 transition-all duration-300 cursor-pointer h-full">
                <div className="w-20 h-20 rounded-2xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-10 h-10 text-[#0EA5E9]" />
                </div>
                
                <h3 className="text-4xl text-center mb-3 text-white font-bold">Socio</h3>
                <p className="text-center text-[#94A3B8] mb-8 text-lg">Ejecutores y vendedores verificados</p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-3 bg-black/40 rounded-xl p-4 border border-[#0EA5E9]/10">
                    <Shield className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Accede a oportunidades verificadas</p>
                      <p className="text-[#64748B] text-sm">Solo acuerdos con fondos protegidos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-black/40 rounded-xl p-4 border border-[#0EA5E9]/10">
                    <FileCheck className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Sube evidencia de trabajo</p>
                      <p className="text-[#64748B] text-sm">Prueba tu trabajo para liberar pago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-black/40 rounded-xl p-4 border border-[#0EA5E9]/10">
                    <Lock className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Cobra con garantía</p>
                      <p className="text-[#64748B] text-sm">Pagos automáticos tras validación</p>
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-[#0EA5E9] text-black rounded-xl px-6 py-4 text-lg font-bold hover:bg-[#0EA5E9]/90 transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                  Continuar como Socio
                </button>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-[#94A3B8] hover:text-white transition-colors">
            ¿Ya tienes cuenta? <span className="text-[#00F2A6] font-semibold">Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}