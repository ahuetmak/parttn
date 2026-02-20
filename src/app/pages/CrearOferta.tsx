import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, DollarSign, Calendar, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function CrearOferta() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'marketing',
    tipoAcuerdo: 'servicio',
    presupuesto: '',
    comisionSocio: '25',
    duracion: '',
    requisitos: '',
  });

  const categorias = [
    { value: 'marketing', label: '📢 Marketing Digital' },
    { value: 'ventas', label: '💰 Ventas' },
    { value: 'desarrollo', label: '💻 Desarrollo' },
    { value: 'diseno', label: '🎨 Diseño' },
    { value: 'contenido', label: '✍️ Contenido' },
    { value: 'consulting', label: '📊 Consultoría' },
    { value: 'otro', label: '🔧 Otro' },
  ];

  const tiposAcuerdo = [
    { value: 'servicio', label: 'Servicio (Sin Hold)', desc: 'Pago inmediato al aprobar evidencia' },
    { value: 'venta', label: 'Venta/Producto (Hold 14 días)', desc: 'Permite devoluciones del cliente' },
    { value: 'afiliacion', label: 'Afiliación (Hold 14 días)', desc: 'Para comisiones de referidos' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        setError('Debes estar autenticado para crear una oferta');
        return;
      }

      if ((userProfile?.userType || user?.user_metadata?.userType) !== 'marca') {
        setError('Solo las Marcas pueden crear ofertas');
        return;
      }

      const presupuesto = parseFloat(formData.presupuesto);
      const comisionSocio = parseFloat(formData.comisionSocio);

      if (isNaN(presupuesto) || presupuesto < 10) {
        setError('El presupuesto mínimo es 10 diamantes');
        return;
      }

      if (isNaN(comisionSocio) || comisionSocio < 1 || comisionSocio > 40) {
        setError('La comisión del socio debe estar entre 1% y 40%');
        return;
      }

      // Calcular desglose
      const feePARTH = presupuesto * 0.15;
      const gananciaSocio = presupuesto * (comisionSocio / 100);
      const netoMarca = presupuesto - feePARTH - gananciaSocio;

      const oferta = {
        marcaId: user.id,
        marcaNombre: userProfile?.name || user?.user_metadata?.name || 'Marca',
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        tipoAcuerdo: formData.tipoAcuerdo,
        presupuesto,
        comisionSocio,
        feePARTH,
        gananciaSocio,
        netoMarca,
        duracion: formData.duracion,
        requisitos: formData.requisitos,
        estado: 'abierta',
        aplicaciones: [],
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/ofertas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(oferta),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error creando oferta');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/app/marketplace');
      }, 2000);
    } catch (err: any) {
      console.error('Error creando oferta:', err);
      setError(err.message || 'Error creando la oferta');
    } finally {
      setLoading(false);
    }
  };

  const presupuesto = parseFloat(formData.presupuesto) || 0;
  const comisionSocio = parseFloat(formData.comisionSocio) || 25;
  const feePARTH = presupuesto * 0.15;
  const gananciaSocio = presupuesto * (comisionSocio / 100);
  const netoMarca = presupuesto - feePARTH - gananciaSocio;

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center">
              <Plus className="w-7 h-7 text-black" />
            </div>
            Crear Nueva Oferta
          </h1>
          <p className="text-zinc-400 text-lg">
            Publica una oportunidad en el marketplace y recibe aplicaciones de Socios verificados.
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-[#00F2A6]/10 border border-[#00F2A6]/30 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
            <p className="text-[#00F2A6]">¡Oferta creada exitosamente! Redirigiendo...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid de 2 columnas */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Columna izquierda - Formulario */}
            <div className="space-y-6">
              {/* Título */}
              <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                <label className="block text-white font-semibold mb-2">
                  Título de la Oferta *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Socio para campaña de Meta Ads"
                  required
                  className="w-full bg-black border border-[#00F2A6]/30 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] focus:ring-2 focus:ring-[#00F2A6]/20"
                />
              </div>

              {/* Descripción */}
              <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe el proyecto, objetivos, entregables..."
                  required
                  rows={6}
                  className="w-full bg-black border border-[#00F2A6]/30 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] focus:ring-2 focus:ring-[#00F2A6]/20 resize-none"
                />
              </div>

              {/* Categoría y Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                  <label className="block text-white font-semibold mb-2">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-black border border-[#00F2A6]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00F2A6]"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                  <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Duración
                  </label>
                  <input
                    type="text"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                    placeholder="Ej: 30 días"
                    className="w-full bg-black border border-[#00F2A6]/30 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6]"
                  />
                </div>
              </div>

              {/* Tipo de Acuerdo */}
              <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                <label className="block text-white font-semibold mb-3">Tipo de Acuerdo</label>
                <div className="space-y-3">
                  {tiposAcuerdo.map((tipo) => (
                    <label
                      key={tipo.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.tipoAcuerdo === tipo.value
                          ? 'border-[#00F2A6] bg-[#00F2A6]/5'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoAcuerdo"
                        value={tipo.value}
                        checked={formData.tipoAcuerdo === tipo.value}
                        onChange={(e) =>
                          setFormData({ ...formData, tipoAcuerdo: e.target.value })
                        }
                        className="mt-1"
                      />
                      <div>
                        <p className="text-white font-medium">{tipo.label}</p>
                        <p className="text-sm text-zinc-400">{tipo.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Requisitos */}
              <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                <label className="block text-white font-semibold mb-2">
                  Requisitos del Socio
                </label>
                <textarea
                  value={formData.requisitos}
                  onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                  placeholder="Experiencia requerida, habilidades, reputación mínima..."
                  rows={4}
                  className="w-full bg-black border border-[#00F2A6]/30 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] resize-none"
                />
              </div>
            </div>

            {/* Columna derecha - Financiero */}
            <div className="space-y-6">
              {/* Presupuesto */}
              <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Presupuesto Total *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.presupuesto}
                    onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                    placeholder="100"
                    required
                    min="10"
                    step="1"
                    className="w-full bg-black border border-[#00F2A6]/30 rounded-lg pl-4 pr-16 py-3 text-white text-lg font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] focus:ring-2 focus:ring-[#00F2A6]/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00F2A6] font-semibold">
                    💎 DMT
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Mínimo: 10 diamantes</p>
              </div>

              {/* Comisión Socio */}
              <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
                <label className="block text-white font-semibold mb-2">
                  Comisión del Socio *
                </label>
                <div className="space-y-4">
                  <input
                    type="range"
                    value={formData.comisionSocio}
                    onChange={(e) =>
                      setFormData({ ...formData, comisionSocio: e.target.value })
                    }
                    min="1"
                    max="40"
                    step="1"
                    className="w-full accent-[#00F2A6]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">1%</span>
                    <span className="text-3xl font-bold text-[#00F2A6]">
                      {formData.comisionSocio}%
                    </span>
                    <span className="text-zinc-400 text-sm">40%</span>
                  </div>
                </div>
              </div>

              {/* Desglose Financiero */}
              <div className="bg-gradient-to-br from-[#00F2A6]/10 to-[#0EA5E9]/10 border-2 border-[#00F2A6]/30 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  💰 Desglose Financiero
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-[#00F2A6]/20">
                    <span className="text-zinc-400">Presupuesto Total</span>
                    <span className="text-white font-mono font-semibold">
                      {presupuesto.toFixed(2)} 💎
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-red-400 text-sm">- Fee PARTH (15%)</span>
                    <span className="text-red-400 font-mono">-{feePARTH.toFixed(2)} 💎</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#00F2A6] text-sm">
                      - Ganancia Socio ({comisionSocio}%)
                    </span>
                    <span className="text-[#00F2A6] font-mono">-{gananciaSocio.toFixed(2)} 💎</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-[#00F2A6]/30">
                    <span className="text-white font-bold">Tu Neto (Marca)</span>
                    <span className="text-[#0EA5E9] font-mono font-bold text-xl">
                      {netoMarca.toFixed(2)} 💎
                    </span>
                  </div>
                </div>

                {netoMarca < 0 && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">
                      ⚠️ La comisión del socio es demasiado alta. Tu neto sería negativo.
                    </p>
                  </div>
                )}
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading || netoMarca < 0}
                className="w-full bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Publicar Oferta
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}