import React, { useState } from 'react';
import { X, Diamond, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { salasAPI, walletAPI } from '../../lib/api';
import { toast } from 'sonner';

interface CrearSalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CrearSalaModal({ isOpen, onClose, onSuccess }: CrearSalaModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  
  // Form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [socioId, setSocioId] = useState('');
  const [totalProducto, setTotalProducto] = useState(100);
  const [comisionSocio, setComisionSocio] = useState(25);

  React.useEffect(() => {
    if (isOpen && user) {
      loadWallet();
    }
  }, [isOpen, user]);

  const loadWallet = async () => {
    try {
      const data = await walletAPI.getBalance(user!.id);
      setWallet(data);
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  // Calcular comisiones
  const feePARTTH = totalProducto * 0.15;
  const gananciaSocio = totalProducto * (comisionSocio / 100);
  const netoMarca = totalProducto - feePARTTH - gananciaSocio;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (wallet && wallet.disponible < totalProducto) {
      toast.error('Fondos insuficientes. Recarga tu wallet primero.');
      return;
    }

    if (!socioId || !titulo || !descripcion) {
      toast.error('Completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      
      await salasAPI.createSala({
        marcaId: user.id,
        socioId,
        titulo,
        descripcion,
        totalProducto,
        comisionSocio,
      });

      toast.success('Sala digital creada exitosamente');
      
      // Reset form
      setTitulo('');
      setDescripcion('');
      setSocioId('');
      setTotalProducto(100);
      setComisionSocio(25);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating sala:', error);
      toast.error(error.message || 'Error creando sala');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Crear Sala Digital</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#00F2A6]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Balance disponible */}
          {wallet && (
            <div className="bg-black/40 rounded-xl p-4 border border-[#00F2A6]/10">
              <p className="text-[#64748B] text-sm mb-1">Tu balance disponible</p>
              <p className="text-2xl font-bold text-[#00F2A6]">{wallet.disponible.toLocaleString()} 💎</p>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-white font-semibold mb-2">Título del Acuerdo</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors"
              placeholder="Ej: Campaña de marketing digital"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-white font-semibold mb-2">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors min-h-[100px]"
              placeholder="Describe qué esperas del socio..."
              required
            />
          </div>

          {/* ID del Socio */}
          <div>
            <label className="block text-white font-semibold mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              ID del Socio
            </label>
            <input
              type="text"
              value={socioId}
              onChange={(e) => setSocioId(e.target.value)}
              className="w-full bg-black/40 border border-[#0EA5E9]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5E9] transition-colors"
              placeholder="UUID del socio"
              required
            />
            <p className="text-[#64748B] text-xs mt-2">
              El socio debe estar registrado en PARTH
            </p>
          </div>

          {/* Total Producto */}
          <div>
            <label className="block text-white font-semibold mb-2">
              <Diamond className="w-4 h-4 inline mr-2 fill-current text-[#00F2A6]" />
              Total del Producto (Diamantes)
            </label>
            <input
              type="number"
              value={totalProducto}
              onChange={(e) => setTotalProducto(Number(e.target.value))}
              className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors"
              min="10"
              required
            />
            <p className="text-[#64748B] text-xs mt-2">
              Mínimo: 10 diamantes
            </p>
          </div>

          {/* Comisión Socio */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Comisión del Socio (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="40"
                value={comisionSocio}
                onChange={(e) => setComisionSocio(Number(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="40"
                value={comisionSocio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0 && val <= 40) setComisionSocio(val);
                }}
                className="w-20 bg-black/40 border border-[#0EA5E9]/20 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-[#0EA5E9]"
              />
              <span className="text-white">%</span>
            </div>
            <p className="text-[#64748B] text-xs mt-2">
              Máximo: 40%
            </p>
          </div>

          {/* Desglose */}
          <div className="bg-black/40 rounded-xl p-6 border border-[#00F2A6]/10 space-y-3">
            <h3 className="text-white font-bold mb-4">Desglose del Acuerdo</h3>
            
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total del Producto:</span>
              <span className="text-white font-bold">{totalProducto.toLocaleString()} 💎</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[#64748B]">Fee PARTH (15%):</span>
              <span className="text-[#F59E0B] font-bold">-{feePARTTH.toLocaleString()} 💎</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[#64748B]">Ganancia Socio ({comisionSocio}%):</span>
              <span className="text-[#0EA5E9] font-bold">-{gananciaSocio.toLocaleString()} 💎</span>
            </div>
            
            <div className="pt-3 border-t border-[#00F2A6]/20 flex justify-between">
              <span className="text-white font-bold">Neto para ti (Marca):</span>
              <span className="text-[#10B981] font-bold text-xl">{netoMarca.toLocaleString()} 💎</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4">
            <p className="text-[#F59E0B] text-sm">
              ⚠️ Al crear esta sala, {totalProducto} 💎 se bloquearán en escrow y solo se liberarán cuando apruebes la evidencia del socio.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-[#64748B]/30 text-[#64748B] font-semibold hover:bg-[#64748B]/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (wallet && wallet.disponible < totalProducto)}
              className="flex-1 px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,166,0.3)]"
            >
              {loading ? 'Creando...' : 'Crear Sala Digital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}