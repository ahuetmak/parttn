import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GradientButton } from '../components/GradientButton';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Email o contraseña incorrectos');
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const { error: googleError } = await signInWithGoogle();

    if (googleError) {
      setError('Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

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
          <p className="text-[#94A3B8] mt-3 text-lg">Sistema de acceso protegido</p>
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-12 py-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#94A3B8] cursor-pointer">
                <input type="checkbox" className="rounded" />
                Recordar sesión
              </label>
              <a href="#" className="text-[#00F2A6] hover:text-[#00F2A6]/80 font-semibold">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <GradientButton 
              type="submit" 
              className="w-full py-4 text-lg" 
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </GradientButton>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#00F2A6]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-[#0A0E1A] to-black text-[#94A3B8]">
                  O continuar con
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-6 w-full bg-white hover:bg-gray-50 text-black font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-[#94A3B8]">
            ¿No tienes cuenta?{' '}
            <Link to="/role-selection" className="text-[#00F2A6] hover:text-[#00F2A6]/80 font-semibold">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}