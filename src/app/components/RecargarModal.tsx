/**
 * RecargarModal — Recarga de Diamantes con Stripe Elements
 *
 * Flujo:
 * 1. Usuario elige monto
 * 2. Backend crea PaymentIntent → devuelve clientSecret
 * 3. Stripe Elements renderiza formulario de tarjeta (PCI-compliant)
 * 4. Al confirmar, Stripe procesa el pago
 * 5. Webhook POST /webhooks confirma → agrega Diamantes al wallet
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, Diamond, CreditCard, Zap, Lock, CheckCircle, RefreshCw, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../../lib/api';
import { toast } from 'sonner';

// ─── Stripe init ─────────────────────────────────────────────────────────────

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

// ─── Constantes ───────────────────────────────────────────────────────────────

const PRESETS = [
  { amount: 100,   label: '100',   badge: '' },
  { amount: 500,   label: '500',   badge: 'Popular' },
  { amount: 1000,  label: '1,000', badge: '' },
  { amount: 2500,  label: '2,500', badge: 'Pro' },
  { amount: 5000,  label: '5,000', badge: '' },
  { amount: 10000, label: '10,000',badge: 'Elite' },
];

const STRIPE_APPEARANCE = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#00F2A6',
    colorBackground: '#0a0e1a',
    colorText: '#ffffff',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(0, 242, 166, 0.2)',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    '.Input:focus': {
      border: '1px solid #00F2A6',
      boxShadow: '0 0 0 1px #00F2A6',
    },
    '.Label': { color: '#94a3b8', fontWeight: '600' },
    '.Tab': { border: '1px solid rgba(0, 242, 166, 0.2)', backgroundColor: 'rgba(0,0,0,0.4)' },
    '.Tab--selected': { border: '1px solid #00F2A6', backgroundColor: 'rgba(0, 242, 166, 0.1)' },
  },
};

// ─── Inner form (inside Elements context) ────────────────────────────────────

function CheckoutForm({ amount, onSuccess, onCancel }: {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? 'Error en el formulario');
      setProcessing(false);
      return;
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app/wallet?recarga=success`,
      },
      redirect: 'if_required',
    });

    if (confirmErr) {
      setError(confirmErr.message ?? 'Error procesando pago');
      setProcessing(false);
    } else {
      toast.success(`¡${amount.toLocaleString('es-ES')} 💎 agregados a tu wallet!`);
      onSuccess();
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'accordion' }} />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      <div className="flex items-center gap-2 text-zinc-600 text-xs">
        <Lock className="w-3.5 h-3.5" />
        <span>Pago cifrado · PCI DSS Compliant · Procesado por Stripe</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-semibold text-sm hover:bg-zinc-900 transition-all disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #00F2A6, #0EA5E9)',
            color: '#000',
            boxShadow: processing ? 'none' : '0 0 20px rgba(0,242,166,0.3)',
          }}
        >
          {processing ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando...</>
          ) : (
            <><CreditCard className="w-4 h-4" /> Pagar ${amount.toLocaleString('es-ES')} USD</>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Demo mode form (sin Stripe key) ─────────────────────────────────────────

function DemoForm({ amount, userId, onSuccess, onCancel }: {
  amount: number;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    setLoading(true);
    try {
      await walletAPI.recharge(userId, amount);
      toast.success(`Demo: ${amount.toLocaleString('es-ES')} 💎 agregados`);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || 'Error en demo');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-400 font-bold text-sm">Modo Demo</p>
          <p className="text-yellow-500/80 text-xs mt-0.5">
            Agrega <code className="bg-black/40 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…</code> al
            archivo <code className="bg-black/40 px-1 rounded">.env.local</code> para activar pagos reales.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-semibold text-sm hover:bg-zinc-900 transition-all">
          Cancelar
        </button>
        <button onClick={handleDemo} disabled={loading}
          className="flex-1 py-3 rounded-xl bg-[#00F2A6] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00F2A6]/90 transition-all disabled:opacity-50">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Diamond className="w-4 h-4 fill-current" />}
          Simular Recarga
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'select' | 'checkout' | 'success';

export function RecargarModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('select');
  const [loadingIntent, setLoadingIntent] = useState(false);

  const selectedAmount = customAmount ? parseInt(customAmount) || 0 : amount;

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setClientSecret(null);
      setCustomAmount('');
      setAmount(500);
    }
  }, [isOpen]);

  const handleContinue = async () => {
    if (!user || selectedAmount < 10) { toast.error('Monto mínimo: 10 💎'); return; }

    if (!STRIPE_KEY) {
      // Modo demo: saltar al checkout con formulario simulado
      setStep('checkout');
      return;
    }

    setLoadingIntent(true);
    try {
      const data = await walletAPI.recharge(user.id, selectedAmount);
      setClientSecret(data.clientSecret);
      setStep('checkout');
    } catch (e: any) {
      toast.error(e.message || 'Error creando orden de pago');
    } finally { setLoadingIntent(false); }
  };

  const handleSuccess = () => {
    setStep('success');
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md mx-4 bg-gradient-to-br from-zinc-900 to-black border border-[#00F2A6]/20 rounded-3xl overflow-hidden shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-zinc-800/60">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
                <Diamond className="w-5 h-5 text-black fill-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Recargar Diamantes</h2>
                <p className="text-zinc-500 text-xs">1 💎 = $1 USD · Fondos disponibles al instante</p>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Selección de monto ───────────────────────── */}
            {step === 'select' && (
              <motion.div key="select"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3 block">
                    Elige tu recarga
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map(({ amount: a, label, badge }) => (
                      <button
                        key={a}
                        onClick={() => { setAmount(a); setCustomAmount(''); }}
                        className={`relative py-3 px-2 rounded-xl font-bold text-sm transition-all ${
                          amount === a && !customAmount
                            ? 'bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] text-black shadow-lg shadow-[#00F2A6]/20'
                            : 'bg-black/40 text-white border border-zinc-800 hover:border-[#00F2A6]/30'
                        }`}
                      >
                        {badge && (
                          <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full font-bold ${
                            amount === a && !customAmount ? 'bg-black/30 text-black' : 'bg-[#00F2A6]/20 text-[#00F2A6]'
                          }`}>{badge}</span>
                        )}
                        {label} 💎
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                    Monto personalizado
                  </label>
                  <div className="relative">
                    <Diamond className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F2A6] fill-current" />
                    <input
                      type="number"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder="Escribe una cantidad"
                      min="10"
                      className="w-full pl-9 pr-4 py-3 bg-black/40 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] transition-colors"
                    />
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Diamantes a recibir</span>
                    <span className="text-white font-bold">{selectedAmount.toLocaleString('es-ES')} 💎</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Fee de procesamiento</span>
                    <span className="text-[#00F2A6] font-bold">$0</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-2 flex justify-between">
                    <span className="text-white font-bold">Total a pagar</span>
                    <span className="text-[#00F2A6] font-bold text-xl">
                      ${selectedAmount.toLocaleString('es-ES')} USD
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={loadingIntent || selectedAmount < 10}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #00F2A6, #0EA5E9)',
                    color: '#000',
                    boxShadow: '0 0 24px rgba(0,242,166,0.25)',
                  }}
                >
                  {loadingIntent
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Preparando pago...</>
                    : <><Zap className="w-4 h-4" /> Continuar al pago</>
                  }
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Checkout ─────────────────────────────────── */}
            {step === 'checkout' && (
              <motion.div key="checkout"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2">
                  <p className="text-zinc-400 text-sm">
                    Pagando <span className="text-white font-bold">${selectedAmount.toLocaleString('es-ES')} USD</span>
                  </p>
                  <button onClick={() => setStep('select')}
                    className="text-zinc-500 text-xs hover:text-white transition-colors">
                    ← Cambiar monto
                  </button>
                </div>

                {stripePromise && clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
                  >
                    <CheckoutForm
                      amount={selectedAmount}
                      onSuccess={handleSuccess}
                      onCancel={onClose}
                    />
                  </Elements>
                ) : (
                  <DemoForm
                    amount={selectedAmount}
                    userId={user?.id ?? ''}
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                  />
                )}
              </motion.div>
            )}

            {/* ── Step 3: Éxito ────────────────────────────────────── */}
            {step === 'success' && (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-[#00F2A6]/20 border-2 border-[#00F2A6] flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-10 h-10 text-[#00F2A6]" />
                </motion.div>

                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    +{selectedAmount.toLocaleString('es-ES')} 💎
                  </p>
                  <p className="text-[#00F2A6] font-semibold">Diamantes agregados a tu wallet</p>
                  <p className="text-zinc-500 text-sm mt-1">Fondos disponibles de inmediato</p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all"
                >
                  Ver mi Wallet
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
