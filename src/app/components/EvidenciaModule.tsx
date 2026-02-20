/**
 * EvidenciaModule — Módulo de carga de evidencia para la Sala Digital (War Room)
 * 
 * Responsabilidades:
 * - Drag & Drop con validación de tipos y tamaños
 * - Estimación de score IA en tiempo real (client-side)
 * - Upload progresivo a Supabase Storage
 * - Visualización del resultado del Auditor IA
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload, X, FileText, Image, Video, File as FileIcon,
  Brain, Shield, CheckCircle, AlertCircle, AlertTriangle,
  Sparkles, RefreshCw, Lock, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { salasAPI } from '../../lib/api';
import { toast } from 'sonner';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ArchivoPreview {
  file: File;
  id: string;
  preview?: string;
  categoria: 'imagen' | 'video' | 'documento' | 'otro';
  esCaptureScreen: boolean;
}

interface IAScoreResult {
  score: number;
  breakdown: {
    archivos: number;
    diversidad: number;
    notas: number;
    capturas: number;
  };
  veredicto: 'APROBADO' | 'REVISION_MANUAL' | 'RECHAZADO';
}

interface Props {
  salaId: string;
  socioId: string;
  totalProducto: number;
  feePARTTH: number;
  gananciaSocio: number;
  onEvidenciaEnviada: (resultado: { sala: any; iaResult: IAScoreResult; autoAprobado: boolean }) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS_IMAGEN = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg', 'avif'];
const TIPOS_VIDEO  = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv'];
const TIPOS_DOC    = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'pptx'];
const MAX_SIZE_MB   = 50;

const CAPTURAS_KEYWORDS = [
  'screen', 'captura', 'screenshot', 'evidencia', 'resultado',
  'venta', 'sale', 'comprobante', 'pago', 'factura', 'reporte',
  'dashboard', 'analytics', 'conversion', 'stats', 'metrics',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExtension(name: string) {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function categorizeFile(name: string): ArchivoPreview['categoria'] {
  const ext = getExtension(name);
  if (TIPOS_IMAGEN.includes(ext)) return 'imagen';
  if (TIPOS_VIDEO.includes(ext))  return 'video';
  if (TIPOS_DOC.includes(ext))    return 'documento';
  return 'otro';
}

function isCaptureScreen(name: string): boolean {
  const lower = name.toLowerCase();
  return CAPTURAS_KEYWORDS.some(k => lower.includes(k));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Simula el mismo algoritmo del backend para dar feedback instantáneo al socio.
 * Debe mantenerse sincronizado con calcularScoreIA() en index.tsx.
 */
function estimarScoreIA(archivos: ArchivoPreview[], notas: string): IAScoreResult {
  const exts = new Set(archivos.map(a => getExtension(a.file.name)));

  // 1. Cantidad de archivos (30%)
  const scoreArchivos = Math.min(archivos.length / 5, 1) * 0.30;

  // 2. Diversidad de tipos (25%)
  let diversidad = 0;
  if ([...exts].some(e => TIPOS_IMAGEN.includes(e))) diversidad += 0.40;
  if ([...exts].some(e => TIPOS_VIDEO.includes(e)))  diversidad += 0.40;
  if ([...exts].some(e => TIPOS_DOC.includes(e)))    diversidad += 0.20;
  const scoreDiversidad = Math.min(diversidad, 1) * 0.25;

  // 3. Calidad de notas (25%)
  const palabras = notas.trim().split(/\s+/).filter(Boolean).length;
  const tieneLinks = /https?:\/\//.test(notas);
  const tieneNumeros = /\d/.test(notas);
  let scoreNotas = Math.min(palabras / 80, 1) * 0.15;
  if (tieneLinks)   scoreNotas += 0.06;
  if (tieneNumeros) scoreNotas += 0.04;
  scoreNotas = Math.min(scoreNotas, 0.25);

  // 4. Capturas de pantalla (20%)
  const capturas = archivos.filter(a => a.esCaptureScreen);
  const scoreCapturas = Math.min(capturas.length / 3, 1) * 0.20;

  const total = parseFloat(Math.min(scoreArchivos + scoreDiversidad + scoreNotas + scoreCapturas, 1).toFixed(3));

  let veredicto: IAScoreResult['veredicto'];
  if (total >= 0.90)      veredicto = 'APROBADO';
  else if (total >= 0.70) veredicto = 'REVISION_MANUAL';
  else                    veredicto = 'RECHAZADO';

  return {
    score: total,
    breakdown: {
      archivos:  parseFloat(scoreArchivos.toFixed(3)),
      diversidad: parseFloat(scoreDiversidad.toFixed(3)),
      notas:      parseFloat(scoreNotas.toFixed(3)),
      capturas:   parseFloat(scoreCapturas.toFixed(3)),
    },
    veredicto,
  };
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FileRow({ archivo, onRemove }: { archivo: ArchivoPreview; onRemove: () => void }) {
  const IconMap = {
    imagen:    <Image    className="w-4 h-4 text-[#0EA5E9]" />,
    video:     <Video    className="w-4 h-4 text-[#8B5CF6]" />,
    documento: <FileText className="w-4 h-4 text-[#00F2A6]" />,
    otro:      <FileIcon className="w-4 h-4 text-zinc-400"  />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="flex items-center gap-3 px-3 py-2.5 bg-black/50 border border-zinc-800 rounded-xl group hover:border-zinc-700 transition-all"
    >
      <div className="flex-shrink-0">{IconMap[archivo.categoria]}</div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{archivo.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-zinc-600 text-xs">{formatSize(archivo.file.size)}</span>
          {archivo.esCaptureScreen && (
            <span className="text-xs text-[#00F2A6] bg-[#00F2A6]/10 px-1.5 py-0.5 rounded-full">
              +capturas IA
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function ScoreIndicator({ score, veredicto }: { score: number; veredicto: IAScoreResult['veredicto'] }) {
  const pct = Math.round(score * 100);
  const color = veredicto === 'APROBADO' ? '#00F2A6' : veredicto === 'REVISION_MANUAL' ? '#F59E0B' : '#EF4444';
  const label = veredicto === 'APROBADO' ? '✓ Pasará el umbral 90%' : veredicto === 'REVISION_MANUAL' ? '⚠ Necesita revisión' : '✕ Debajo del umbral';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl border"
      style={{ backgroundColor: `${color}08`, borderColor: `${color}30` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
            Estimación IA en tiempo real
          </span>
        </div>
        <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
      </div>

      {/* Barra de score */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color, width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </motion.div>
      </div>

      {/* Umbral 90% */}
      <div className="relative h-0 -mt-5 mb-5">
        <div
          className="absolute border-l-2 border-dashed border-white/30 h-3"
          style={{ left: '90%' }}
        />
        <span
          className="absolute text-xs text-zinc-500 -translate-x-1/2 mt-3.5"
          style={{ left: '90%' }}
        >90%</span>
      </div>

      <p className="text-xs font-semibold" style={{ color }}>{label}</p>

      {veredicto !== 'APROBADO' && (
        <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-1">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Cómo subir el score:</p>
          {pct < 30 && <p className="text-zinc-400 text-xs">• Agrega más archivos (mínimo 3-5)</p>}
          {![...new Set([])].length && <p className="text-zinc-400 text-xs">• Incluye imágenes + PDF + video</p>}
          <p className="text-zinc-400 text-xs">• Nombra archivos: "screenshot_ventas.png", "comprobante.pdf"</p>
          <p className="text-zinc-400 text-xs">• Escribe 80+ palabras en la descripción con links y números</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function EvidenciaModule({
  salaId, socioId, totalProducto, feePARTTH, gananciaSocio, onEvidenciaEnviada
}: Props) {
  const [archivos, setArchivos] = useState<ArchivoPreview[]>([]);
  const [notas, setNotas] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scoreEstimado = archivos.length > 0 || notas.length > 10
    ? estimarScoreIA(archivos, notas)
    : null;

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.warning(`${f.name} supera ${MAX_SIZE_MB}MB — omitido`);
        return false;
      }
      return true;
    });

    const previews: ArchivoPreview[] = valid.map(file => ({
      file,
      id: crypto.randomUUID(),
      categoria: categorizeFile(file.name),
      esCaptureScreen: isCaptureScreen(file.name),
    }));

    setArchivos(prev => {
      const nombres = new Set(prev.map(a => a.file.name));
      return [...prev, ...previews.filter(p => !nombres.has(p.file.name))];
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (id: string) => setArchivos(prev => prev.filter(a => a.id !== id));

  const handleSubmit = async () => {
    if (archivos.length === 0) { toast.error('Agrega al menos un archivo'); return; }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload files to Supabase Storage
      const uploadedFiles: { name: string; url: string; path: string }[] = [];
      const total = archivos.length;

      for (let i = 0; i < total; i++) {
        const { file } = archivos[i];
        const path = `${salaId}/${Date.now()}_${file.name}`;

        const { error } = await supabase.storage
          .from('make-1c8a6aaa-evidencias')
          .upload(path, file);
        if (error) throw new Error(`Error subiendo ${file.name}: ${error.message}`);

        const { data: signed } = await supabase.storage
          .from('make-1c8a6aaa-evidencias')
          .createSignedUrl(path, 60 * 60 * 24 * 365);

        if (signed) uploadedFiles.push({ name: file.name, url: signed.signedUrl, path });
        setUploadProgress(Math.round(((i + 1) / total) * 70));
      }

      toast.info('Archivos subidos — Auditor IA evaluando...');
      setUploadProgress(80);

      const result = await salasAPI.entregarEvidencia(salaId, socioId, notas, uploadedFiles);
      setUploadProgress(100);

      const sala = result.sala || result;
      const iaResult: IAScoreResult = result.iaResult || { score: sala.iaScore, breakdown: sala.iaBreakdown, veredicto: sala.iaVeredicto };
      const autoAprobado: boolean = result.autoAprobado || false;

      onEvidenciaEnviada({ sala, iaResult, autoAprobado });
    } catch (error: any) {
      toast.error(error.message || 'Error enviando evidencia');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const palabras = notas.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5">

      {/* Protocolo banner */}
      <div className="flex items-start gap-3 p-4 bg-[#00F2A6]/5 border border-[#00F2A6]/20 rounded-2xl">
        <Shield className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[#00F2A6] font-bold text-sm">Protocolo: NO EVIDENCE → NO PAYMENT</p>
          <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
            El Auditor IA analiza tu evidencia al instante. Score ≥ 90% libera
            <span className="text-[#0EA5E9] font-semibold"> {gananciaSocio.toLocaleString('es-ES')} 💎</span> automáticamente.
            El 15% de PARTTH (<span className="text-yellow-500 font-semibold">{feePARTTH.toLocaleString('es-ES')} 💎</span>) ya está bloqueado en Escrow.
          </p>
        </div>
      </div>

      {/* Escrow info colapsable */}
      <button
        onClick={() => setShowEscrowInfo(v => !v)}
        className="w-full flex items-center justify-between p-3 bg-black/40 border border-zinc-800 rounded-xl text-left hover:border-zinc-700 transition-all"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-yellow-500" />
          <span className="text-zinc-300 text-sm font-semibold">Ver desglose del Escrow</span>
        </div>
        {showEscrowInfo ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>

      <AnimatePresence>
        {showEscrowInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-3 p-4 bg-black/40 border border-zinc-800 rounded-2xl">
              {[
                { label: 'Total en Escrow', value: totalProducto, color: '#ffffff', note: 'Bloqueado al iniciar acuerdo' },
                { label: 'Tu ganancia (Socio)', value: gananciaSocio, color: '#0EA5E9', note: 'Se libera con score ≥ 90%' },
                { label: 'Fee PARTTH (15%)', value: feePARTTH, color: '#F59E0B', note: 'Bloqueado hasta aprobación' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-xl font-bold" style={{ color: item.color }}>
                    {item.value.toLocaleString('es-ES')} 💎
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">{item.note}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-[#00F2A6] bg-[#00F2A6]/5 scale-[1.01]'
            : 'border-zinc-700 hover:border-[#00F2A6]/50 hover:bg-zinc-900/30'
        }`}
      >
        <motion.div
          animate={{ y: dragOver ? -4 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? 'text-[#00F2A6]' : 'text-zinc-600'}`} />
        </motion.div>
        <p className={`font-bold mb-1 transition-colors ${dragOver ? 'text-[#00F2A6]' : 'text-white'}`}>
          {dragOver ? 'Suelta aquí para subir' : 'Arrastra archivos o haz clic para seleccionar'}
        </p>
        <p className="text-zinc-500 text-sm">
          Imágenes · Videos · PDFs · Documentos · Máx. {MAX_SIZE_MB}MB por archivo
        </p>
        <p className="text-zinc-600 text-xs mt-2">
          💡 Nombra tus archivos: "screenshot_venta.png", "comprobante_pago.pdf"
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.pptx"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Lista de archivos */}
      <AnimatePresence mode="popLayout">
        {archivos.map(archivo => (
          <FileRow
            key={archivo.id}
            archivo={archivo}
            onRemove={() => removeFile(archivo.id)}
          />
        ))}
      </AnimatePresence>

      {archivos.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <Info className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <p className="text-zinc-400 text-xs">
            {archivos.length} archivo(s) · {archivos.filter(a => a.esCaptureScreen).length} capturas detectadas
            · {[...new Set(archivos.map(a => a.categoria))].join(', ')}
          </p>
        </div>
      )}

      {/* Notas */}
      <div>
        <label className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold text-sm">
            Descripción de la evidencia
          </span>
          <span className={`text-xs font-bold ${palabras >= 80 ? 'text-[#00F2A6]' : palabras >= 40 ? 'text-yellow-500' : 'text-zinc-500'}`}>
            {palabras}/80 palabras
          </span>
        </label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={5}
          className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] transition-colors resize-none leading-relaxed"
          placeholder="Describe en detalle tu evidencia:
• ¿Qué lograste? ¿Cuántas ventas/leads/conversiones?
• Links a resultados, dashboards, reportes
• Números concretos: fechas, montos, métricas
• Contexto de cada archivo adjunto..."
        />
      </div>

      {/* Score estimado en tiempo real */}
      <AnimatePresence>
        {scoreEstimado && (
          <ScoreIndicator score={scoreEstimado.score} veredicto={scoreEstimado.veredicto} />
        )}
      </AnimatePresence>

      {/* Barra de progreso de upload */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{uploadProgress < 75 ? 'Subiendo archivos...' : 'Auditor IA evaluando...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] rounded-full"
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={uploading || archivos.length === 0}
        className="w-full py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
        style={{
          background: archivos.length > 0
            ? 'linear-gradient(135deg, #00F2A6, #0EA5E9)'
            : 'rgba(255,255,255,0.05)',
          color: archivos.length > 0 ? '#000000' : '#ffffff',
          boxShadow: archivos.length > 0 && !uploading ? '0 0 24px rgba(0,242,166,0.3)' : 'none',
        }}
      >
        {uploading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{uploadProgress < 75 ? `Subiendo... ${uploadProgress}%` : 'Auditor IA evaluando...'}</span>
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            <span>Enviar Evidencia al Auditor IA</span>
            {scoreEstimado && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                scoreEstimado.veredicto === 'APROBADO'
                  ? 'bg-black/20 text-black'
                  : 'bg-black/20 text-black'
              }`}>
                ~{Math.round(scoreEstimado.score * 100)}%
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
