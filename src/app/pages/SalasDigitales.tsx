import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Shield, Diamond, Clock, CheckCircle, AlertTriangle, Users, Building2, Filter, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { salasAPI } from '../../lib/api';
import { CrearSalaModal } from '../components/CrearSalaModal';

export function SalasDigitales() {
  const { user } = useAuth();
  const [salas, setSalas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activa' | 'en_revision' | 'completada' | 'en_disputa'>('todos');
  const [showCrearModal, setShowCrearModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadSalas();
    }
  }, [user]);

  const loadSalas = async () => {
    try {
      setLoading(true);
      const data = await salasAPI.getSalas(user!.id);
      setSalas(data);
    } catch (error) {
      console.error('Error loading salas:', error);
    } finally {
      setLoading(false);
    }
  };

  const estadoConfig = {
    activa: {
      label: 'ACTIVO',
      color: 'text-[#00F2A6] bg-[#00F2A6]/10 border-[#00F2A6]/30',
      icon: Shield,
      iconColor: 'text-[#00F2A6]',
    },
    en_revision: {
      label: 'EN REVISIÓN',
      color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
      icon: Clock,
      iconColor: 'text-[#F59E0B]',
    },
    completada: {
      label: 'COMPLETADO',
      color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
      icon: CheckCircle,
      iconColor: 'text-[#10B981]',
    },
    en_disputa: {
      label: 'EN DISPUTA',
      color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
      icon: AlertTriangle,
      iconColor: 'text-[#EF4444]',
    },
  };

  const filteredSalas = filterEstado === 'todos' 
    ? salas 
    : salas.filter(sala => sala.estado === filterEstado);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#00F2A6] text-xl">Cargando salas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Salas Digitales</h1>
        <p className="text-[#94A3B8] text-lg">Gestiona todos tus acuerdos protegidos</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-4">
          <p className="text-[#64748B] text-sm mb-1">Total Salas</p>
          <p className="text-3xl font-bold text-white">{salas.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-4">
          <p className="text-[#64748B] text-sm mb-1">Activas</p>
          <p className="text-3xl font-bold text-[#00F2A6]">
            {salas.filter(s => s.estado === 'activa').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#F59E0B]/20 rounded-2xl p-4">
          <p className="text-[#64748B] text-sm mb-1">En Revisión</p>
          <p className="text-3xl font-bold text-[#F59E0B]">
            {salas.filter(s => s.estado === 'en_revision').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#10B981]/20 rounded-2xl p-4">
          <p className="text-[#64748B] text-sm mb-1">Completadas</p>
          <p className="text-3xl font-bold text-[#10B981]">
            {salas.filter(s => s.estado === 'completada').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#EF4444]/20 rounded-2xl p-4">
          <p className="text-[#64748B] text-sm mb-1">Disputas</p>
          <p className="text-3xl font-bold text-[#EF4444]">
            {salas.filter(s => s.estado === 'en_disputa').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-[#64748B]" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterEstado('todos')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'todos'
                ? 'bg-[#00F2A6]/10 text-[#00F2A6] border border-[#00F2A6]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterEstado('activa')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'activa'
                ? 'bg-[#00F2A6]/10 text-[#00F2A6] border border-[#00F2A6]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilterEstado('en_revision')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'en_revision'
                ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            En Revisión
          </button>
          <button
            onClick={() => setFilterEstado('completada')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'completada'
                ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            Completadas
          </button>
          <button
            onClick={() => setFilterEstado('en_disputa')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              filterEstado === 'en_disputa'
                ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                : 'bg-black/40 text-[#64748B] border border-[#00F2A6]/10 hover:text-white'
            }`}
          >
            Disputas
          </button>
        </div>
      </div>

      {/* Salas Grid */}
      {filteredSalas.length === 0 ? (
        <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-12 text-center">
          <p className="text-[#94A3B8] text-lg mb-4">
            {filterEstado === 'todos' ? 'No tienes salas digitales aún' : 'No hay salas con este estado'}
          </p>
          <Link to="/app/marketplace">
            <button className="px-6 py-3 rounded-xl bg-[#00F2A6] text-black font-bold hover:bg-[#00F2A6]/90 transition-all">
              Explorar Marketplace
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSalas.map((sala) => {
            const config = estadoConfig[sala.estado as keyof typeof estadoConfig] || estadoConfig.activa;
            const Icon = config.icon;

            // Calcular progreso
            let progreso = 10;
            if (sala.evidenciaEntregada) progreso = 60;
            if (sala.evidenciaAprobada) progreso = 90;
            if (sala.fondosLiberados) progreso = 100;

            return (
              <Link key={sala.id} to={`/app/sala/${sala.id}`}>
                <div className="bg-gradient-to-br from-[#0A0E1A] to-black border border-[#00F2A6]/20 rounded-2xl p-6 hover:border-[#00F2A6]/40 transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{sala.titulo}</h3>
                        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-[#94A3B8] mb-3">{sala.descripcion}</p>
                    </div>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                  </div>

                  {/* Participants */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 rounded-xl p-3 border border-[#00F2A6]/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-[#00F2A6]" />
                        <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">Marca</span>
                      </div>
                      <p className="text-white font-semibold">ID: {sala.marcaId.slice(0, 8)}...</p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-[#0EA5E9]/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#0EA5E9]" />
                        <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">Socio</span>
                      </div>
                      <p className="text-white font-semibold">ID: {sala.socioId.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Diamond className="w-4 h-4 text-[#00F2A6] fill-current" />
                      <span className="text-white font-bold">{sala.totalProducto.toLocaleString()}</span>
                    </div>
                    <div className="text-[#64748B]">•</div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <span className="text-[#94A3B8]">
                        {new Date(sala.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          sala.estado === 'completada'
                            ? 'bg-gradient-to-r from-[#10B981] to-[#059669]'
                            : sala.estado === 'en_disputa'
                            ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'
                            : sala.estado === 'en_revision'
                            ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]'
                            : 'bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9]'
                        }`}
                        style={{ width: `${progreso}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-semibold ${config.iconColor}`}>
                      {progreso}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Crear Sala Button */}
      <button
        onClick={() => setShowCrearModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#00F2A6] text-black font-bold rounded-full shadow-[0_0_30px_rgba(0,242,166,0.5)] hover:shadow-[0_0_40px_rgba(0,242,166,0.7)] transition-all flex items-center justify-center z-40"
        title="Crear Sala Digital"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Crear Sala Modal */}
      <CrearSalaModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSuccess={loadSalas}
      />
    </div>
  );
}