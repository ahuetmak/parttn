import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Zap, ChevronRight, Copy, Check, Diamond, Shield,
  FileText, Target, BarChart3, ArrowRight, Sparkles, Lock,
  CheckCircle, AlertTriangle, RefreshCw, Download, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { agenteAPI } from '../../lib/api';
import { toast } from 'sonner';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ScriptResult {
  hookPrincipal: string;
  hookAlternativo1: string;
  hookAlternativo2: string;
  problema: string;
  solucion: string;
  pruebaSocial: string;
  cta: string;
  objeciones: string;
  hashtags: string;
  guionCompleto: string;
  stats: { gananciaEjemplo: number; feePARTTH: number; precioProducto: number; comisionSocio: number };
}

interface ChecklistResult {
  checklist: any[];
  resumen: { totalItems: number; puntosMaximos: string; itemsCriticos: number; formatosNecesarios: string[] };
  notasMinimo: string;
  scoreEstimado: number;
}

// ── Componente de copia ───────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-zinc-400 hover:text-white"
      title="Copiar"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#00F2A6]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Sección de script ─────────────────────────────────────────────────────────
function ScriptSection({ label, content, color, icon: Icon }: {
  label: string; content: string; color: string; icon: any;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: `${color}20` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-all hover:bg-white/3"
        style={{ background: `${color}08` }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="font-black text-sm uppercase tracking-wider text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={content} />
          <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-black/60 border-t" style={{ borderColor: `${color}15` }}>
              <pre className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">{content}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Checklist Item ────────────────────────────────────────────────────────────
function ChecklistItem({ item, index }: { item: any; index: number }) {
  const colors: Record<string, string> = { CRÍTICO: '#EF4444', ALTO: '#F59E0B', MEDIO: '#0EA5E9' };
  const color = colors[item.prioridad] || '#8B5CF6';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 p-4 rounded-xl border border-white/5 bg-black/40 hover:border-white/10 transition-all"
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border"
          style={{ background: `${color}15`, borderColor: `${color}40`, color }}
        >
          {index + 1}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${color}15`, color }}
          >
            {item.prioridad}
          </span>
          <span className="text-zinc-600 text-xs">+{(item.puntos * 100).toFixed(0)}pts</span>
        </div>
        <p className="text-white text-sm font-semibold mb-1">{item.descripcion}</p>
        <div className="flex items-center gap-2">
          <code className="text-xs text-[#00F2A6] bg-[#00F2A6]/10 px-2 py-0.5 rounded font-mono">
            {item.nombre_archivo_sugerido}
          </code>
        </div>
        <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">💡 {item.tip}</p>
      </div>
    </motion.div>
  );
}

// ── Categorías ─────────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: 'ecommerce', label: 'E-Commerce', emoji: '🛒' },
  { id: 'saas', label: 'SaaS / Software', emoji: '⚡' },
  { id: 'servicio', label: 'Servicio', emoji: '🎯' },
  { id: 'digital', label: 'Producto Digital', emoji: '📱' },
  { id: 'default', label: 'Otro', emoji: '💼' },
];

// ── Misiones de ejemplo para "activar rápido" ─────────────────────────────────
const MISIONES_RAPIDAS = [
  {
    nombre: 'Estrategia de Lanzamiento Viral',
    descripcion: 'Plan completo de lanzamiento en redes sociales con 5 videos IA y estrategia de contenido viral',
    precio: 2500, comision: 30, categoria: 'saas', audiencia: 'emprendedores digitales',
    usps: ['Plan en 7 días', '5 videos IA incluidos', 'Templates virales']
  },
  {
    nombre: 'Automatización de Ventas con Abacus',
    descripcion: 'Configuración completa de bots de ventas, 50 leads validados y pipeline automatizado',
    precio: 5000, comision: 25, categoria: 'saas', audiencia: 'equipos de ventas B2B',
    usps: ['Bots configurados', '50 leads garantizados', 'Pipeline automático']
  },
  {
    nombre: 'Campaña de Afiliación High-Ticket',
    descripcion: 'Embudo de ventas completo con 10 cierres confirmados de alto valor verificados por IA',
    precio: 10000, comision: 20, categoria: 'servicio', audiencia: 'closers de alto ticket',
    usps: ['Embudo probado', '10 cierres verificados', 'Script de cierre IA']
  },
];

// ── Componente principal ──────────────────────────────────────────────────────
export function AgenteIA() {
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();

  // Form state
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ script: ScriptResult; checklist: ChecklistResult } | null>(null);

  const [form, setForm] = useState({
    productoNombre: '',
    productoDescripcion: '',
    precioProducto: '',
    audienciaObjetivo: '',
    categoriaProducto: 'default',
    marcaNombre: userProfile?.name || 'Mi Marca',
    comisionSocio: '30',
    usp1: '', usp2: '', usp3: '',
  });

  const [activeScript, setActiveScript] = useState<'completo' | 'secciones'>('secciones');
  const [copiedFull, setCopiedFull] = useState(false);

  // Pre-llenar desde URL params (cuando viene del Marketplace)
  useEffect(() => {
    const mision = searchParams.get('mision');
    const precio = searchParams.get('precio');
    const comision = searchParams.get('comision');
    if (mision || precio) {
      setForm(f => ({
        ...f,
        ...(mision ? { productoNombre: mision } : {}),
        ...(precio ? { precioProducto: precio } : {}),
        ...(comision ? { comisionSocio: comision } : {}),
      }));
      if (mision) toast.info(`Misión cargada: "${mision}"`);
    }
  }, [searchParams]);

  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cargarMisionRapida = (m: typeof MISIONES_RAPIDAS[0]) => {
    setForm(f => ({
      ...f,
      productoNombre: m.nombre,
      productoDescripcion: m.descripcion,
      precioProducto: String(m.precio),
      audienciaObjetivo: m.audiencia,
      categoriaProducto: m.categoria,
      comisionSocio: String(m.comision),
      usp1: m.usps[0] || '',
      usp2: m.usps[1] || '',
      usp3: m.usps[2] || '',
    }));
    toast.success(`Misión "${m.nombre}" cargada ✓`);
  };

  const generar = async () => {
    if (!form.productoNombre || !form.precioProducto) {
      toast.error('Nombre del producto y precio son requeridos');
      return;
    }
    setLoading(true);
    try {
      const res = await agenteAPI.generarScript({
        marcaId: user?.id,
        productoNombre: form.productoNombre,
        productoDescripcion: form.productoDescripcion,
        precioProducto: Number(form.precioProducto),
        audienciaObjetivo: form.audienciaObjetivo || 'emprendedores',
        categoriaProducto: form.categoriaProducto,
        uspList: [form.usp1, form.usp2, form.usp3].filter(Boolean),
        comisionSocio: Number(form.comisionSocio),
        marcaNombre: form.marcaNombre || 'Mi Marca',
      });
      setResultado(res);
      setPaso(2);
      toast.success('¡Script viral generado por Abacus Core! 🚀');
    } catch {
      toast.error('Error generando script. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const copyFull = () => {
    if (!resultado) return;
    navigator.clipboard.writeText(resultado.script.guionCompleto);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
    toast.success('Script copiado al portapapeles');
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                <Cpu className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Agente IA</h1>
                <p className="text-zinc-500 text-sm">Abacus Core v1 · Cápsula de Misión</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              Genera un <span className="text-white font-bold">Script de Venta Viral</span> personalizado
              y el <span className="text-[#00F2A6] font-bold">Checklist de Evidencia</span> optimizado
              para score IA ≥ 90% — automáticamente.
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30">
            <div className="w-2 h-2 rounded-full bg-[#00F2A6] animate-pulse" />
            <span className="text-[#00F2A6] text-xs font-black uppercase tracking-widest">Motor Activo</span>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mt-6">
          {[
            { n: 1, label: 'Producto' },
            { n: 2, label: 'Script Viral' },
            { n: 3, label: 'Evidencia' },
          ].map(({ n, label }) => (
            <React.Fragment key={n}>
              <button
                onClick={() => resultado && setPaso(n as any)}
                className="flex items-center gap-2"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${paso === n ? 'border-[#00F2A6] bg-[#00F2A6] text-black' :
                      paso > n ? 'border-[#00F2A6] bg-[#00F2A6]/20 text-[#00F2A6]' :
                        'border-zinc-700 bg-zinc-800 text-zinc-500'
                    }`}
                >
                  {paso > n ? <Check className="w-3.5 h-3.5" /> : n}
                </div>
                <span className={`text-xs font-bold hidden sm:block ${paso >= n ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
              </button>
              {n < 3 && <div className={`flex-1 h-px max-w-16 ${paso > n ? 'bg-[#00F2A6]' : 'bg-zinc-800'}`} />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* ── PASO 1: Formulario ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {paso === 1 && (
          <motion.div
            key="paso1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Misiones rápidas */}
            <div className="relative overflow-hidden rounded-2xl border border-[#00F2A6]/20 bg-black/60 backdrop-blur-xl p-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00F2A6]/5 rounded-full blur-3xl" />
              <h2 className="text-white font-black mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00F2A6]" />
                Carga Rápida — Misiones PARTTH
              </h2>
              <p className="text-zinc-500 text-xs mb-4">Misiones de alto valor preconfiguradas. Clic para cargar.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {MISIONES_RAPIDAS.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => cargarMisionRapida(m)}
                    className="text-left p-4 rounded-xl border border-zinc-800 hover:border-[#00F2A6]/40 bg-black/40 hover:bg-[#00F2A6]/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Diamond className="w-4 h-4 text-[#00F2A6]" />
                      <span className="text-[#00F2A6] font-black text-sm">${m.precio.toLocaleString()}</span>
                    </div>
                    <p className="text-white text-xs font-bold leading-snug group-hover:text-[#00F2A6] transition-colors">{m.nombre}</p>
                    <p className="text-zinc-600 text-xs mt-1">Comisión: {m.comision}%</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario de producto */}
            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/40 backdrop-blur-xl p-6">
              <div className="absolute top-0 left-0 w-48 h-48 bg-[#0EA5E9]/5 rounded-full blur-3xl" />
              <h2 className="text-white font-black mb-5 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0EA5E9]" />
                Datos del Producto / Misión
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">Nombre del Producto *</label>
                  <input
                    value={form.productoNombre}
                    onChange={e => handleChange('productoNombre', e.target.value)}
                    placeholder="ej: Estrategia de Lanzamiento Viral"
                    className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-600 focus:border-[#00F2A6] rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm outline-none transition-all"
                  />
                </div>
                {/* Marca */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">Nombre de la Marca</label>
                  <input
                    value={form.marcaNombre}
                    onChange={e => handleChange('marcaNombre', e.target.value)}
                    placeholder="ej: PARTTH"
                    className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-600 focus:border-[#00F2A6] rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm outline-none transition-all"
                  />
                </div>
                {/* Precio */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">Precio (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                    <input
                      type="number"
                      value={form.precioProducto}
                      onChange={e => handleChange('precioProducto', e.target.value)}
                      placeholder="2500"
                      className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-600 focus:border-[#00F2A6] rounded-xl pl-8 pr-4 py-3 text-white placeholder-zinc-600 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
                {/* Comisión */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                    Comisión Socio: <span className="text-[#00F2A6]">{form.comisionSocio}%</span>
                    {form.precioProducto && (
                      <span className="text-zinc-500 normal-case ml-1">
                        (= ${Math.floor(Number(form.precioProducto) * Number(form.comisionSocio) / 100).toLocaleString()})
                      </span>
                    )}
                  </label>
                  <input
                    type="range" min={10} max={50} step={5}
                    value={form.comisionSocio}
                    onChange={e => handleChange('comisionSocio', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #00F2A6 ${(Number(form.comisionSocio) - 10) / 40 * 100}%, #27272a ${(Number(form.comisionSocio) - 10) / 40 * 100}%)` }}
                  />
                  <div className="flex justify-between text-xs text-zinc-700 mt-1">
                    <span>10%</span><span>50%</span>
                  </div>
                </div>
                {/* Audiencia */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">Audiencia Objetivo</label>
                  <input
                    value={form.audienciaObjetivo}
                    onChange={e => handleChange('audienciaObjetivo', e.target.value)}
                    placeholder="ej: emprendedores digitales"
                    className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-600 focus:border-[#00F2A6] rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm outline-none transition-all"
                  />
                </div>
                {/* Categoría */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">Categoría</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleChange('categoriaProducto', cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${form.categoriaProducto === cat.id
                            ? 'border-[#00F2A6] bg-[#00F2A6]/15 text-[#00F2A6]'
                            : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                          }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-4">
                <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">Descripción del Producto</label>
                <textarea
                  value={form.productoDescripcion}
                  onChange={e => handleChange('productoDescripcion', e.target.value)}
                  rows={3}
                  placeholder="Describe qué hace tu producto, qué problema resuelve y para quién es ideal..."
                  className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-600 focus:border-[#00F2A6] rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm outline-none transition-all resize-none"
                />
              </div>

              {/* USPs */}
              <div className="mt-4">
                <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Ventajas Únicas (USP) — para el gancho del script
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map(n => (
                    <input
                      key={n}
                      value={form[`usp${n}` as keyof typeof form]}
                      onChange={e => handleChange(`usp${n}`, e.target.value)}
                      placeholder={`USP ${n} — ej: Sin contrato`}
                      className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-600 focus:border-[#00F2A6] rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Fee preview */}
              {form.precioProducto && Number(form.precioProducto) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 rounded-xl bg-black/60 border border-zinc-800 flex items-center justify-between flex-wrap gap-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#00F2A6]" />
                    <span className="text-zinc-400">Split automático PARTTH:</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#00F2A6] font-black">
                      {form.comisionSocio}% Socio = ${Math.floor(Number(form.precioProducto) * Number(form.comisionSocio) / 100).toLocaleString()}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400 font-bold">
                      15% PARTTH = ${Math.floor(Number(form.precioProducto) * 0.15).toLocaleString()}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-600 text-xs">2% Reserva</span>
                  </div>
                </motion.div>
              )}

              {/* ── BOTÓN IA POWER ─────────────────────────────────────── */}
              <div className="mt-6 relative">
                {/* Glow halo externo */}
                {!loading && form.productoNombre && form.precioProducto && (
                  <div className="absolute inset-0 rounded-2xl blur-2xl opacity-60 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #00F2A6 0%, #0EA5E9 100%)' }} />
                )}
                <button
                  onClick={generar}
                  disabled={loading || !form.productoNombre || !form.precioProducto}
                  className="relative w-full py-5 rounded-2xl font-black text-lg tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group"
                  style={{
                    background: loading || !form.productoNombre || !form.precioProducto
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #00F2A6 0%, #0EA5E9 50%, #00F2A6 100%)',
                    backgroundSize: '200% auto',
                    boxShadow: !loading && form.productoNombre && form.precioProducto
                      ? '0 0 40px rgba(0,242,166,0.5), 0 0 80px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : 'none',
                  }}
                >
                  {/* Scanline effect */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />

                  {loading ? (
                    <span className="relative z-10 flex items-center justify-center gap-3 text-black">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Abacus Core procesando<span className="animate-pulse">...</span></span>
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-3 text-black">
                      <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-black" />
                      </div>
                      <span className="text-xl">⚡ IA POWER — Generar Script Viral</span>
                      <ArrowRight className="w-6 h-6" />
                    </span>
                  )}
                </button>
                <p className="text-center text-zinc-600 text-xs mt-2">
                  Powered by Abacus Core · Score IA ≥ 90% · Script optimizado para cierre
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PASO 2: Script Viral ──────────────────────────────────────── */}
        {paso === 2 && resultado && (
          <motion.div
            key="paso2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Header del script */}
            <div className="relative overflow-hidden rounded-2xl border border-[#00F2A6]/30 bg-gradient-to-br from-zinc-900/80 to-black/90 backdrop-blur-xl p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F2A6]/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="w-4 h-4 text-[#00F2A6]" />
                      <span className="text-[#00F2A6] text-xs font-black uppercase tracking-widest">Script Viral Generado</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">{form.productoNombre}</h2>
                    <p className="text-zinc-500 text-sm mt-1">Abacus Core v1 · Categoría: {form.categoriaProducto}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyFull}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#00F2A6]/40 transition-all text-sm font-bold"
                    >
                      {copiedFull ? <Check className="w-4 h-4 text-[#00F2A6]" /> : <Copy className="w-4 h-4" />}
                      {copiedFull ? 'Copiado' : 'Copiar Todo'}
                    </button>
                    <button
                      onClick={() => setPaso(3)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F2A6] text-black font-black text-sm hover:shadow-[0_0_20px_rgba(0,242,166,0.4)] transition-all"
                    >
                      Ver Checklist <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats chips */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Precio', value: `$${resultado.script.stats.precioProducto.toLocaleString()}`, color: '#00F2A6' },
                    { label: 'Tu comisión', value: `$${resultado.script.stats.gananciaEjemplo.toLocaleString()}`, color: '#0EA5E9' },
                    { label: 'Fee PARTTH', value: `$${resultado.script.stats.feePARTTH.toLocaleString()}`, color: '#8B5CF6' },
                    { label: 'Reserva 2%', value: `$${Math.floor(resultado.script.stats.feePARTTH * 0.02).toLocaleString()}`, color: '#F59E0B' },
                  ].map(s => (
                    <div key={s.label} className="px-3 py-1.5 rounded-xl border text-xs font-bold" style={{ borderColor: `${s.color}25`, background: `${s.color}10`, color: s.color }}>
                      {s.label}: {s.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* View toggle */}
            <div className="flex gap-2">
              {(['secciones', 'completo'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setActiveScript(v)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${activeScript === v
                      ? 'border-[#00F2A6] bg-[#00F2A6]/15 text-[#00F2A6]'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                >
                  {v === 'secciones' ? '📋 Por Secciones' : '📜 Guión Completo'}
                </button>
              ))}
            </div>

            {activeScript === 'secciones' ? (
              <div className="space-y-3">
                <ScriptSection label="🎣 Hooks Virales" color="#00F2A6" icon={Zap}
                  content={`HOOK 1 (Principal):\n"${resultado.script.hookPrincipal}"\n\nHOOK 2:\n"${resultado.script.hookAlternativo1}"\n\nHOOK 3:\n"${resultado.script.hookAlternativo2}"`}
                />
                <ScriptSection label="🔥 Problema" color="#EF4444" icon={AlertTriangle}
                  content={resultado.script.problema}
                />
                <ScriptSection label="💡 Solución" color="#0EA5E9" icon={CheckCircle}
                  content={resultado.script.solucion}
                />
                <ScriptSection label="📊 Prueba Social" color="#8B5CF6" icon={BarChart3}
                  content={resultado.script.pruebaSocial}
                />
                <ScriptSection label="📣 Llamada a la Acción" color="#00F2A6" icon={Target}
                  content={resultado.script.cta}
                />
                <ScriptSection label="🛡️ Manejo de Objeciones" color="#F59E0B" icon={Shield}
                  content={resultado.script.objeciones}
                />
                <ScriptSection label="#️⃣ Hashtags Sugeridos" color="#EC4899" icon={FileText}
                  content={resultado.script.hashtags}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl border border-zinc-800 bg-black/60 backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Guión Completo — Listo para Copiar</span>
                  <CopyButton text={resultado.script.guionCompleto} />
                </div>
                <pre className="p-6 text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-mono max-h-[60vh] overflow-y-auto">
                  {resultado.script.guionCompleto}
                </pre>
              </div>
            )}

            {/* Navegación */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPaso(1)}
                className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 font-bold text-sm hover:border-zinc-600 hover:text-white transition-all"
              >
                ← Editar Producto
              </button>
              <button
                onClick={() => setPaso(3)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black text-sm hover:shadow-[0_0_30px_rgba(0,242,166,0.4)] transition-all flex items-center gap-2"
              >
                Ver Checklist de Evidencia <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PASO 3: Checklist de Evidencia ───────────────────────────── */}
        {paso === 3 && resultado && (
          <motion.div
            key="paso3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Score estimado */}
            <div className="relative overflow-hidden rounded-2xl border border-[#00F2A6]/30 bg-gradient-to-br from-zinc-900/80 to-black/90 backdrop-blur-xl p-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00F2A6]/5 rounded-full blur-3xl" />
              <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-[#00F2A6]" />
                    <span className="text-[#00F2A6] text-xs font-black uppercase tracking-widest">Auditor IA — Protocolo de Evidencia</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Checklist para Score ≥ 90%</h2>
                  <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                    {resultado.checklist.resumen.totalItems} ítems · {resultado.checklist.resumen.itemsCriticos} críticos ·
                    Formatos: {resultado.checklist.resumen.formatosNecesarios.join(', ')}
                  </p>
                </div>
                <div className="text-center px-6 py-4 rounded-2xl border border-[#00F2A6]/30 bg-[#00F2A6]/5">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Score Estimado</p>
                  <p className="text-5xl font-black text-[#00F2A6]">
                    {(resultado.checklist.scoreEstimado * 100).toFixed(0)}%
                  </p>
                  <p className="text-[#00F2A6] text-xs font-bold mt-1">✅ APROBADO automático</p>
                </div>
              </div>
            </div>

            {/* Notas mínimas */}
            <div className="rounded-2xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 backdrop-blur-xl p-5">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#0EA5E9] font-black text-sm mb-2">Requisitos mínimos para las Notas del Socio</p>
                  <pre className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                    {resultado.checklist.notasMinimo}
                  </pre>
                </div>
              </div>
            </div>

            {/* Items del checklist */}
            <div className="space-y-2">
              <h3 className="text-white font-black text-sm uppercase tracking-wider px-1">Archivos de Evidencia Requeridos</h3>
              {resultado.checklist.checklist.map((item, i) => (
                <ChecklistItem key={i} item={item} index={i} />
              ))}
            </div>

            {/* Score breakdown */}
            <div className="rounded-2xl border border-zinc-800 bg-black/60 backdrop-blur-xl p-6">
              <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00F2A6]" />
                Cómo el Auditor IA calcula el score
              </h3>
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  { label: 'Cantidad de archivos', max: '30%', color: '#00F2A6', tip: 'Min. 5 archivos = 30%' },
                  { label: 'Diversidad de tipos', max: '25%', color: '#0EA5E9', tip: 'Imagen + Video + Doc = 25%' },
                  { label: 'Calidad de notas', max: '25%', color: '#8B5CF6', tip: '80+ palabras + links + datos' },
                  { label: 'Screenshots marcados', max: '20%', color: '#F59E0B', tip: 'Nombre incluye "screenshot"' },
                ].map(c => (
                  <div key={c.label} className="text-center p-4 rounded-xl border border-zinc-800 bg-black/40">
                    <p className="text-2xl font-black mb-1" style={{ color: c.color }}>{c.max}</p>
                    <p className="text-white text-xs font-bold mb-2">{c.label}</p>
                    <p className="text-zinc-500 text-xs">{c.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones finales */}
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaso(2)}
                className="px-6 py-4 rounded-xl border border-zinc-800 text-zinc-400 font-bold text-sm hover:border-[#00F2A6]/30 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                ← Volver al Script
              </button>
              <button
                onClick={() => {
                  const data = {
                    script: resultado.script.guionCompleto,
                    checklist: resultado.checklist.checklist,
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `script-${form.productoNombre.replace(/\s+/g, '-').toLowerCase()}.json`;
                  a.click();
                  toast.success('Script y checklist descargados');
                }}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-black text-sm hover:shadow-[0_0_30px_rgba(0,242,166,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Descargar Script + Checklist
              </button>
            </div>

            {/* Reset */}
            <div className="text-center pt-2">
              <button
                onClick={() => { setPaso(1); setResultado(null); setForm(f => ({ ...f, productoNombre: '', productoDescripcion: '', precioProducto: '', usp1: '', usp2: '', usp3: '' })); }}
                className="text-zinc-600 hover:text-zinc-400 text-xs font-bold transition-all"
              >
                ↺ Generar script para otro producto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: linear-gradient(135deg, #00F2A6, #0EA5E9); cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 242, 166, 0.4);
        }
        input[type='range']::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: linear-gradient(135deg, #00F2A6, #0EA5E9); cursor: pointer; border: none;
        }
      `}</style>
    </div>
  );
}
