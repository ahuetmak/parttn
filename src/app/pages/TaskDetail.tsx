import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Diamond,
  Shield,
  Clock,
  Users,
  Award,
  Building2,
  CheckCircle,
  Send,
  AlertCircle,
  Zap,
  Lock,
  FileText,
  Tag,
  Calendar,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceAPI } from '../../lib/api';

export function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [oferta, setOferta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application form state
  const [propuesta, setPropuesta] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const currentUserType = userProfile?.userType || user?.user_metadata?.userType;
  const isSocio = currentUserType === 'socio';
  const isMarca = currentUserType === 'marca';

  useEffect(() => {
    if (id) loadOferta();
  }, [id]);

  const loadOferta = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceAPI.getOferta(id!);
      setOferta(data);

      // Check if current user already applied
      if (user && data.aplicaciones) {
        const applied = data.aplicaciones.some(
          (a: any) => a.socioId === user.id
        );
        setAlreadyApplied(applied);
      }
    } catch (err: any) {
      console.error('Error loading oferta:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !propuesta.trim()) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      await marketplaceAPI.aplicarAOferta({
        ofertaId: id!,
        socioId: user.id,
        socioNombre:
          userProfile?.name || user?.user_metadata?.name || 'Socio',
        socioReputacion: userProfile?.reputation || 0,
        propuesta: propuesta.trim(),
      });

      setSubmitted(true);
      setAlreadyApplied(true);
    } catch (err: any) {
      console.error('Error applying:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#00F2A6]/20 border-t-[#00F2A6] rounded-full animate-spin mb-4" />
          <p className="text-zinc-400">Cargando oferta...</p>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──────────────────
  if (error || !oferta) {
    return (
      <div className="space-y-8 p-8">
        <Link
          to="/app/marketplace"
          className="flex items-center gap-2 text-[#00F2A6] hover:text-[#00F2A6]/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Marketplace
        </Link>

        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Oferta no encontrada
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            {error || 'La oferta que buscas no existe o fue eliminada.'}
          </p>
          <button
            onClick={() => navigate('/app/marketplace')}
            className="px-6 py-3 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] hover:bg-[#00F2A6]/20 transition-all font-bold"
          >
            Explorar Marketplace
          </button>
        </div>
      </div>
    );
  }

  // ── Computed values ────────────────────
  const comisionSocio = oferta.comisionSocio || 25;
  const presupuesto = oferta.presupuesto || 0;
  const gananciaSocio = Math.round(presupuesto * (comisionSocio / 100));
  const feePARTH = Math.round(presupuesto * 0.15);
  const netoMarca = presupuesto - feePARTH - gananciaSocio;
  const numAplicaciones = oferta.aplicaciones?.length || 0;
  const isOwner = user && oferta.marcaId === user.id;
  const createdDate = oferta.createdAt
    ? new Date(oferta.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Back navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/app/marketplace"
          className="inline-flex items-center gap-2 text-[#00F2A6] hover:text-[#00F2A6]/80 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Marketplace
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left column: Offer details ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/5 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 md:p-8">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/30 text-[#00F2A6] text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  ESCROW PROTEGIDO
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-bold flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  {oferta.categoria || 'General'}
                </span>
                {oferta.estado === 'abierta' && (
                  <span className="px-3 py-1 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                    Abierta
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {oferta.titulo}
              </h1>

              {createdDate && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
                  <Calendar className="w-4 h-4" />
                  Publicada el {createdDate}
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">
                  {oferta.descripcion}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Requirements */}
          {oferta.requisitos && oferta.requisitos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                Requisitos
              </h2>
              <ul className="space-y-3">
                {oferta.requisitos.map((req: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-zinc-300"
                  >
                    <CheckCircle className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Financial breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center">
                <Diamond className="w-5 h-5 text-[#00F2A6]" />
              </div>
              Desglose Financiero
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-400">Presupuesto Total</span>
                <span className="text-white font-bold text-lg">
                  {presupuesto.toLocaleString('es-ES')} 💎
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-400">
                  Comision Socio ({comisionSocio}%)
                </span>
                <span className="text-[#0EA5E9] font-bold text-lg">
                  +{gananciaSocio.toLocaleString('es-ES')} 💎
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-400">Fee PARTH (15%)</span>
                <span className="text-[#F59E0B] font-bold text-lg">
                  -{feePARTH.toLocaleString('es-ES')} 💎
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-zinc-400">Neto para la Marca</span>
                <span className="text-white font-bold text-lg">
                  {netoMarca.toLocaleString('es-ES')} 💎
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#00F2A6]/5 border border-[#00F2A6]/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Los fondos se bloquean en escrow al crear la Sala Digital.
                  Solo se liberan cuando la evidencia es aprobada y el periodo
                  de hold finaliza.
                </p>
              </div>
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#0EA5E9]" />
              </div>
              ¿Cómo funciona?
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: 1,
                  title: 'Aplica',
                  desc: 'Envia tu propuesta detallada',
                },
                {
                  step: 2,
                  title: 'Aceptada',
                  desc: 'La Marca acepta y crea la Sala',
                },
                {
                  step: 3,
                  title: 'Trabaja',
                  desc: 'Completa y sube evidencia',
                },
                {
                  step: 4,
                  title: 'Cobra',
                  desc: 'Fondos liberados tras aprobacion',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="text-center p-4 bg-black/40 rounded-xl border border-zinc-800/50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold text-lg flex items-center justify-center mx-auto mb-3">
                    {item.step}
                  </div>
                  <p className="text-white font-bold text-sm mb-1">
                    {item.title}
                  </p>
                  <p className="text-zinc-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right column: Sidebar ── */}
        <div className="space-y-6">
          {/* Marca info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
              Publicada por
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/30 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[#00F2A6]" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">
                  {oferta.marcaNombre || 'Marca Verificada'}
                </p>
                <p className="text-zinc-500 text-sm">Marca</p>
              </div>
            </div>

            {oferta.marcaReputacion != null && (
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-green-400 font-bold">
                  {oferta.marcaReputacion}%
                </span>
                <span className="text-zinc-500 text-sm">Reputacion</span>
              </div>
            )}

            {oferta.marcaId && !isOwner && (
              <Link
                to={`/app/profile/${oferta.marcaId}`}
                className="text-[#0EA5E9] text-sm font-medium hover:text-[#0EA5E9]/80 transition-colors flex items-center gap-1.5"
              >
                Ver perfil completo
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </motion.div>

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm flex items-center gap-2">
                <Diamond className="w-4 h-4 text-[#00F2A6]" />
                Presupuesto
              </span>
              <span className="text-white font-bold text-xl">
                {presupuesto.toLocaleString('es-ES')} 💎
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0EA5E9]" />
                Aplicaciones
              </span>
              <span className="text-white font-bold">{numAplicaciones}</span>
            </div>
            {oferta.duracion && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8B5CF6]" />
                  Duracion
                </span>
                <span className="text-white font-bold">{oferta.duracion}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                Tu ganancia
              </span>
              <span className="text-[#00F2A6] font-bold text-xl">
                {gananciaSocio.toLocaleString('es-ES')} 💎
              </span>
            </div>
          </motion.div>

          {/* ── Application Form (Socios) ── */}
          {isSocio && !isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-zinc-900/80 to-black border border-[#00F2A6]/20 rounded-2xl p-6"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[#00F2A6]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Aplicacion enviada
                    </h3>
                    <p className="text-zinc-400 text-sm mb-6">
                      La Marca revisara tu propuesta y te notificara si es
                      aceptada. Puedes ver el estado en tu panel de
                      Aplicaciones.
                    </p>
                    <Link
                      to="/app/aplicaciones"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 text-[#00F2A6] hover:bg-[#00F2A6]/20 transition-all font-medium text-sm"
                    >
                      Ver mis aplicaciones
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </motion.div>
                ) : alreadyApplied ? (
                  <motion.div
                    key="already"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[#0EA5E9]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Ya aplicaste
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      Tu propuesta ya fue enviada. Espera la respuesta de la
                      Marca.
                    </p>
                    <Link
                      to="/app/aplicaciones"
                      className="text-[#0EA5E9] text-sm font-medium hover:text-[#0EA5E9]/80 transition-colors"
                    >
                      Ver estado de aplicacion &rarr;
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Enviar propuesta
                    </h3>
                    <p className="text-zinc-500 text-sm mb-5">
                      Explica por que eres el Socio ideal para esta oferta.
                    </p>

                    <form onSubmit={handleSubmitApplication}>
                      <textarea
                        value={propuesta}
                        onChange={(e) => setPropuesta(e.target.value)}
                        placeholder="Describe tu experiencia relevante, enfoque propuesto, timeline estimado y por que deberias ser seleccionado..."
                        rows={6}
                        className="w-full bg-black/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6]/40 transition-colors resize-none text-sm leading-relaxed"
                        required
                        minLength={20}
                      />

                      <p className="text-zinc-600 text-xs mt-2 mb-4">
                        Minimo 20 caracteres.{' '}
                        {propuesta.length > 0 && (
                          <span
                            className={
                              propuesta.length >= 20
                                ? 'text-[#00F2A6]'
                                : 'text-[#F59E0B]'
                            }
                          >
                            {propuesta.length} caracteres
                          </span>
                        )}
                      </p>

                      {submitError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {submitError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={
                          submitting || propuesta.trim().length < 20
                        }
                        className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold hover:shadow-lg hover:shadow-[#00F2A6]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Enviar Propuesta
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Marca owner view — see applications */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-zinc-900/80 to-black border border-[#0EA5E9]/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-1">
                Tu oferta
              </h3>
              <p className="text-zinc-500 text-sm mb-5">
                Tienes {numAplicaciones} aplicacion
                {numAplicaciones !== 1 ? 'es' : ''} recibida
                {numAplicaciones !== 1 ? 's' : ''}.
              </p>

              {numAplicaciones > 0 ? (
                <div className="space-y-3 mb-5">
                  {oferta.aplicaciones
                    .slice(0, 5)
                    .map((app: any) => (
                      <div
                        key={app.id}
                        className="p-3 bg-black/40 border border-zinc-800 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium text-sm">
                            {app.socioNombre}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                              app.estado === 'pendiente'
                                ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                                : app.estado === 'aceptada'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {app.estado === 'pendiente'
                              ? 'Pendiente'
                              : app.estado === 'aceptada'
                              ? 'Aceptada'
                              : 'Rechazada'}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-xs line-clamp-2">
                          {app.propuesta}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm mb-5">
                  Aun no hay aplicaciones. Comparte tu oferta para recibir
                  propuestas.
                </p>
              )}

              <Link
                to="/app/aplicaciones"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 transition-all font-bold text-sm"
              >
                Gestionar Aplicaciones
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </motion.div>
          )}

          {/* CTA for Marcas (non-owner) */}
          {isMarca && !isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800 rounded-2xl p-6 text-center"
            >
              <Shield className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm mb-4">
                Las Marcas no pueden aplicar a ofertas. Solo los Socios
                pueden enviar propuestas.
              </p>
              <Link
                to="/app/crear-oferta"
                className="text-[#00F2A6] text-sm font-medium hover:text-[#00F2A6]/80 transition-colors"
              >
                Crear tu propia oferta &rarr;
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
