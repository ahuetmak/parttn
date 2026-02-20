import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { 
  Shield, 
  Diamond, 
  CheckCircle, 
  Clock, 
  Building2, 
  Users, 
  FileText, 
  Upload, 
  MessageSquare,
  QrCode,
  AlertTriangle,
  Download,
  ExternalLink,
  Edit2,
  FileSignature
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { salasAPI } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { AcuerdoOperativo } from '../components/AcuerdoOperativo';
import { toast } from 'sonner';

export function SalaDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sala, setSala] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidencia' | 'chat'>('timeline');
  const [isEditingComision, setIsEditingComision] = useState(false);
  const [showAcuerdo, setShowAcuerdo] = useState(false);
  
  // Evidencia
  const [notas, setNotas] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadSala();
    }
  }, [id]);

  const loadSala = async () => {
    try {
      setLoading(true);
      const data = await salasAPI.getSala(id!);
      setSala(data);
    } catch (error) {
      console.error('Error loading sala:', error);
      toast.error('Error cargando sala');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
    }
  };

  const handleUploadEvidencia = async () => {
    if (!sala || !user) return;
    
    if (sala.socioId !== user.id) {
      toast.error('Solo el socio puede subir evidencia');
      return;
    }

    if (archivos.length === 0) {
      toast.error('Selecciona al menos un archivo');
      return;
    }

    try {
      setUploading(true);
      
      // Subir archivos a Supabase Storage
      const uploadedFiles = [];
      
      for (const archivo of archivos) {
        const fileName = `${sala.id}/${Date.now()}_${archivo.name}`;
        const { data, error } = await supabase.storage
          .from('make-1c8a6aaa-evidencias')
          .upload(fileName, archivo);
        
        if (error) throw error;
        
        // Obtener URL firmada
        const { data: signedData } = await supabase.storage
          .from('make-1c8a6aaa-evidencias')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 año
        
        if (signedData) {
          uploadedFiles.push({
            name: archivo.name,
            url: signedData.signedUrl,
            path: fileName,
          });
        }
      }

      // Enviar evidencia al backend
      await salasAPI.entregarEvidencia(sala.id, user.id, notas, uploadedFiles);
      
      toast.success('Evidencia enviada exitosamente');
      setNotas('');
      setArchivos([]);
      loadSala(); // Recargar sala
    } catch (error) {
      console.error('Error uploading evidencia:', error);
      toast.error('Error subiendo evidencia');
    } finally {
      setUploading(false);
    }
  };

  const handleAprobarEvidencia = async () => {
    if (!sala || !user) return;
    
    if (sala.marcaId !== user.id) {
      toast.error('Solo la marca puede aprobar evidencia');
      return;
    }

    if (!sala.evidenciaEntregada) {
      toast.error('No hay evidencia para aprobar');
      return;
    }

    try {
      await salasAPI.aprobarEvidencia(sala.id, user.id);
      toast.success('Evidencia aprobada - Fondos liberándose');
      loadSala();
    } catch (error) {
      console.error('Error aprobando evidencia:', error);
      toast.error('Error aprobando evidencia');
    }
  };

  const handleAbrirDisputa = async () => {
    if (!sala || !user) return;
    
    const razon = prompt('¿Cuál es el motivo de la disputa?');
    if (!razon) return;
    
    const descripcion = prompt('Describe la situación:');
    if (!descripcion) return;

    try {
      await salasAPI.abrirDisputa(sala.id, user.id, razon, descripcion);
      toast.success('Disputa abierta');
      loadSala();
    } catch (error) {
      console.error('Error abriendo disputa:', error);
      toast.error('Error abriendo disputa');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#00F2A6] text-xl">Cargando sala...</p>
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-white text-xl mb-4">Sala no encontrada</p>
        <Link to="/app/salas">
          <button className="px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all">
            Volver a Salas
          </button>
        </Link>
      </div>
    );
  }

  const isMarca = user?.id === sala.marcaId;
  const isSocio = user?.id === sala.socioId;

  const estadoConfig: any = {
    activa: { color: '#00F2A6', label: 'ESCROW ACTIVO' },
    en_revision: { color: '#F59E0B', label: 'EN REVISIÓN' },
    completada: { color: '#10B981', label: 'COMPLETADA' },
    en_disputa: { color: '#EF4444', label: 'EN DISPUTA' },
  };

  const currentEstado = estadoConfig[sala.estado] || estadoConfig.activa;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/app/salas" className="text-[#64748B] hover:text-white transition-colors">
          Salas Digitales
        </Link>
        <span className="text-[#64748B]">/</span>
        <span className="text-white font-semibold">Sala #{sala.id.slice(0, 8)}</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00F2A6]/10 border border-[#00F2A6]/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#00F2A6]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{sala.titulo}</h1>
                <p className="text-[#64748B] text-sm">
                  Creada {new Date(sala.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <p className="text-[#94A3B8] text-lg">{sala.descripcion}</p>
          </div>

          <div 
            className="px-4 py-2 rounded-full border"
            style={{
              backgroundColor: `${currentEstado.color}10`,
              borderColor: `${currentEstado.color}30`,
              color: currentEstado.color
            }}
          >
            <span className="font-semibold text-sm">{currentEstado.label}</span>
          </div>
        </div>

        {/* Participants */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-black/40 rounded-2xl p-6 border border-[#00F2A6]/10">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-[#00F2A6]" />
              <span className="text-[#64748B] text-sm font-semibold uppercase tracking-wider">Marca</span>
              {isMarca && <span className="text-[#00F2A6] text-xs">(Tú)</span>}
            </div>
            <p className="text-white font-bold text-xl mb-1">ID: {sala.marcaId.slice(0, 12)}...</p>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 border border-[#0EA5E9]/10">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-[#0EA5E9]" />
              <span className="text-[#64748B] text-sm font-semibold uppercase tracking-wider">Socio</span>
              {isSocio && <span className="text-[#0EA5E9] text-xs">(Tú)</span>}
            </div>
            <p className="text-white font-bold text-xl mb-1">ID: {sala.socioId.slice(0, 12)}...</p>
          </div>
        </div>

        {/* Diamantes Bloqueados */}
        <div className="bg-gradient-to-r from-[#00F2A6]/10 to-[#0EA5E9]/10 rounded-2xl p-6 border border-[#00F2A6]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Diamond className="w-10 h-10 text-[#00F2A6] fill-current" />
              <div>
                <p className="text-[#64748B] text-sm">Diamantes en Escrow</p>
                <p className="text-4xl font-bold text-white">{sala.totalProducto.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#64748B] text-sm">Valor USD</p>
              <p className="text-3xl font-bold text-[#00F2A6]">${sala.totalProducto.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#00F2A6]/20">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'timeline'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-[#64748B] hover:text-white'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('evidencia')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'evidencia'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-[#64748B] hover:text-white'
          }`}
        >
          Evidencia
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'chat'
              ? 'border-[#00F2A6] text-[#00F2A6]'
              : 'border-transparent text-[#64748B] hover:text-white'
          }`}
        >
          Chat
        </button>
      </div>

      {/* Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'timeline' && (
            <>
              {/* Timeline */}
              <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
                <h3 className="text-white font-bold text-xl mb-6">Timeline del Acuerdo</h3>
                <div className="space-y-4">
                  {sala.timeline?.map((event: any, index: number) => {
                    const iconMap: any = {
                      'creacion': { Icon: Shield, color: '#0EA5E9' },
                      'evidencia_entregada': { Icon: Upload, color: '#F59E0B' },
                      'evidencia_aprobada': { Icon: CheckCircle, color: '#10B981' },
                      'fondos_liberados': { Icon: Diamond, color: '#00F2A6' },
                      'hold_iniciado': { Icon: Clock, color: '#8B5CF6' },
                      'disputa_abierta': { Icon: AlertTriangle, color: '#EF4444' },
                    };
                    const iconData = iconMap[event.tipo] || { Icon: Clock, color: '#94A3B8' };
                    const isLast = index === sala.timeline.length - 1;

                    return (
                      <div key={event.id} className="flex items-start gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${iconData.color}20`,
                            border: `2px solid ${iconData.color}`
                          }}
                        >
                          <iconData.Icon className="w-5 h-5" style={{ color: iconData.color }} />
                        </div>
                        <div className={`flex-1 pb-4 ${!isLast ? 'border-b border-[#00F2A6]/10' : ''}`}>
                          <p className="text-white font-semibold mb-1">{event.descripcion}</p>
                          <p className="text-[#64748B] text-xs">
                            {new Date(event.timestamp).toLocaleString('es-ES', { 
                              dateStyle: 'medium', 
                              timeStyle: 'short' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'evidencia' && (
            <>
              {/* Evidencia Entregada */}
              {sala.evidencia && (
                <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#10B981]/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-xl mb-4">Evidencia Entregada</h3>
                  <p className="text-[#94A3B8] mb-4">{sala.evidencia.notas}</p>
                  
                  <div className="space-y-2">
                    {sala.evidencia.archivos?.map((archivo: any, index: number) => (
                      <a
                        key={index}
                        href={archivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-[#00F2A6]/10 hover:border-[#00F2A6]/30 transition-all"
                      >
                        <FileText className="w-5 h-5 text-[#00F2A6]" />
                        <span className="flex-1 text-white">{archivo.name}</span>
                        <ExternalLink className="w-4 h-4 text-[#64748B]" />
                      </a>
                    ))}
                  </div>
                  
                  <p className="text-[#64748B] text-sm mt-4">
                    Entregada: {new Date(sala.evidencia.fechaEntrega).toLocaleString('es-ES')}
                  </p>
                </div>
              )}

              {/* Upload Area (solo para Socio) */}
              {isSocio && !sala.evidenciaEntregada && (
                <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-xl mb-4">Subir Evidencia</h3>
                  
                  <div className="border-2 border-dashed border-[#00F2A6]/30 rounded-2xl p-8 text-center hover:border-[#00F2A6]/60 transition-all">
                    <Upload className="w-12 h-12 text-[#00F2A6] mx-auto mb-4" />
                    <p className="text-white font-semibold mb-2">Selecciona archivos</p>
                    <p className="text-[#64748B] text-sm mb-4">
                      {archivos.length > 0 ? `${archivos.length} archivo(s) seleccionado(s)` : 'PDF, imágenes, videos'}
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all cursor-pointer"
                    >
                      Seleccionar Archivos
                    </label>
                  </div>

                  <div className="mt-6">
                    <label className="block text-white font-semibold mb-2">Notas adicionales</label>
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-full bg-black/40 border border-[#00F2A6]/20 rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2A6] transition-colors min-h-[120px]"
                      placeholder="Describe tu evidencia, incluye links relevantes..."
                    ></textarea>
                  </div>

                  <button 
                    onClick={handleUploadEvidencia}
                    disabled={uploading || archivos.length === 0}
                    className="w-full mt-6 px-6 py-4 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all shadow-[0_0_20px_rgba(0,242,166,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Subiendo...' : 'Enviar Evidencia para Revisión'}
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'chat' && (
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6 min-h-[500px] flex flex-col">
              <h3 className="text-white font-bold text-xl mb-4">Chat Interno</h3>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#64748B]">Chat en desarrollo</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Desglose de Tarifas */}
          <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Desglose del Acuerdo</h3>
            
            {/* Total Producto */}
            <div className="bg-black/40 rounded-xl p-4 mb-3 border border-[#00F2A6]/10">
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">
                Total del Producto
              </p>
              <p className="text-3xl font-bold text-white">{sala.totalProducto.toLocaleString()} 💎</p>
            </div>

            {/* Fee PARTH */}
            <div className="bg-black/40 rounded-xl p-4 mb-3 border border-[#F59E0B]/10">
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">
                Fee PARTH (15%)
              </p>
              <p className="text-2xl font-bold text-[#F59E0B]">-{sala.feePARTTH.toLocaleString()} 💎</p>
            </div>

            {/* Ganancia Socio */}
            <div className="bg-black/40 rounded-xl p-4 mb-3 border border-[#0EA5E9]/10">
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">
                Ganancia Socio ({sala.comisionSocio}%)
              </p>
              <p className="text-2xl font-bold text-[#0EA5E9]">{sala.gananciaSocio.toLocaleString()} 💎</p>
            </div>

            {/* Neto Marca */}
            <div className="bg-gradient-to-r from-[#10B981]/20 to-[#10B981]/10 rounded-xl p-4 border border-[#10B981]/30">
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">
                Neto Marca
              </p>
              <p className="text-3xl font-bold text-[#10B981]">{sala.netoMarca.toLocaleString()} 💎</p>
              <p className="text-[#10B981] text-xs mt-2">
                {((sala.netoMarca / sala.totalProducto) * 100).toFixed(1)}% del total
              </p>
            </div>

            <div className="mt-4 p-3 bg-[#00F2A6]/10 border border-[#00F2A6]/20 rounded-xl">
              <p className="text-[#00F2A6] text-xs text-center">
                ⚡ Se cobra solo cuando se libera el pago
              </p>
            </div>

            <button 
              onClick={() => setShowAcuerdo(true)}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all flex items-center justify-center gap-2"
            >
              <FileSignature className="w-4 h-4" />
              Ver Acuerdo Operativo
            </button>
          </div>

          {/* Actions */}
          {(isMarca || isSocio) && (
            <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Acciones</h3>
              <div className="space-y-3">
                {isMarca && sala.evidenciaEntregada && !sala.evidenciaAprobada && (
                  <button 
                    onClick={handleAprobarEvidencia}
                    className="w-full px-4 py-3 rounded-xl bg-[#10B981] text-white font-bold hover:bg-[#10B981]/90 transition-all"
                  >
                    Aprobar Evidencia
                  </button>
                )}
                
                {!sala.tieneDisputa && (
                  <button 
                    onClick={handleAbrirDisputa}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#EF4444]/30 text-[#EF4444] font-semibold hover:bg-[#EF4444]/10 transition-all"
                  >
                    Abrir Disputa
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acuerdo Operativo Modal */}
      <AcuerdoOperativo
        isOpen={showAcuerdo}
        onClose={() => setShowAcuerdo(false)}
        salaId={sala.id}
        marca={`ID: ${sala.marcaId.slice(0, 12)}...`}
        socio={`ID: ${sala.socioId.slice(0, 12)}...`}
        totalProducto={sala.totalProducto}
        comisionSocio={sala.comisionSocio}
      />
    </div>
  );
}