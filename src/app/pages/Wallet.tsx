import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Diamond, Lock, Clock, TrendingUp, ArrowUpRight, ArrowDownLeft, Eye, Download, AlertTriangle, Plus, CreditCard, ExternalLink, Zap, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../../lib/api';
import { RecargarModal } from '../components/RecargarModal';

export function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecargarModal, setShowRecargarModal] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      loadWalletData();
      // Refresh every 30 seconds
      const interval = setInterval(loadWalletData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, txData] = await Promise.all([
        walletAPI.getBalance(user!.id),
        walletAPI.getTransactions(user!.id),
      ]);
      setWallet(walletData);
      setTransactions(txData);
      setIsLive(true);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error loading wallet:', error);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-[#00F2A6]/20 border-t-[#00F2A6] rounded-full animate-spin mb-6" />
        <p className="text-zinc-400 text-lg">Cargando tu wallet...</p>
      </div>
    );
  }

  const totalBalance = (wallet?.disponible || 0) + (wallet?.enEscrow || 0) + (wallet?.enHold || 0);
  const disponiblePct = totalBalance > 0 ? (wallet?.disponible || 0) / totalBalance * 100 : 0;
  const escrowPct = totalBalance > 0 ? (wallet?.enEscrow || 0) / totalBalance * 100 : 0;
  const holdPct = totalBalance > 0 ? (wallet?.enHold || 0) / totalBalance * 100 : 0;
  const otherPct = 100 - disponiblePct - escrowPct - holdPct;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Wallet</h1>
            <div className="flex items-center gap-3">
              <p className="text-zinc-400 text-lg">Gestiona tus diamantes · 1 💎 = $1 USD</p>
              <AnimatePresence>
                {isLive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00F2A6]/10 border border-[#00F2A6]/30"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2A6] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F2A6]" />
                    </span>
                    <span className="text-[#00F2A6] text-xs font-bold uppercase tracking-wider">Live</span>
                    <Wifi className="w-3 h-3 text-[#00F2A6]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {lastSync && (
              <p className="text-zinc-600 text-xs mt-1">
                Última sincronización: {lastSync.toLocaleTimeString('es-ES')}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowRecargarModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all flex items-center gap-2 group whitespace-nowrap"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Recargar Diamantes
          </button>
        </div>

        {/* Cashflow Composition Bar */}
        {totalBalance > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mt-4 origin-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Composición del Saldo</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
              {disponiblePct > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${disponiblePct}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-[#00F2A6] rounded-l-full"
                  title={`Disponible: ${disponiblePct.toFixed(1)}%`}
                />
              )}
              {escrowPct > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${escrowPct}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full bg-[#0EA5E9]"
                  title={`Escrow: ${escrowPct.toFixed(1)}%`}
                />
              )}
              {holdPct > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${holdPct}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-yellow-500"
                  title={`Hold: ${holdPct.toFixed(1)}%`}
                />
              )}
              {otherPct > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${otherPct}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="h-full bg-zinc-700 rounded-r-full"
                />
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#00F2A6]" />
                Disponible {disponiblePct.toFixed(0)}%
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#0EA5E9]" />
                Escrow {escrowPct.toFixed(0)}%
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Hold {holdPct.toFixed(0)}%
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Total Balance - Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/20 via-[#0EA5E9]/10 to-transparent rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-zinc-900/80 to-black border border-[#00F2A6]/30 rounded-3xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                <Diamond className="w-10 h-10 text-black fill-black" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Balance Total</p>
                <p className="text-6xl font-bold text-white mb-2">{totalBalance.toLocaleString('es-ES')}</p>
                <p className="text-[#00F2A6] text-xl font-semibold">${totalBalance.toLocaleString('es-ES')} USD</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowRecargarModal(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all flex items-center justify-center gap-2 group"
              >
                <CreditCard className="w-5 h-5" />
                Recargar con Stripe
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-xl border-2 border-[#00F2A6]/30 text-[#00F2A6] font-bold hover:bg-[#00F2A6]/10 transition-all flex items-center justify-center gap-2">
                <ArrowDownLeft className="w-5 h-5" />
                Retirar Fondos
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Balance Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Disponible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#00F2A6]/20 rounded-2xl p-5 hover:border-[#00F2A6]/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#00F2A6]/10 flex items-center justify-center">
                <Diamond className="w-4 h-4 text-[#00F2A6] fill-current" />
              </div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Disponible
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{wallet?.disponible?.toLocaleString('es-ES') || 0}</p>
            <p className="text-[#00F2A6] text-sm font-semibold">${wallet?.disponible?.toLocaleString('es-ES') || 0}</p>
          </div>
        </motion.div>

        {/* En Escrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#0EA5E9]/20 rounded-2xl p-5 hover:border-[#0EA5E9]/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#0EA5E9]" />
              </div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Escrow
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{wallet?.enEscrow?.toLocaleString('es-ES') || 0}</p>
            <p className="text-[#0EA5E9] text-sm font-semibold">🔒 Protegido</p>
          </div>
        </motion.div>

        {/* En Hold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Hold
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{wallet?.enHold?.toLocaleString('es-ES') || 0}</p>
            <p className="text-yellow-500 text-sm font-semibold">⏱️ 14 días</p>
          </div>
        </motion.div>

        {/* En Revisión */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-[#8B5CF6]/20 rounded-2xl p-5 hover:border-[#8B5CF6]/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Revisión
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{wallet?.enRevision?.toLocaleString('es-ES') || 0}</p>
            <p className="text-[#8B5CF6] text-sm font-semibold">🔍 Validando</p>
          </div>
        </motion.div>

        {/* Total Ingresos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-green-500/20 rounded-2xl p-5 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Ingresos
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{wallet?.totalIngresos?.toLocaleString('es-ES') || 0}</p>
            <p className="text-green-500 text-sm font-semibold">📈 Histórico</p>
          </div>
        </motion.div>

        {/* En Disputa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-red-500/20 rounded-2xl p-5 hover:border-red-500/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Disputa
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{wallet?.enDisputa?.toLocaleString('es-ES') || 0}</p>
            <p className="text-red-500 text-sm font-semibold">⚠️ Revisión</p>
          </div>
        </motion.div>
      </div>

      {/* Info Cards Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-[#00F2A6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">Recargas Instantáneas</h3>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  Compra diamantes con tarjeta de crédito/débito. Procesamiento seguro con Stripe. Tus fondos están disponibles al instante.
                </p>
                <button
                  onClick={() => setShowRecargarModal(true)}
                  className="text-[#00F2A6] font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Recargar ahora
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/5 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-[#0EA5E9]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">Política de Hold (14 días)</h3>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  Los fondos liberados entran en Hold por 14 días antes de estar disponibles. Protección contra fraudes y chargebacks.
                </p>
                <Link to="/app/pagos-y-hold" className="text-[#0EA5E9] font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  Ver detalles completos
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transaction Ledger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Historial de Transacciones</h2>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 font-semibold hover:bg-zinc-900/50 hover:text-white transition-all">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                  <Diamond className="w-10 h-10 text-zinc-600 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No hay transacciones aún</h3>
                <p className="text-zinc-500 mb-6">Tu historial de movimientos aparecerá aquí</p>
                <button
                  onClick={() => setShowRecargarModal(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Hacer Primera Recarga
                </button>
              </div>
            ) : (
              transactions.map((tx, index) => {
                const isPositive = tx.amount > 0;
                const Icon = tx.type === 'escrow_locked' ? Lock :
                  tx.type === 'released' ? TrendingUp :
                    tx.type === 'deposit' ? ArrowUpRight :
                      tx.type === 'withdrawal' ? ArrowDownLeft :
                        Eye;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-black/60 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPositive
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-yellow-500/10 border border-yellow-500/30'
                          }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${isPositive ? 'text-green-500' : 'text-yellow-500'
                            }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold mb-1 leading-snug">
                          {tx.type === 'escrow_locked' ? 'Fondos bloqueados en escrow' :
                            tx.type === 'released' ? 'Fondos liberados' :
                              tx.type === 'deposit' ? 'Recarga de diamantes' :
                                tx.type === 'withdrawal' ? 'Retiro de fondos' :
                                  'Transacción'}
                        </p>
                        <p className="text-zinc-500 text-sm">
                          {new Date(tx.timestamp).toLocaleString('es-ES', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p
                        className={`text-2xl font-bold mb-1 ${isPositive ? 'text-green-500' : 'text-yellow-500'
                          }`}
                      >
                        {isPositive ? '+' : ''}
                        {tx.amount.toLocaleString('es-ES')} 💎
                      </p>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${tx.status === 'locked'
                            ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/30'
                            : tx.status === 'completed'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                          }`}
                      >
                        {tx.status === 'locked' ? 'Bloqueado' :
                          tx.status === 'completed' ? 'Completado' :
                            tx.status === 'processing' ? 'Procesando' : tx.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Explicación de Tarifas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Estructura de Tarifas</h2>
              <p className="text-zinc-400">Transparencia total en cada transacción</p>
            </div>
            <Link to="/app/tarifas" className="text-[#00F2A6] font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Calculadora completa
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-xl" />
              <div className="relative p-6 bg-black/60 border border-[#00F2A6]/20 rounded-xl">
                <p className="text-[#00F2A6] font-bold mb-2 uppercase tracking-wider text-sm">Fee PARTH</p>
                <p className="text-5xl font-bold text-white mb-3">15%</p>
                <p className="text-zinc-400 text-sm leading-relaxed">Del total del producto/servicio por uso de plataforma</p>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/5 to-transparent rounded-xl" />
              <div className="relative p-6 bg-black/60 border border-[#0EA5E9]/20 rounded-xl">
                <p className="text-[#0EA5E9] font-bold mb-2 uppercase tracking-wider text-sm">Comisión Socio</p>
                <p className="text-5xl font-bold text-white mb-3">25-40%</p>
                <p className="text-zinc-400 text-sm leading-relaxed">Configurable por la Marca en cada oferta</p>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent rounded-xl" />
              <div className="relative p-6 bg-black/60 border border-[#8B5CF6]/20 rounded-xl">
                <p className="text-[#8B5CF6] font-bold mb-2 uppercase tracking-wider text-sm">Fee Retiro</p>
                <p className="text-5xl font-bold text-white mb-3">1.5%</p>
                <p className="text-zinc-400 text-sm leading-relaxed">Solo al retirar a cuenta bancaria externa</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F2A6]/10 to-transparent rounded-xl blur-xl" />
            <div className="relative p-6 bg-gradient-to-r from-[#00F2A6]/5 to-transparent border border-[#00F2A6]/20 rounded-xl">
              <p className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00F2A6]" />
                Ejemplo: Producto de 1,000 💎
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-zinc-300">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <span>Total Producto:</span>
                    <span className="font-bold text-white">1,000 💎</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <span>Fee PARTH (15%):</span>
                    <span className="font-bold text-red-400">-150 💎</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <span>Comisión Socio (25%):</span>
                    <span className="font-bold text-red-400">-250 💎</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="p-6 bg-[#00F2A6]/10 border-2 border-[#00F2A6]/30 rounded-xl text-center">
                    <p className="text-zinc-400 text-sm mb-2">Neto para Marca</p>
                    <p className="text-5xl font-bold text-[#00F2A6]">600 💎</p>
                    <p className="text-zinc-400 text-xs mt-2">= $600 USD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recargar Modal */}
      <RecargarModal
        isOpen={showRecargarModal}
        onClose={() => setShowRecargarModal(false)}
        onSuccess={loadWalletData}
      />
    </div>
  );
}