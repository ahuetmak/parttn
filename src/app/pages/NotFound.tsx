import React from 'react';
import { Link, useLocation } from 'react-router';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFound() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  return (
    <div className={`flex items-center justify-center ${isAppRoute ? 'min-h-[60vh]' : 'min-h-screen bg-black'}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6 max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-[#F59E0B]" />
        </div>

        <h1 className="text-5xl font-bold text-white mb-3">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          Pagina no encontrada
        </h2>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          La ruta <code className="text-[#00F2A6] bg-[#00F2A6]/10 px-2 py-0.5 rounded text-sm">{location.pathname}</code> no existe.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={isAppRoute ? '/app' : '/'}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/30 transition-all"
          >
            <Home className="w-5 h-5" />
            {isAppRoute ? 'Ir al Dashboard' : 'Ir al Inicio'}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-white transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </motion.div>
    </div>
  );
}
