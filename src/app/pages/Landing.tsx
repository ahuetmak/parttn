import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Shield, FileCheck, Award, Lock, Diamond, Users, Building2, ArrowRight, CheckCircle, Zap, TrendingUp, Clock, ChevronRight, Star, BarChart3, Cpu, Globe, DollarSign } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef(false);
  const inViewRef = useRef(null);
  const inView = useInView(inViewRef, { once: true });

  useEffect(() => {
    if (!inView || ref.current) return;
    ref.current = true;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { value, ref: inViewRef };
}

// ── Live Ticker Bar ────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { label: '💎 Nueva sala creada', detail: 'Brand → Socio Elite · $2,400', color: '#00F2A6' },
  { label: '✅ Evidencia aprobada', detail: 'Score IA: 96.2% · Fondos liberados', color: '#0EA5E9' },
  { label: '🔒 Escrow bloqueado', detail: '5,000 💎 · Sala #4471', color: '#8B5CF6' },
  { label: '💎 Nueva sala creada', detail: 'E-Commerce → Digital Closer · $850', color: '#00F2A6' },
  { label: '⚡ Pago instantáneo', detail: 'Socio Verificado · +$1,700 💎', color: '#00F2A6' },
  { label: '✅ Evidencia aprobada', detail: 'Score IA: 91.8% · Auto-release', color: '#0EA5E9' },
  { label: '🔒 Escrow bloqueado', detail: '12,000 💎 · Campaña Premium', color: '#8B5CF6' },
  { label: '⭐ Review 5/5 publicada', detail: 'Deal completado en 4 días', color: '#F59E0B' },
];

function TickerBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-black/95 border-b border-[#00F2A6]/20 overflow-hidden h-9 flex items-center">
      <div className="flex items-center gap-2 px-4 flex-shrink-0 border-r border-[#00F2A6]/20 mr-4 h-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2A6] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F2A6]" />
        </span>
        <span className="text-[#00F2A6] text-xs font-bold tracking-widest uppercase whitespace-nowrap">EN VIVO</span>
      </div>
      <div className="overflow-hidden flex-1">
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-xs">
              <span style={{ color: item.color }} className="font-bold">{item.label}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-400">{item.detail}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Mini Dashboard Mockup (hero visual) ───────────────────────────────────────
function DashboardMockup() {
  const bars = [35, 55, 40, 70, 60, 85, 72, 90, 78, 95];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      className="relative w-full max-w-lg mx-auto"
      style={{ perspective: 1000 }}
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/30 via-[#0EA5E9]/20 to-[#8B5CF6]/20 rounded-3xl blur-3xl" />

      <div className="relative bg-gradient-to-br from-zinc-900/90 to-black/95 border border-[#00F2A6]/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-[#00F2A6]/10">
        {/* Mockup Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
              <Diamond className="w-5 h-5 text-black fill-black" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Wallet PARTTH</p>
              <p className="text-zinc-500 text-xs">Balance en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00F2A6]/10 border border-[#00F2A6]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2A6] animate-pulse" />
            <span className="text-[#00F2A6] text-xs font-bold">LIVE</span>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-5">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
          <motion.p
            className="text-5xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            24,800
          </motion.p>
          <p className="text-[#00F2A6] font-semibold mt-1">$24,800 USD <span className="text-green-400 text-sm">+12.4%</span></p>
        </div>

        {/* Sparkline bars */}
        <div className="flex items-end gap-1 h-14 mb-5">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 1 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
              className="flex-1 rounded-sm"
              style={{
                background: i === bars.length - 1
                  ? 'linear-gradient(to top, #00F2A6, #0EA5E9)'
                  : 'rgba(0, 242, 166, 0.25)'
              }}
            />
          ))}
        </div>

        {/* Mini metrics row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Escrow', value: '8,200', color: '#0EA5E9', icon: '🔒' },
            { label: 'Disponible', value: '14,400', color: '#00F2A6', icon: '💎' },
            { label: 'Hold', value: '2,200', color: '#F59E0B', icon: '⏱️' },
          ].map(m => (
            <div key={m.label} className="bg-black/60 rounded-xl p-3 border border-zinc-800">
              <p className="text-zinc-500 text-xs mb-1">{m.icon} {m.label}</p>
              <p className="font-bold text-white text-sm">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Live event */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="mt-4 flex items-center gap-3 p-3 bg-[#00F2A6]/5 border border-[#00F2A6]/20 rounded-xl"
        >
          <CheckCircle className="w-4 h-4 text-[#00F2A6] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">Evidencia aprobada · Score: 94.1%</p>
            <p className="text-zinc-500 text-xs">+4,250 💎 liberados · hace 2 min</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Income Calculator ─────────────────────────────────────────────────────────
function IncomeCalculator() {
  const [deal, setDeal] = useState(5000);

  const fee = deal * 0.15;
  const socio = deal * 0.85;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/15 via-[#0EA5E9]/10 to-transparent rounded-3xl blur-3xl group-hover:blur-[40px] transition-all" />
      <div className="relative bg-gradient-to-br from-zinc-900/70 to-black border border-[#00F2A6]/30 rounded-3xl p-8 md:p-10 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Calculadora de Ingresos</h3>
            <p className="text-zinc-500 text-sm">Ve cuánto gana cada parte en tiempo real</p>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            <label className="text-zinc-400 text-sm font-semibold">Valor del Deal</label>
            <span className="text-white font-bold">{deal.toLocaleString('es-ES')} 💎 = ${deal.toLocaleString('es-ES')} USD</span>
          </div>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={deal}
            onChange={e => setDeal(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00F2A6 ${(deal - 500) / (50000 - 500) * 100}%, #27272a ${(deal - 500) / (50000 - 500) * 100}%)`
            }}
          />
          <div className="flex justify-between text-zinc-600 text-xs mt-1">
            <span>$500</span>
            <span>$50,000</span>
          </div>
        </div>

        {/* Split visual */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="relative overflow-hidden rounded-2xl p-6 bg-black/60 border border-[#00F2A6]/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F2A6]/10 rounded-full blur-2xl" />
            <p className="text-[#00F2A6] text-sm font-bold uppercase tracking-wider mb-3">💎 Ganas como Socio (85%)</p>
            <p className="text-4xl font-bold text-white mb-1">
              {Math.floor(socio).toLocaleString('es-ES')}
            </p>
            <p className="text-[#00F2A6] font-semibold">${Math.floor(socio).toLocaleString('es-ES')} USD</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 bg-black/60 border border-zinc-700/50">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-3">🔐 Fee PARTTH (15%)</p>
            <p className="text-4xl font-bold text-zinc-400 mb-1">
              {Math.floor(fee).toLocaleString('es-ES')}
            </p>
            <p className="text-zinc-500 font-semibold">${Math.floor(fee).toLocaleString('es-ES')} USD · Escrow hasta validación IA</p>
          </div>
        </div>

        {/* Visual bar */}
        <div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
            <motion.div
              className="bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] rounded-l-full"
              animate={{ width: '85%' }}
              transition={{ duration: 0.5 }}
              style={{ width: '85%' }}
            />
            <div className="bg-zinc-700 rounded-r-full" style={{ width: '15%' }} />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span className="text-[#00F2A6] font-bold">85% → Socio (tú)</span>
            <span>15% → PARTTH Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Trust Logos Grid ──────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { name: 'E-Commerce', icon: Globe, color: '#00F2A6' },
  { name: 'SaaS Brands', icon: Cpu, color: '#0EA5E9' },
  { name: 'Digital Closers', icon: TrendingUp, color: '#8B5CF6' },
  { name: 'Agencies', icon: Building2, color: '#F59E0B' },
  { name: 'Startups', icon: Zap, color: '#00F2A6' },
  { name: 'Creators', icon: Star, color: '#EC4899' },
];

export function Landing() {
  const [stats, setStats] = useState({ deals: 847, volume: 447320, users: 2087 });
  const dealsCounter = useCounter(stats.deals);
  const volumeCounter = useCounter(Math.floor(stats.volume / 1000));
  const usersCounter = useCounter(stats.users);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        deals: Math.floor(Math.random() * 100) + 850,
        volume: Math.floor(Math.random() * 50000) + 450000,
        users: Math.floor(Math.random() * 200) + 2100,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Live Ticker */}
      <TickerBar />

      {/* Navigation */}
      <nav className="fixed top-9 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30 group-hover:shadow-[#00F2A6]/60 transition-all duration-300">
              <Logo size={24} className="text-black" />
            </div>
            <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-white to-[#00F2A6] bg-clip-text text-transparent">PARTTH</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-zinc-400 hover:text-white transition-colors font-semibold hidden md:block text-sm tracking-wide">
              TARIFAS
            </Link>
            <Link to="/como-funciona" className="text-zinc-400 hover:text-white transition-colors font-semibold hidden md:block text-sm tracking-wide">
              CÓMO FUNCIONA
            </Link>
            <Link to="/login">
              <button className="px-5 py-2.5 rounded-xl border border-[#00F2A6]/40 text-[#00F2A6] hover:bg-[#00F2A6]/10 transition-all font-bold text-sm shadow-[0_0_20px_rgba(0,242,166,0.1)] hover:shadow-[0_0_30px_rgba(0,242,166,0.3)]">
                ENTRAR
              </button>
            </Link>
            <Link to="/role-selection">
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black text-sm hover:shadow-[0_0_30px_rgba(0,242,166,0.5)] transition-all">
                COMENZAR GRATIS
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="pt-52 pb-24 px-6 relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,242,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,166,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow blobs */}
        <motion.div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00F2A6]/8 rounded-full blur-[130px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-[#0EA5E9]/8 rounded-full blur-[120px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5 backdrop-blur-sm"
              >
                <Shield className="w-4 h-4 text-[#00F2A6]" />
                <span className="text-[#00F2A6] font-bold text-xs tracking-[0.2em] uppercase">Plataforma de Confianza Fintech</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-6xl lg:text-7xl font-black mb-6 text-white leading-[1.0] tracking-tight"
              >
                Trabaja con<br />
                Pruebas.
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #00F2A6 0%, #0EA5E9 50%, #00F2A6 100%)', backgroundSize: '200% auto', animation: 'gradientMove 4s ease infinite' }}
                >
                  Cobra con<br />Protección.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-lg"
              >
                La única plataforma donde{' '}
                <span className="text-white font-semibold">cada pago está bloqueado en escrow</span>,{' '}
                cada entrega requiere{' '}
                <span className="text-white font-semibold">evidencia verificada por IA</span> y{' '}
                cada disputa se resuelve en{' '}
                <span className="text-[#00F2A6] font-semibold">menos de 72 horas</span>.
              </motion.p>

              {/* Live stats mini-bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-6 mb-10"
              >
                {[
                  { ref: dealsCounter.ref, value: dealsCounter.value, suffix: '', label: 'Acuerdos activos', color: '#00F2A6' },
                  { ref: volumeCounter.ref, value: volumeCounter.value, suffix: 'K', label: 'En escrow (USD)', color: '#0EA5E9' },
                  { ref: usersCounter.ref, value: usersCounter.value, suffix: '+', label: 'Usuarios verificados', color: '#8B5CF6' },
                ].map((s, i) => (
                  <div key={i} ref={s.ref} className="text-center">
                    <p className="text-3xl font-black text-white" style={{ color: s.color }}>
                      {i === 1 ? '$' : ''}{s.value.toLocaleString('es-ES')}{s.suffix}
                    </p>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/role-selection">
                  <button className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black hover:shadow-[0_0_60px_rgba(0,242,166,0.5)] transition-all font-black text-base flex items-center gap-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10">Crear Cuenta Gratis</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  </button>
                </Link>
                <Link to="/pricing">
                  <button className="px-8 py-4 rounded-2xl border border-zinc-700 text-zinc-300 hover:border-[#00F2A6]/40 hover:text-white transition-all font-bold text-base flex items-center gap-2">
                    Ver Tarifas
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center gap-5 text-xs flex-wrap"
              >
                {[
                  { icon: Lock, text: 'Sin tarjeta de crédito' },
                  { icon: Zap, text: 'Setup en 2 minutos' },
                  { icon: DollarSign, text: 'Comisión solo al cobrar' },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-zinc-500">
                    <Icon className="w-3.5 h-3.5 text-[#00F2A6]" />
                    {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="hidden lg:block">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-zinc-600 text-xs font-bold uppercase tracking-[0.3em] mb-8">
            Sectores que confían en PARTTH
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {TRUST_ITEMS.map(({ name, icon: Icon, color }) => (
              <motion.div
                key={name}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110"
                  style={{ background: `${color}10`, borderColor: `${color}30` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <span className="text-zinc-500 text-xs font-semibold group-hover:text-zinc-300 transition-colors text-center">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 PILARES ─────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-gradient-to-b from-black via-zinc-950/30 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 mb-5 px-5 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5">
                <span className="text-[#00F2A6] font-bold text-xs tracking-[0.2em] uppercase">Sistema Único</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                3 Pilares de Confianza
              </h2>
              <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                El único marketplace donde el riesgo de impago es matemáticamente cero.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Lock,
                title: 'Fondos en Escrow',
                desc: 'Al crear un acuerdo, el capital se bloquea automáticamente. El socio nunca trabaja sin garantía. La marca nunca pierde sin evidencia.',
                accent: '#00F2A6',
                detail: 'Bloqueo instantáneo · Auditable · Sin intermediarios humanos',
              },
              {
                step: '02',
                icon: FileCheck,
                title: 'Evidencia Verificada',
                desc: 'Sin prueba, no hay pago. El motor de IA analiza la evidencia y solo autoriza el release si el score supera el 90% de confianza.',
                accent: '#0EA5E9',
                detail: 'Score IA ≥ 90% · Screenshots · Videos · Documentos · Links',
              },
              {
                step: '03',
                icon: Award,
                title: 'Reputación Inmutable',
                desc: 'Cada transacción construye tu perfil público verificado. Imposible de borrar o manipular. Tu historial es tu mayor activo.',
                accent: '#8B5CF6',
                detail: 'Reviews verificadas · Timeline inmutable · Rating on-chain',
              },
            ].map(({ step, icon: Icon, title, desc, accent, detail }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative group cursor-default"
              >
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${accent}20, transparent 70%)` }}
                />
                <div
                  className="relative bg-gradient-to-br from-zinc-900/60 to-black border rounded-3xl p-8 h-full flex flex-col transition-all group-hover:border-opacity-60"
                  style={{ borderColor: `${accent}25` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: accent }} />
                    </div>
                    <span className="text-6xl font-black opacity-[0.07] text-white leading-none">{step}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm flex-1">{desc}</p>
                  <div className="mt-6 pt-5 border-t" style={{ borderColor: `${accent}15` }}>
                    <p className="text-xs font-semibold" style={{ color: accent }}>{detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SALA DIGITAL VISUAL ───────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-black relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-[#00F2A6]/4 rounded-full blur-[160px]"
          animate={{ x: [-60, 60, -60], y: [-40, 40, -40] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 mb-5 px-5 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5">
              <span className="text-[#00F2A6] font-bold text-xs tracking-[0.2em] uppercase">Tecnología PARTTH</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Sala Digital
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Cada acuerdo vive en una <span className="text-white font-bold">Sala Digital blindada</span>.
              Fondos bloqueados · Evidencia timestamped · Timeline inmutable · Resolución con IA en &lt;72h.
            </p>
          </motion.div>

          {/* Sala Mockup Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/20 via-[#0EA5E9]/10 to-transparent rounded-3xl blur-[40px] group-hover:blur-[60px] transition-all" />
              <div className="relative bg-gradient-to-br from-zinc-900/80 to-black/90 border border-[#00F2A6]/30 rounded-3xl p-8 md:p-10 backdrop-blur-xl hover:border-[#00F2A6]/50 transition-all">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                      <Shield className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Sala #4471 · Campaña Premium</h3>
                      <p className="text-zinc-500 text-sm">Acuerdo activo · 3 días restantes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/30">
                    <div className="w-2 h-2 rounded-full bg-[#00F2A6] animate-pulse" />
                    <span className="text-[#00F2A6] font-black text-sm">ESCROW ACTIVO</span>
                  </div>
                </div>

                {/* Participantes + Fondos */}
                <div className="grid md:grid-cols-3 gap-5 mb-8">
                  <div className="bg-black/60 rounded-2xl p-5 border border-[#00F2A6]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-[#00F2A6]" />
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Marca</span>
                    </div>
                    <p className="text-white font-bold text-base">Empresa Verificada</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <p className="text-zinc-400 text-xs">4.9 · 142 deals</p>
                    </div>
                  </div>
                  <div className="bg-black/60 rounded-2xl p-5 border border-[#0EA5E9]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-[#0EA5E9]" />
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Socio</span>
                    </div>
                    <p className="text-white font-bold text-base">Socio Elite</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <p className="text-zinc-400 text-xs">5.0 · 89 deals</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-[#00F2A6]/10 via-[#0EA5E9]/10 to-[#00F2A6]/10 rounded-2xl p-5 border border-[#00F2A6]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Diamond className="w-4 h-4 text-[#00F2A6] fill-current" />
                      <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Bloqueados</span>
                    </div>
                    <p className="text-3xl font-black text-white">5,000 💎</p>
                    <p className="text-[#00F2A6] font-bold text-sm">$5,000 USD</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-8">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#00F2A6]" />
                    Timeline del Acuerdo
                  </h4>
                  <div className="space-y-3">
                    {[
                      { done: true, text: 'Fondos bloqueados en escrow', sub: 'Protección activada · $5,000 USD', color: 'green' },
                      { done: true, text: 'Trabajo en progreso', sub: 'Socio ejecutando la tarea', color: '#0EA5E9' },
                      { done: false, text: 'Evidencia pendiente', sub: 'Score IA mínimo: 90%', color: 'zinc' },
                      { done: false, text: 'Release automático', sub: 'Split 85% / 15%', color: 'zinc' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-4 ${!item.done ? 'opacity-40' : ''}`}>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${item.done && item.color === 'green' ? 'border-green-500 bg-green-500/10' : item.done ? 'border-[#0EA5E9] bg-[#0EA5E9]/10' : 'border-zinc-700 bg-zinc-800/20'}`}
                        >
                          {item.done ? (
                            item.color === 'green' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
                          ) : <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                        </div>
                        <div className="pt-1">
                          <p className="text-white font-bold text-sm">{item.text}</p>
                          <p className="text-zinc-500 text-xs">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link to="/role-selection" className="block">
                    <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black hover:shadow-[0_0_30px_rgba(0,242,166,0.5)] transition-all">
                      Crear mi Primera Sala
                    </button>
                  </Link>
                  <Link to="/como-funciona" className="block">
                    <button className="w-full px-6 py-4 rounded-xl border border-[#00F2A6]/30 text-[#00F2A6] font-bold hover:bg-[#00F2A6]/10 transition-all">
                      Ver Cómo Funciona
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── INCOME CALCULATOR ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-gradient-to-b from-black via-zinc-950/30 to-black">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-5 px-5 py-2 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/5">
              <span className="text-[#0EA5E9] font-bold text-xs tracking-[0.2em] uppercase">Motor de Ingresos</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Calcula tu Ganancia
            </h2>
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
              85% directo a ti. 15% a PARTTH, bloqueado hasta que la IA confirme el trabajo.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <IncomeCalculator />
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-36 px-6 bg-black relative overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#00F2A6]/4 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-[#00F2A6]/30 bg-[#00F2A6]/5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[#00F2A6] font-bold text-xs tracking-[0.2em] uppercase">Sistema Operativo</span>
          </div>

          <h2 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tight leading-[1.0]">
            Elimina el riesgo.<br />
            <span className="bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] bg-clip-text text-transparent">
              Trabaja con<br />confianza.
            </span>
          </h2>

          <p className="text-xl text-zinc-400 mb-12 leading-relaxed max-w-2xl mx-auto">
            Únete al marketplace donde{' '}
            <span className="text-white font-semibold">cada acuerdo está blindado</span> por
            escrow automático, evidencia verificable e IA de auditoría.
          </p>

          <Link to="/role-selection">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-14 py-6 rounded-2xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black text-xl shadow-[0_0_60px_rgba(0,242,166,0.4)] hover:shadow-[0_0_100px_rgba(0,242,166,0.6)] transition-all inline-flex items-center gap-3"
            >
              Crear Cuenta Gratis
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </Link>

          <p className="text-zinc-600 text-sm mt-6">
            Sin tarjeta de crédito · Setup en 2 minutos · Comisión solo al cobrar
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 py-16 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2" style={{ gridColumn: 'span 2' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                  <Logo size={24} className="text-black" />
                </div>
                <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-white to-[#00F2A6] bg-clip-text text-transparent">PARTTH</span>
              </div>
              <p className="text-zinc-600 text-sm max-w-md leading-relaxed">
                Ecosistema de confianza fintech. Conecta Marcas con Socios bajo escrow automático, evidencia verificada por IA y reputación inmutable.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-zinc-600 text-xs">Todos los sistemas operativos</span>
              </div>
            </div>
            <div>
              <h3 className="text-white font-black mb-4 text-sm tracking-wider uppercase">Producto</h3>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li><Link to="/pricing" className="hover:text-[#00F2A6] transition-colors">Tarifas</Link></li>
                <li><Link to="/como-funciona" className="hover:text-[#00F2A6] transition-colors">Cómo Funciona</Link></li>
                <li><Link to="/role-selection" className="hover:text-[#00F2A6] transition-colors">Comenzar</Link></li>
                <li><Link to="/login" className="hover:text-[#00F2A6] transition-colors">Iniciar Sesión</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-black mb-4 text-sm tracking-wider uppercase">Empresa</h3>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li><Link to="/about" className="hover:text-[#00F2A6] transition-colors">Quiénes Somos</Link></li>
                <li><Link to="/como-funciona" className="hover:text-[#00F2A6] transition-colors">Cómo Funciona</Link></li>
                <li><Link to="/terms" className="hover:text-[#00F2A6] transition-colors">Términos de Servicio</Link></li>
                <li><Link to="/privacy" className="hover:text-[#00F2A6] transition-colors">Política de Privacidad</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black mb-4 text-sm tracking-wider uppercase">Contacto</h3>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li>
                  <a href="mailto:support@partth.com" className="hover:text-[#00F2A6] transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F2A6] flex-shrink-0" />
                    support@partth.com
                  </a>
                </li>
                <li>
                  <a href="mailto:admin@partth.com" className="hover:text-[#00F2A6] transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] flex-shrink-0" />
                    admin@partth.com
                  </a>
                </li>
                <li>
                  <a href="mailto:legal@partth.com" className="hover:text-[#00F2A6] transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                    legal@partth.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-700 text-sm">
              © 2026 PARTTH Inc. Todos los derechos reservados. · <span className="text-zinc-600">partth.com</span>
            </p>
            <p className="text-zinc-700 text-xs">
              "No Evidence, No Payment" · Comisión: <span className="text-[#00F2A6] font-bold">15%</span> · Escrow IA ≥ 90%
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradientMove {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00F2A6, #0EA5E9);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(0, 242, 166, 0.5);
        }
        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00F2A6, #0EA5E9);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
