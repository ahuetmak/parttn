import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Shield,
  Clock,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Notification {
  id: string;
  type:
    | 'evidencia_aprobada'
    | 'fondos_liberados'
    | 'nueva_aplicacion'
    | 'disputa_abierta'
    | 'mensaje_nuevo'
    | 'hold_completado'
    | 'pago_recibido';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export function Notificaciones() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'no_leidas'>('todas');

  useEffect(() => {
    loadNotificaciones();
    // Polling cada 30 segundos
    const interval = setInterval(loadNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotificaciones = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/notifications/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId: user?.id }),
        }
      );

      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notificaciones.filter((n) => !n.read).map((n) => n.id);
    await Promise.all(unreadIds.map((id) => markAsRead(id)));
  };

  const deleteNotification = async (notificationId: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'evidencia_aprobada':
        return <CheckCircle2 className="w-5 h-5 text-[#00F2A6]" />;
      case 'fondos_liberados':
        return <DollarSign className="w-5 h-5 text-[#00F2A6]" />;
      case 'nueva_aplicacion':
        return <TrendingUp className="w-5 h-5 text-[#0EA5E9]" />;
      case 'disputa_abierta':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'mensaje_nuevo':
        return <MessageSquare className="w-5 h-5 text-[#0EA5E9]" />;
      case 'hold_completado':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pago_recibido':
        return <Shield className="w-5 h-5 text-[#00F2A6]" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.data?.salaId) {
      return `/app/sala/${notification.data.salaId}`;
    }
    if (notification.data?.ofertaId) {
      return `/app/marketplace?oferta=${notification.data.ofertaId}`;
    }
    return null;
  };

  const filteredNotificaciones =
    filter === 'no_leidas'
      ? notificaciones.filter((n) => !n.read)
      : notificaciones;

  const unreadCount = notificaciones.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00F2A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center relative">
                <Bell className="w-7 h-7 text-black" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              Notificaciones
            </h1>
            <p className="text-zinc-400 text-lg">
              Mantente al día con todas las actualizaciones de tus acuerdos
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-[#00F2A6]/20 border border-[#00F2A6]/30 rounded-lg text-[#00F2A6] font-semibold hover:bg-[#00F2A6]/30 transition-all text-sm"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('todas')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'todas'
                ? 'bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-[#00F2A6]/20'
            }`}
          >
            Todas ({notificaciones.length})
          </button>
          <button
            onClick={() => setFilter('no_leidas')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'no_leidas'
                ? 'bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-[#00F2A6]/20'
            }`}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        {/* Lista de Notificaciones */}
        {filteredNotificaciones.length === 0 ? (
          <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl p-12 text-center">
            <Bell className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay notificaciones</h3>
            <p className="text-zinc-400">
              {filter === 'todas'
                ? 'Recibirás notificaciones cuando haya actualizaciones importantes.'
                : 'No tienes notificaciones sin leer.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotificaciones.map((notification) => {
              const link = getNotificationLink(notification);
              const NotificationWrapper = link ? Link : 'div';
              const wrapperProps = link ? { to: link } : {};

              return (
                <NotificationWrapper
                  key={notification.id}
                  {...wrapperProps}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`block bg-zinc-900 border rounded-2xl p-5 transition-all group ${
                    notification.read
                      ? 'border-[#00F2A6]/10 hover:border-[#00F2A6]/20'
                      : 'border-[#00F2A6]/40 bg-[#00F2A6]/5 hover:border-[#00F2A6]/60'
                  } ${link ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notification.read
                          ? 'bg-black border border-[#00F2A6]/20'
                          : 'bg-gradient-to-br from-[#00F2A6]/20 to-[#0EA5E9]/20 border border-[#00F2A6]/30'
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3
                          className={`font-bold ${
                            notification.read ? 'text-white' : 'text-[#00F2A6]'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#00F2A6] flex-shrink-0 mt-2" />
                        )}
                      </div>

                      <p className="text-zinc-400 text-sm mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {new Date(notification.createdAt).toLocaleString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                          aria-label="Eliminar notificación"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </NotificationWrapper>
              );
            })}
          </div>
        )}

        {/* Info sobre notificaciones push */}
        {notificaciones.length > 0 && (
          <div className="mt-8 bg-zinc-900 border border-[#00F2A6]/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#00F2A6] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Notificaciones en Tiempo Real
                </h4>
                <p className="text-sm text-zinc-400">
                  Las notificaciones se actualizan automáticamente cada 30 segundos. Para recibir
                  notificaciones por email/SMS, configura n8n según la documentación.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
