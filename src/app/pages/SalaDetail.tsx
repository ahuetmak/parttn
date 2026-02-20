import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router';
import {
  Shield, Diamond, CheckCircle, Clock, Building2, Users, FileText,
  Upload, MessageSquare, AlertTriangle, ExternalLink, FileSignature,
  Brain, Lock, Zap, X, ChevronRight, RefreshCw, Eye, TrendingUp,
  Image, Video, File as FileIcon, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { salasAPI } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { AcuerdoOperativo } from '../components/AcuerdoOperativo';
import { toast } from 'sonner';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface IABreakdown {
  archivos: number;
  diversidad: number;
  notas: number;
  capturas: number;
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function ScoreGauge({ score, animating }: { score: number; animating: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const pct = score * 100;
  const isApproved = pct >= 90;
  const isWarning = pct >= 70 && pct < 90;
  const color = isApproved ? '#00F2A6' : isWarning ? '#F59E0B' : '#EF4444';
  const glowColor = isApproved ? 'rgba(0,242,166,0.4)' : isWarning ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';

  useEffect(() => {
    if (!animating) { setDisplayed(pct); return; }
    setDisplayed(0);
    let start = 0;
    const step = pct / 60;
    const interval = setInterval(() => {
      start += step;
      if (start >= pct) { setDisplayed(pct); clearInterval(interval); }
      else setDisplayed(start);
    }, 16);
    return () => clearInterval(interval);
  }, [pct, animating]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (displayed / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {displayed.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Score</span>
        </div>
      </div>
      <div
        className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}40`,
          color,
          boxShadow: `0 0 12px ${glowColor}`,
        }}
      >
        {isApproved ? '✓ APROBADO' : isWarning ? '⚠ REVISIÓN MANUAL' : '✕ RECHAZADO'}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-zinc-400 text-xs">{label}</span>
        <span className="text-white text-xs font-bold">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function EscrowBadge({ label, amount, color, note }: {
  label: string; amount: number; color: string; note?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl border"
      style={{ backgroundColor: `${color}08`, borderColor: `${color}25` }}
    >
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4" style={{ color }} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
          {note && <p className="text-zinc-600 text-xs">{note}</p>}
        </div>
      </div>
      <p className="font-bold text-white">{amount.toLocaleString('es-ES')} 💎</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SalaDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sala, setSala] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidencia' | 'escrow' | 'chat'>('timeline');
  const [showAcuerdo, setShowAcuerdo] = useState(false);

  // Evidencia
  const [notas, setNotas] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // IA
  const [validandoIA, setValidandoIA] = useState(false);
  const [iaAnimating, setIaAnimating] = useState(false);
  const [showIAPanel, setShowIAPanel] = useState(false);

  // Acciones
  const [aprobando, setAprobando] = useState(false);

  useEffect(() => { if (id) loadSala(); }, [id]);

  const loadSala = async () => {
    try {
      setLoading(true);
      const data = await salasAPI.getSala(id!);
      setSala(data);
      if (data.iaScore !== undefined) setShowIAPanel(true);
    } catch { toast.error('Error cargando sala'); }
    finally { setLoading(false); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setArchivos(prev => [...prev, ...files]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setArchivos(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setArchivos(prev => prev.filter((_, i) => i !== idx));

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['jpg','jpeg','png','gif','webp','heic'].includes(ext)) return <Image className="w-4 h-4 text-[#0EA5E9]" />;
    if (['mp4','mov','avi','webm'].includes(ext)) return <Video className="w-4 h-4 text-[#8B5CF6]" />;
    return <FileIcon className="w-4 h-4 text-zinc-400" />;
  };

  const handleUploadEvidencia = async () => {
    if (!sala || !user) return;
    if (sala.socioId !== user.id) { toast.error('Solo el socio puede subir evidencia'); return; }
    if (archivos.length === 0) { toast.error('Selecciona al menos un archivo'); return; }

    try {
      setUploading(true);
      toast.info('Subiendo archivos...');

      const uploadedFiles: any[] = [];
      for (const archivo of archivos) {
        const fileName = `${sala.id}/${Date.now()}_${archivo.name}`;
        const { error } = await supabase.storage
          .from('make-1c8a6aaa-evidencias')
          .upload(fileName, archivo);
        if (error) throw error;
        const { data: signedData } = await supabase.storage
          .from('make-1c8a6aaa-evidencias')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365);
        if (signedData) uploadedFiles.push({ name: archivo.name, url: signedData.signedUrl, path: fileName });
      }

      toast.info('Enviando al Auditor IA...');
      setIaAnimating(true);
      setShowIAPanel(true);

      const result = await salasAPI.entregarEvidencia(sala.id, user.id, notas, uploadedFiles);
      setSala(result.sala || result);
      setNotas('');
      setArchivos([]);

      if (result.autoAprobado) {
        toast.success(`¡Auditor IA aprobó automáticamente! Score: ${((result.iaResult?.score || 0) * 100).toFixed(1)}%`);
      } else {
        toast.warning(`Score IA: ${((result.iaResult?.score || 0) * 100).toFixed(1)}% — Requiere revisión`);
      }

      setTimeout(() => setIaAnimating(false), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Error subiendo evidencia');
      setIaAnimating(false);
    } finally { setUploading(false); }
  };

  const handleValidarIA = async () => {
    if (!sala || !user) return;
    try {
      setValidandoIA(true);
      setIaAnimating(true);
      toast.info('Auditor IA analizando evidencia...');
      const result = await salasAPI.validarEvidenciaIA(sala.id, user.id);
      setSala(result.sala || result);
      if (result.autoAprobado) {
        toast.success(`¡Fondos liberados! Score IA: ${((result.iaResult?.score || 0) * 100).toFixed(1)}%`);
      } else {
        toast.warning(`Score IA: ${((result.iaResult?.score || 0) * 100).toFixed(1)}% — Fondos bloqueados`);
      }
      setTimeout(() => setIaAnimating(false), 1500);
    } catch { toast.error('Error en validación IA'); setIaAnimating(false); }
    finally { setValidandoIA(false); }
  };

  const handleAprobarEvidencia = async () => {
    if (!sala || !user) return;
    if (sala.marcaId !== user.id) { toast.error('Solo la marca puede aprobar'); return; }
    if (!sala.evidenciaEntregada) { toast.error('No hay evidencia para aprobar'); return; }
    try {
      setAprobando(true);
      await salasAPI.aprobarEvidencia(sala.id, user.id);
      toast.success('Evidencia aprobada — Fondos liberándose');
      loadSala();
    } catch { toast.error('Error aprobando evidencia'); }
    finally { setAprobando(false); }
  };

  const handleAbrirDisputa = async () => {
    if (!sala || !user) return;
    const razon = window.prompt('¿Motivo de la disputa?');
    if (!razon) return;
    const descripcion = window.prompt('Describe la situación:');
    if (!descripcion) return;
    try {
      await salasAPI.abrirDisputa(sala.id, user.id, razon, descripcion);
      toast.success('Disputa abierta — Concierge IA notificado');
      loadSala();
    } catch { toast.error('Error abriendo disputa'); }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-16 h-16 border-4 border-[#00F2A6]/20 border-t-[#00F2A6] rounded-full animate-spin" />
        <p className="text-zinc-400">Cargando War Room...</p>
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-white text-xl">Sala no encontrada</p>
        <Link to="/app/salas">
          <button className="px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold">
            Volver a Salas
          </button>
        </Link>
      </div>
    );
  }

  const isMarca = user?.id === sala.marcaId;
  const isSocio = user?.id === sala.socioId;
  const iaScore = sala.iaScore ?? null;
  const iaVeredicto = sala.iaVeredicto ?? null;
  const iaBreakdown: IABreakdown | null = sala.iaBreakdown ?? null;

  const estadoConfig: any = {
    activa:      { color: '#0EA5E9', label: 'ESCROW ACTIVO', icon: Lock },
    en_revision: { color: '#F59E0B', label: 'EN REVISIÓN IA', icon: Brain },
    completada:  { color: '#00F2A6', label: 'COMPLETADA', icon: CheckCircle },
    en_disputa:  { color: '#EF4444', label: 'EN DISPUTA', icon: AlertTriangle },
  };
  const currentEstado = estadoConfig[sala.estado] || estadoConfig.activa;

  const TABS = [
    { id: 'timeline',  label: 'Timeline' },
    { id: 'evidencia', label: 'Evidencia' },
    { id: 'escrow',    label: 'Escrow' },
    { id: 'chat',      label: 'Chat' },
  ] as const;

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link to="/app/salas" className="hover:text-white transition-colors">Salas Digitales</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white font-semibold">War Room #{sala.id.slice(0, 8)}</span>
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="relative overflow-hidden rounded-3xl border border-[#00F2A6]/20 bg-gradient-to-br from-zinc-900/80 to-black p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 via-transparent to-[#0EA5E9]/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F2A6]/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#00F2A6]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{sala.titulo}</h1>
                <p className="text-zinc-400 text-sm">{sala.descripcion}</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Creada {new Date(sala.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Estado badge */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold"
                style={{
                  backgroundColor: `${currentEstado.color}15`,
                  borderColor: `${currentEstado.color}40`,
                  color: currentEstado.color,
                }}
              >
                <span className="relative flex h-2 w-2">
                  {sala.estado !== 'completada' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: currentEstado.color }} />
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: currentEstado.color }} />
                </span>
                {currentEstado.label}
              </div>

              <button onClick={loadSala}
                className="p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Participantes + Diamantes */}
          <div className="relative grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-black/40 rounded-2xl p-5 border border-[#00F2A6]/10">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#00F2A6]" />
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Marca</span>
                {isMarca && <span className="text-[#00F2A6] text-xs font-bold">(Tú)</span>}
              </div>
              <p className="text-white font-mono text-sm">{sala.marcaId.slice(0, 16)}…</p>
            </div>

            <div className="bg-gradient-to-br from-[#00F2A6]/10 to-[#0EA5E9]/10 rounded-2xl p-5 border border-[#00F2A6]/30 text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Diamond className="w-6 h-6 text-[#00F2A6] fill-current" />
                <p className="text-4xl font-bold text-white">{sala.totalProducto.toLocaleString('es-ES')}</p>
              </div>
              <p className="text-[#00F2A6] text-sm font-bold">💎 en Escrow</p>
              <p className="text-zinc-500 text-xs mt-1">${sala.totalProducto.toLocaleString('es-ES')} USD</p>
            </div>

            <div className="bg-black/40 rounded-2xl p-5 border border-[#0EA5E9]/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#0EA5E9]" />
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Socio</span>
                {isSocio && <span className="text-[#0EA5E9] text-xs font-bold">(Tú)</span>}
              </div>
              <p className="text-white font-mono text-sm">{sala.socioId.slice(0, 16)}…</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── IA Score Banner (aparece cuando hay validación) ───────────── */}
      <AnimatePresence>
        {showIAPanel && iaScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border"
            style={{
              borderColor: iaScore >= 0.90 ? 'rgba(0,242,166,0.3)' : iaScore >= 0.70 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
              background: `linear-gradient(135deg, ${iaScore >= 0.90 ? 'rgba(0,242,166,0.08)' : iaScore >= 0.70 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'}, rgba(0,0,0,0.8))`,
            }}
          >
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black/40 border border-zinc-700 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Auditor de Verdad IA</p>
                  <p className="text-white font-bold">Validación completada</p>
                  <p className="text-zinc-500 text-xs">
                    {sala.iaValidadoEn && new Date(sala.iaValidadoEn).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex justify-center">
                <ScoreGauge score={iaScore} animating={iaAnimating} />
              </div>

              {iaBreakdown && (
                <div className="flex-1 space-y-2 min-w-[180px]">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Desglose del Score</p>
                  <ScoreBar label="Cantidad de archivos" value={iaBreakdown.archivos / 0.30} color="#00F2A6" />
                  <ScoreBar label="Diversidad de tipos" value={iaBreakdown.diversidad / 0.25} color="#0EA5E9" />
                  <ScoreBar label="Calidad de notas" value={iaBreakdown.notas / 0.25} color="#8B5CF6" />
                  <ScoreBar label="Capturas/Pantallazos" value={iaBreakdown.capturas / 0.20} color="#F59E0B" />
                </div>
              )}
            </div>

            {/* Tip para mejorar el score si no pasó */}
            {iaVeredicto !== 'APROBADO' && (
              <div className="border-t border-zinc-800/60 px-6 py-3 bg-black/40">
                <p className="text-zinc-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  Para alcanzar 90%: agrega más archivos variados (imágenes + PDF), capturas de pantalla con nombres descriptivos y notas detalladas con links y números.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-zinc-800/60 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-[#00F2A6] text-[#00F2A6]'
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.id === 'evidencia' && sala.evidenciaEntregada && (
              <span className="ml-2 w-2 h-2 rounded-full bg-[#00F2A6] inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Main ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* TIMELINE */}
          {activeTab === 'timeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#00F2A6]" />
                  Timeline del Acuerdo
                </h3>
                <div className="space-y-1">
                  {(sala.timeline || []).map((event: any, index: number) => {
                    const MAP: any = {
                      creacion:           { color: '#0EA5E9', Icon: Shield },
                      evidencia_entregada:{ color: '#F59E0B', Icon: Upload },
                      ia_validacion:      { color: '#8B5CF6', Icon: Brain },
                      evidencia_aprobada: { color: '#10B981', Icon: CheckCircle },
                      fondos_liberados:   { color: '#00F2A6', Icon: Diamond },
                      hold_iniciado:      { color: '#8B5CF6', Icon: Clock },
                      disputa_abierta:    { color: '#EF4444', Icon: AlertTriangle },
                    };
                    const { color, Icon } = MAP[event.tipo] || { color: '#94A3B8', Icon: Clock };
                    const isLast = index === sala.timeline.length - 1;
                    const isIA = event.tipo === 'ia_validacion';

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="flex items-start gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                            style={{ backgroundColor: `${color}15`, borderColor: color }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          {!isLast && <div className="w-0.5 h-6 bg-zinc-800 mt-1" />}
                        </div>
                        <div className={`flex-1 pb-4 ${!isLast ? '' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-white font-semibold text-sm leading-snug">{event.descripcion}</p>
                            {isIA && event.score !== undefined && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: `${event.score >= 0.90 ? '#00F2A6' : '#F59E0B'}20`,
                                  color: event.score >= 0.90 ? '#00F2A6' : '#F59E0B',
                                }}
                              >
                                {(event.score * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-600 text-xs mt-1">
                            {new Date(event.timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                            {event.autor === 'AUDITOR_IA' && <span className="ml-2 text-[#8B5CF6]">· Auditor IA</span>}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* EVIDENCIA */}
          {activeTab === 'evidencia' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              className="space-y-5">

              {/* Protocolo */}
              <div className="flex items-start gap-3 p-4 bg-[#00F2A6]/5 border border-[#00F2A6]/20 rounded-xl">
                <Shield className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#00F2A6] font-bold text-sm">Protocolo: NO EVIDENCE → NO PAYMENT</p>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    El Auditor IA evalúa la evidencia. Score ≥ 90% = release automático de fondos.
                    Score &lt; 90% = revisión manual o re-envío.
                  </p>
                </div>
              </div>

              {/* Evidencia entregada */}
              {sala.evidencia && (
                <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-[#10B981]/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      Evidencia Entregada
                    </h3>
                    <span className="text-zinc-500 text-xs">
                      {new Date(sala.evidencia.fechaEntrega).toLocaleString('es-ES')}
                    </span>
                  </div>

                  {sala.evidencia.notas && (
                    <p className="text-zinc-300 text-sm mb-4 p-3 bg-black/40 rounded-xl border border-zinc-800 leading-relaxed">
                      {sala.evidencia.notas}
                    </p>
                  )}

                  <div className="space-y-2">
                    {sala.evidencia.archivos?.map((archivo: any, i: number) => (
                      <a key={i} href={archivo.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-zinc-800 hover:border-[#00F2A6]/30 transition-all group">
                        <FileText className="w-5 h-5 text-[#00F2A6]" />
                        <span className="flex-1 text-white text-sm">{archivo.name}</span>
                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-[#00F2A6] transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload (solo Socio, si no hay evidencia aún) */}
              {isSocio && !sala.evidenciaEntregada && (
                <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-zinc-800 rounded-2xl p-6 space-y-5">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#00F2A6]" />
                    Subir Evidencia
                  </h3>

                  {/* Drag & Drop */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-[#00F2A6] bg-[#00F2A6]/5 scale-[1.01]'
                        : 'border-zinc-700 hover:border-[#00F2A6]/50 hover:bg-[#00F2A6]/3'
                    }`}
                  >
                    <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? 'text-[#00F2A6]' : 'text-zinc-500'}`} />
                    <p className="text-white font-semibold mb-1">
                      {dragOver ? 'Suelta aquí' : 'Arrastra o haz clic para seleccionar'}
                    </p>
                    <p className="text-zinc-500 text-sm">
                      Imágenes, videos, PDFs, documentos · Más archivos = mayor score IA
                    </p>
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
                  </div>

                  {/* Lista de archivos seleccionados */}
                  <AnimatePresence>
                    {archivos.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} className="space-y-2">
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                          {archivos.length} archivo(s) seleccionado(s)
                        </p>
                        {archivos.map((file, idx) => (
                          <motion.div key={idx}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-zinc-800">
                            {getFileIcon(file.name)}
                            <span className="flex-1 text-white text-sm truncate">{file.name}</span>
                            <span className="text-zinc-500 text-xs">{(file.size / 1024).toFixed(0)} KB</span>
                            <button onClick={e => { e.stopPropagation(); removeFile(idx); }}
                              className="text-zinc-600 hover:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notas */}
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">
                      Descripción de evidencia
                      <span className="text-zinc-500 font-normal ml-1">(más detalle = mayor score IA)</span>
                    </label>
                    <textarea
                      value={notas}
                      onChange={e => setNotas(e.target.value)}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] transition-colors min-h-[120px] resize-none"
                      placeholder="Describe en detalle qué evidencia estás entregando. Incluye links, números, métricas y resultados concretos..."
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-zinc-600 text-xs">
                        {notas.split(/\s+/).filter(Boolean).length} palabras
                      </p>
                      <p className="text-zinc-600 text-xs">
                        Recomendado: 80+ palabras con links y números
                      </p>
                    </div>
                  </div>

                  {/* Score Preview */}
                  {(archivos.length > 0 || notas.length > 20) && (
                    <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                      <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
                        Estimación de Score IA
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          {(() => {
                            const filesScore = Math.min(archivos.length / 5, 1) * 30;
                            const notasScore = Math.min(notas.split(/\s+/).filter(Boolean).length / 80, 1) * 15;
                            const est = Math.min(filesScore + notasScore + (archivos.length > 0 ? 20 : 0), 100);
                            const estColor = est >= 90 ? '#00F2A6' : est >= 70 ? '#F59E0B' : '#EF4444';
                            return (
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: estColor, width: `${est}%` }}
                                animate={{ width: `${est}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            );
                          })()}
                        </div>
                        <span className="text-zinc-400 text-xs font-bold">
                          ~{(() => {
                            const filesScore = Math.min(archivos.length / 5, 1) * 30;
                            const notasScore = Math.min(notas.split(/\s+/).filter(Boolean).length / 80, 1) * 15;
                            return Math.min(Math.round(filesScore + notasScore + (archivos.length > 0 ? 20 : 0)), 100);
                          })()}%
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUploadEvidencia}
                    disabled={uploading || archivos.length === 0}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold text-sm hover:shadow-lg hover:shadow-[#00F2A6]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Enviando al Auditor IA...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Enviar Evidencia · Validar con IA
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Si ya entregó evidencia y no fue aprobada, puede re-validar */}
              {isMarca && sala.evidenciaEntregada && !sala.fondosLiberados && (
                <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-[#8B5CF6]/20 rounded-2xl p-6 space-y-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#8B5CF6]" />
                    Acciones del Auditor
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {iaVeredicto === 'APROBADO'
                      ? 'La evidencia fue validada y aprobada automáticamente por el Auditor IA.'
                      : iaScore !== null
                        ? `Score actual: ${(iaScore * 100).toFixed(1)}%. Puedes re-validar para forzar una segunda evaluación.`
                        : 'Puedes ejecutar el Auditor IA manualmente sobre la evidencia entregada.'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleValidarIA}
                      disabled={validandoIA}
                      className="flex-1 py-3 rounded-xl border-2 border-[#8B5CF6]/40 text-[#8B5CF6] font-bold text-sm hover:bg-[#8B5CF6]/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {validandoIA ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                      {validandoIA ? 'Analizando...' : 'Re-validar con IA'}
                    </button>
                    <button
                      onClick={handleAprobarEvidencia}
                      disabled={aprobando}
                      className="flex-1 py-3 rounded-xl bg-[#10B981] text-white font-bold text-sm hover:bg-[#10B981]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {aprobando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Aprobar Manualmente
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ESCROW */}
          {activeTab === 'escrow' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              className="space-y-5">
              <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#00F2A6]" />
                  Desglose del Escrow
                </h3>

                {/* Barra de composición */}
                <div className="mb-6">
                  <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-3">
                    <motion.div
                      className="h-full bg-[#00F2A6] flex items-center justify-center text-black text-xs font-bold"
                      style={{ width: `${(sala.netoMarca / sala.totalProducto) * 100}%` }}
                      initial={{ width: 0 }} animate={{ width: `${(sala.netoMarca / sala.totalProducto) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                    <motion.div
                      className="h-full bg-[#0EA5E9]"
                      style={{ width: `${(sala.gananciaSocio / sala.totalProducto) * 100}%` }}
                      initial={{ width: 0 }} animate={{ width: `${(sala.gananciaSocio / sala.totalProducto) * 100}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                    <motion.div
                      className="h-full bg-[#F59E0B] rounded-r-full"
                      style={{ width: `${(sala.feePARTTH / sala.totalProducto) * 100}%` }}
                      initial={{ width: 0 }} animate={{ width: `${(sala.feePARTTH / sala.totalProducto) * 100}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00F2A6]" />Neto Marca {((sala.netoMarca / sala.totalProducto) * 100).toFixed(0)}%</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0EA5E9]" />Socio {sala.comisionSocio}%</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />PARTTH Fee 15%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Total en escrow */}
                  <div className="bg-[#00F2A6]/5 border border-[#00F2A6]/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Diamond className="w-5 h-5 text-[#00F2A6] fill-current" />
                      <div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total en Escrow</p>
                        <p className="text-zinc-500 text-xs">Bloqueado al crear el acuerdo</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{sala.totalProducto.toLocaleString('es-ES')} 💎</p>
                  </div>

                  <EscrowBadge
                    label="Neto Marca (se devuelve post-aprobación)"
                    amount={sala.netoMarca}
                    color="#00F2A6"
                    note={`${((sala.netoMarca / sala.totalProducto) * 100).toFixed(1)}% del total`}
                  />
                  <EscrowBadge
                    label={`Ganancia Socio (${sala.comisionSocio}% comisión)`}
                    amount={sala.gananciaSocio}
                    color="#0EA5E9"
                    note="Liberación inmediata post-validación IA"
                  />
                  <EscrowBadge
                    label="Fee PARTTH (15%) — BLOQUEADO hasta aprobación"
                    amount={sala.feePARTTH}
                    color="#F59E0B"
                    note="Solo se cobra si el acuerdo se completa con éxito"
                  />
                </div>

                {/* Estado del escrow */}
                <div className={`mt-5 p-4 rounded-xl border flex items-center gap-3 ${
                  sala.fondosLiberados
                    ? 'bg-[#10B981]/10 border-[#10B981]/30'
                    : 'bg-[#0EA5E9]/10 border-[#0EA5E9]/30'
                }`}>
                  {sala.fondosLiberados
                    ? <><CheckCircle className="w-5 h-5 text-[#10B981]" /><p className="text-[#10B981] font-bold text-sm">Fondos liberados — Split ejecutado</p></>
                    : <><Lock className="w-5 h-5 text-[#0EA5E9]" /><p className="text-[#0EA5E9] font-bold text-sm">Fondos seguros en escrow · Esperando aprobación de evidencia</p></>
                  }
                </div>
              </div>
            </motion.div>
          )}

          {/* CHAT */}
          {activeTab === 'chat' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-zinc-800 rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center gap-3">
                <MessageSquare className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-500 font-semibold">Chat en tiempo real</p>
                <p className="text-zinc-600 text-sm text-center">Próxima feature — Sprint 2</p>
              </div>
            </motion.div>
          )}

        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Desglose del Acuerdo */}
          <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Desglose del Acuerdo</h3>
            <div className="space-y-3">
              <div className="bg-black/40 rounded-xl p-3 border border-zinc-800">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total del Producto</p>
                <p className="text-2xl font-bold text-white">{sala.totalProducto.toLocaleString('es-ES')} 💎</p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-yellow-500/20">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Fee PARTTH 15%</p>
                <p className="text-lg font-bold text-yellow-500">-{sala.feePARTTH.toLocaleString('es-ES')} 💎</p>
                <p className="text-zinc-600 text-xs mt-0.5">
                  {sala.fondosLiberados ? '✓ Cobrado' : '🔒 Bloqueado en Escrow'}
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-[#0EA5E9]/20">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                  Socio ({sala.comisionSocio}%)
                </p>
                <p className="text-lg font-bold text-[#0EA5E9]">+{sala.gananciaSocio.toLocaleString('es-ES')} 💎</p>
              </div>
              <div className="bg-gradient-to-r from-[#00F2A6]/10 to-transparent rounded-xl p-3 border border-[#00F2A6]/20">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Neto Marca</p>
                <p className="text-xl font-bold text-[#00F2A6]">{sala.netoMarca.toLocaleString('es-ES')} 💎</p>
              </div>
            </div>
            <button
              onClick={() => setShowAcuerdo(true)}
              className="w-full mt-4 py-3 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] font-bold text-sm hover:bg-[#00F2A6]/20 transition-all flex items-center justify-center gap-2"
            >
              <FileSignature className="w-4 h-4" />
              Ver Acuerdo Operativo
            </button>
          </div>

          {/* Reglas del Motor IA */}
          <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-[#8B5CF6]/20 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#8B5CF6]" />
              Reglas del Auditor IA
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { icon: '💎', text: 'Score ≥ 90% → Release automático' },
                { icon: '⚠️', text: '70–89% → Revisión manual' },
                { icon: '❌', text: '< 70% → Fondos bloqueados' },
                { icon: '📁', text: '+archivos = mayor score' },
                { icon: '📸', text: 'Capturas de pantalla valoradas' },
                { icon: '📝', text: 'Notas detalladas con links' },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-zinc-400">
                  <span className="text-base w-5 flex-shrink-0">{r.icon}</span>
                  <span className="text-xs">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones de Disputa */}
          {(isMarca || isSocio) && !sala.fondosLiberados && !sala.tieneDisputa && (
            <div className="bg-gradient-to-br from-zinc-900/60 to-black border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">¿Hay un problema?</h3>
              <p className="text-zinc-500 text-xs mb-3">
                Si no puedes resolver el conflicto, el Concierge IA mediará en menos de 72h.
              </p>
              <button
                onClick={handleAbrirDisputa}
                className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Abrir Disputa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Acuerdo Operativo */}
      <AcuerdoOperativo
        isOpen={showAcuerdo}
        onClose={() => setShowAcuerdo(false)}
        salaId={sala.id}
        marca={`ID: ${sala.marcaId.slice(0, 12)}…`}
        socio={`ID: ${sala.socioId.slice(0, 12)}…`}
        totalProducto={sala.totalProducto}
        comisionSocio={sala.comisionSocio}
      />
    </div>
  );
}
