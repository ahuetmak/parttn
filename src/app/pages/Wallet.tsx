import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Diamond, Lock, Clock, TrendingUp, ArrowUpRight, ArrowDownLeft, Eye, Download, AlertTriangle, Plus, CreditCard, ExternalLink, Zap, Wifi, Shield, CheckCircle, BarChart3, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../../lib/api';
import { RecargarModal } from '../components/RecargarModal';

// ── SVG Sparkline ─────────────────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

function Sparkline({ data, width = 200, height = 50, color = '#00F2A6', fill = true }: SparklineProps) {
  const points = useMemo(() => {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [data, width, height]);

  const fillPath = useMemo(() => {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M0,${height} L${pts.join(' L')} L${width},${height} Z`;
  }, [data, width, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && (
        <path d={fillPath} fill={`url(#sg-${color.replace('#', '')})`} />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last point dot */}
      {data.length > 0 && (() => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const lx = width;
        const ly = height - ((data[data.length - 1] - min) / range) * (height - 8) - 4;
        return (
          <circle cx={lx} cy={ly} r="3" fill={color} />
        );
      })()}
    </svg>
  );
}

// ── 15% Engine Lock Badge ─────────────────────────────────────────────────────
function EscrowEngineBadge({ feePARTTH }: { feePARTTH: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#00F2A6]/10 to-transparent rounded-2xl blur-xl" />
      <div className="relative bg-gradient-to-r from-[#00F2A6]/5 to-black border border-[#00F2A6]/30 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/40 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-[#00F2A6]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-xs font-black uppercase tracking-widest">Motor de Escrow Activo</span>
          </div>
          <p className="text-white font-bold text-sm">
            Comisión PARTTH (15%) bloqueada hasta validación IA ≥ 90%
          </p>
          {feePARTTH > 0 && (
            <p className="text-zinc-500 text-xs mt-0.5">
              Fee acumulado: <span className="text-[#00F2A6] font-bold">{feePARTTH.toLocaleString('es-ES')} 💎</span> en custodia
            </p>
          )}
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F2A6] animate-pulse" />
          <span className="text-[#00F2A6] text-xs font-black">BLINDADO</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  subColor: string;
  accentColor: string;
  delay: number;
  sparkData?: number[];
}

function MetricCard({ icon: Icon, label, value, sub, subColor, accentColor, delay, sparkData }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group overflow-hidden"
    >
      <div
        className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor}15, transparent 70%)` }}
      />
      <div
        className="relative bg-gradient-to-br from-zinc-900/60 to-black border rounded-2xl p-5 hover:border-opacity-60 transition-all h-full"
        style={{ borderColor: `${accentColor}25` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}15` }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          {sparkData && sparkData.length > 3 && (
            <div className="w-16 h-8 opacity-60">
              <Sparkline data={sparkData} width={64} height={32} color={accentColor} />
            </div>
          )}
        </div>
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{label}</span>
        <p className="text-2xl font-black text-white mt-1 mb-1">
          {value.toLocaleString('es-ES')}
        </p>
        <p className="text-xs font-semibold" style={{ color: subColor }}>{sub}</p>
      </div>
    </motion.div>
  );
}

// ── Main Wallet Component ─────────────────────────────────────────────────────
export function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecargarModal, setShowRecargarModal] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Simulated sparkline history (replaced by real data when available)
  const [sparkHistory] = useState(() => {
    const base = 1000;
    return Array.from({ length: 12 }, (_, i) =>
      Math.max(0, base + Math.sin(i * 0.8) * 400 + i * 120 + Math.random() * 200)
    );
  });

  useEffect(() => {
    if (user) {
      loadWalletData();
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#00F2A6]/20 rounded-full" />
          <div className="absolute inset-0 w-20 h-20 border-2 border-transparent border-t-[#00F2A6] rounded-full animate-spin" />
          <div className="absolute inset-3 w-14 h-14 border border-[#0EA5E9]/30 border-b-[#0EA5E9] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-zinc-400 text-sm mt-6 font-semibold tracking-wider uppercase">Sincronizando wallet...</p>
      </div>
    );
  }

  const totalBalance = (wallet?.disponible || 0) + (wallet?.enEscrow || 0) + (wallet?.enHold || 0);
  const disponiblePct = totalBalance > 0 ? (wallet?.disponible || 0) / totalBalance * 100 : 0;
  const escrowPct = totalBalance > 0 ? (wallet?.enEscrow || 0) / totalBalance * 100 : 0;
  const holdPct = totalBalance > 0 ? (wallet?.enHold || 0) / totalBalance * 100 : 0;
  const feePARTTH = wallet?.totalTarifasPagadas || 0;

  const balanceSparkData = [...sparkHistory, totalBalance || sparkHistory[sparkHistory.length - 1]];

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black text-white tracking-tight">Wallet</h1>
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
                    <span className="text-[#00F2A6] text-xs font-black uppercase tracking-widest">Live</span>
                    <Wifi className="w-3 h-3 text-[#00F2A6]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-zinc-500 text-sm">
              1 💎 = $1 USD
              {lastSync && (
                <span className="ml-2 text-zinc-700">· Sync {lastSync.toLocaleTimeString('es-ES')}</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRecargarModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black hover:shadow-lg hover:shadow-[#00F2A6]/40 transition-all flex items-center gap-2 group text-sm"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Recargar
            </button>
            <button className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 font-bold hover:border-zinc-600 hover:text-white transition-all flex items-center gap-2 text-sm">
              <ArrowDownLeft className="w-4 h-4" />
              Retirar
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── ESCROW ENGINE BADGE ───────────────────────────────────────── */}
      <EscrowEngineBadge feePARTTH={feePARTTH} />

      {/* ── HERO BALANCE CARD ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/15 via-[#0EA5E9]/8 to-transparent rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-zinc-900/80 to-black border border-[#00F2A6]/25 rounded-3xl overflow-hidden">

          {/* Sparkline strip across the top */}
          <div className="h-20 w-full opacity-30 px-4 pt-2">
            <Sparkline data={balanceSparkData} width={1200} height={64} color="#00F2A6" fill={true} />
          </div>

          <div className="px-8 pb-8 -mt-6">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex items-end gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30 flex-shrink-0">
                  <Diamond className="w-8 h-8 text-black fill-black" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Balance Total</p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-6xl font-black text-white">{totalBalance.toLocaleString('es-ES')}</p>
                    <span className="text-zinc-500 text-lg">💎</span>
                  </div>
                  <p className="text-[#00F2A6] text-lg font-bold mt-1">${totalBalance.toLocaleString('es-ES')} USD</p>
                </div>
              </div>

              {/* Composition bar */}
              {totalBalance > 0 && (
                <div className="w-full md:w-72">
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider mb-2">Composición</p>
                  <div className="flex h-2 rounded-full overflow-hidden gap-px">
                    {disponiblePct > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${disponiblePct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-[#00F2A6]"
                        title={`Disponible ${disponiblePct.toFixed(1)}%`}
                      />
                    )}
                    {escrowPct > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${escrowPct}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full bg-[#0EA5E9]"
                        title={`Escrow ${escrowPct.toFixed(1)}%`}
                      />
                    )}
                    {holdPct > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${holdPct}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-yellow-500"
                        title={`Hold ${holdPct.toFixed(1)}%`}
                      />
                    )}
                    {(100 - disponiblePct - escrowPct - holdPct) > 0 && (
                      <div className="h-full bg-zinc-800 flex-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {[
                      { label: 'Disponible', pct: disponiblePct, color: '#00F2A6' },
                      { label: 'Escrow', pct: escrowPct, color: '#0EA5E9' },
                      { label: 'Hold', pct: holdPct, color: '#F59E0B' },
                    ].filter(s => s.pct > 0).map(s => (
                      <span key={s.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        {s.label} {s.pct.toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── METRIC CARDS GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Diamond, label: 'Disponible', value: wallet?.disponible || 0, sub: `$${(wallet?.disponible || 0).toLocaleString('es-ES')} USD`, subColor: '#00F2A6', accent: '#00F2A6', delay: 0.2, spark: balanceSparkData },
          { icon: Lock, label: 'Escrow', value: wallet?.enEscrow || 0, sub: '🔒 Protegido', subColor: '#0EA5E9', accent: '#0EA5E9', delay: 0.25 },
          { icon: Clock, label: 'Hold', value: wallet?.enHold || 0, sub: '⏱️ 14 días', subColor: '#F59E0B', accent: '#F59E0B', delay: 0.3 },
          { icon: Eye, label: 'Revisión', value: wallet?.enRevision || 0, sub: '🔍 Validando', subColor: '#8B5CF6', accent: '#8B5CF6', delay: 0.35 },
          { icon: TrendingUp, label: 'Ingresos', value: wallet?.totalIngresos || 0, sub: '📈 Histórico', subColor: '#22C55E', accent: '#22C55E', delay: 0.4 },
          { icon: AlertTriangle, label: 'Disputa', value: wallet?.enDisputa || 0, sub: '⚠️ Revisión', subColor: '#EF4444', accent: '#EF4444', delay: 0.45 },
        ].map(m => (
          <MetricCard key={m.label} {...m} sparkData={m.spark} />
        ))}
      </div>

      {/* ── INFO CARDS ────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6 hover:border-[#00F2A6]/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#00F2A6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-base mb-2">Recargas Instantáneas</h3>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  Compra diamantes con tarjeta. Procesamiento seguro con Stripe. Disponibles al instante.
                </p>
                <button
                  onClick={() => setShowRecargarModal(true)}
                  className="text-[#00F2A6] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Recargar ahora <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/5 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6 hover:border-[#0EA5E9]/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#0EA5E9]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-base mb-2">Política de Hold (14 días)</h3>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  Los fondos liberados entran en Hold antes de estar disponibles. Protección anti-fraude automática.
                </p>
                <Link to="/app/pagos-y-hold" className="text-[#0EA5E9] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  Ver detalles <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── FEE STRUCTURE ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F2A6]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#00F2A6]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Estructura de Tarifas</h2>
                <p className="text-zinc-500 text-xs">Transparencia total en cada split</p>
              </div>
            </div>
            <Link to="/app/tarifas" className="text-[#00F2A6] font-bold text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all">
              Calculadora <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-6">
            {[
              { label: 'Fee PARTTH', value: '15%', desc: 'Del total del producto/servicio · Bloqueado en escrow', color: '#00F2A6' },
              { label: 'Comisión Socio', value: '25–40%', desc: 'Configurable por la Marca en cada oferta', color: '#0EA5E9' },
              { label: 'Fee Retiro', value: '1.5%', desc: 'Solo al retirar a cuenta bancaria externa', color: '#8B5CF6' },
            ].map(({ label, value, desc, color }) => (
              <div key={label} className="relative overflow-hidden rounded-xl p-5 bg-black/60 border" style={{ borderColor: `${color}20` }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: `${color}10` }} />
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color }}>{label}</p>
                <p className="text-4xl font-black text-white mb-2">{value}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Split Example */}
          <div className="relative overflow-hidden rounded-xl p-6 border border-[#00F2A6]/15 bg-gradient-to-r from-[#00F2A6]/5 to-transparent">
            <p className="text-white font-black text-sm mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00F2A6]" />
              Ejemplo live: Deal de 1,000 💎
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Total Producto', val: '1,000 💎', color: 'text-white' },
                  { label: 'Fee PARTTH (15%)', val: '-150 💎', color: 'text-red-400' },
                  { label: 'Comisión Socio (25%)', val: '-250 💎', color: 'text-red-400' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between p-2.5 bg-black/40 rounded-lg border border-zinc-800/60">
                    <span className="text-zinc-400">{r.label}</span>
                    <span className={`font-black ${r.color}`}>{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="p-6 bg-[#00F2A6]/8 border-2 border-[#00F2A6]/30 rounded-2xl text-center">
                  <p className="text-zinc-400 text-xs mb-2 font-semibold uppercase tracking-wider">Neto para Marca</p>
                  <p className="text-5xl font-black text-[#00F2A6]">600</p>
                  <p className="text-zinc-400 text-xs mt-1 font-semibold">💎 = $600 USD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TRANSACTION LEDGER ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="relative overflow-hidden"
      >
        <div className="relative bg-gradient-to-br from-zinc-900/50 to-black border border-zinc-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Historial de Transacciones</h2>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 text-zinc-500 text-xs font-bold hover:bg-zinc-900/50 hover:text-white transition-all">
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <Diamond className="w-8 h-8 text-zinc-700 fill-current" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Sin movimientos aún</h3>
                <p className="text-zinc-600 mb-6 text-sm">Tu historial de transacciones aparecerá aquí</p>
                <button
                  onClick={() => setShowRecargarModal(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black hover:shadow-lg hover:shadow-[#00F2A6]/40 transition-all inline-flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Primera Recarga
                </button>
              </div>
            ) : (
              transactions.map((tx, index) => {
                const isPositive = tx.amount > 0;
                const icons: Record<string, any> = {
                  escrow_locked: Lock,
                  released: TrendingUp,
                  deposit: ArrowUpRight,
                  withdrawal: ArrowDownLeft,
                };
                const Icon = icons[tx.type] || Eye;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="flex items-center justify-between p-4 bg-black/50 border border-zinc-800/60 rounded-xl hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-green-500/10 border border-green-500/25' : 'bg-yellow-500/10 border border-yellow-500/25'}`}>
                        <Icon className={`w-5 h-5 ${isPositive ? 'text-green-500' : 'text-yellow-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm mb-0.5">
                          {tx.type === 'escrow_locked' ? 'Fondos bloqueados en escrow' :
                            tx.type === 'released' ? 'Fondos liberados' :
                              tx.type === 'deposit' ? 'Recarga de diamantes' :
                                tx.type === 'withdrawal' ? 'Retiro de fondos' : 'Transacción'}
                        </p>
                        <p className="text-zinc-600 text-xs">
                          {new Date(tx.timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className={`text-lg font-black mb-1 ${isPositive ? 'text-green-400' : 'text-yellow-400'}`}>
                        {isPositive ? '+' : ''}{tx.amount.toLocaleString('es-ES')} 💎
                      </p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${tx.status === 'locked' ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/25' :
                          tx.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/25' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                        }`}>
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

      <RecargarModal
        isOpen={showRecargarModal}
        onClose={() => setShowRecargarModal(false)}
        onSuccess={loadWalletData}
      />
    </div>
  );
}
