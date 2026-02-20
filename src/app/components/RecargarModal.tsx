import React, { useState } from 'react';
import { X, Diamond, CreditCard, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../../lib/api';
import { toast } from 'sonner';

interface RecargarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

export function RecargarModal({ isOpen, onClose, onSuccess }: RecargarModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    if (!user) return;
    
    if (amount < 10) {
      toast.error('Monto mínimo: 10 diamantes');
      return;
    }

    try {
      setLoading(true);
      
      // Crear Payment Intent
      const data = await walletAPI.recharge(user.id, amount);
      
      // En producción, aquí redirigiríamos a Stripe Checkout
      // Por ahora, simulamos éxito inmediato
      toast.info('🚧 En esta versión demo, la recarga es instantánea');
      
      // Simular webhook de Stripe agregando fondos directamente
      // (En producción, esto lo haría el webhook de Stripe)
      setTimeout(() => {
        toast.success(`${amount} 💎 agregados a tu wallet`);
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error recharging:', error);
      toast.error(error.message || 'Error procesando recarga');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recargar Diamantes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#00F2A6]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Info */}
          <div className="bg-[#00F2A6]/10 border border-[#00F2A6]/20 rounded-xl p-4">
            <p className="text-[#00F2A6] text-sm">
              💎 1 Diamante = $1 USD
            </p>
          </div>

          {/* Preset Amounts */}
          <div>
            <label className="block text-white font-semibold mb-3">Montos rápidos</label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    amount === preset
                      ? 'bg-[#00F2A6] text-black'
                      : 'bg-black/40 text-white border border-[#00F2A6]/20 hover:border-[#00F2A6]/40'
                  }`}
                >
                  {preset.toLocaleString()} 💎
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-white font-semibold mb-2">
              <Diamond className="w-4 h-4 inline mr-2 fill-current text-[#00F2A6]" />
              Monto personalizado
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors"
              min="10"
              placeholder="100"
            />
            <p className="text-[#64748B] text-xs mt-2">
              Mínimo: 10 diamantes
            </p>
          </div>

          {/* Total */}
          <div className="bg-black/40 rounded-xl p-4 border border-[#00F2A6]/10">
            <div className="flex justify-between mb-2">
              <span className="text-[#94A3B8]">Diamantes:</span>
              <span className="text-white font-bold">{amount.toLocaleString()} 💎</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[#94A3B8]">Procesamiento:</span>
              <span className="text-white font-bold">$0 USD</span>
            </div>
            <div className="pt-2 border-t border-[#00F2A6]/20 flex justify-between">
              <span className="text-white font-bold">Total a pagar:</span>
              <span className="text-[#00F2A6] font-bold text-xl">${amount.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Warning Demo */}
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4">
            <p className="text-[#F59E0B] text-sm">
              🚧 <strong>MODO DEMO:</strong> En producción, esto abrirá Stripe Checkout. 
              Los fondos se agregarán instantáneamente para testing.
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
              onClick={handleRecharge}
              disabled={loading || amount < 10}
              className="flex-1 px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,166,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Recargar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
