import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { 
  ShoppingBag, 
  Briefcase, 
  Wallet, 
  Award, 
  Settings, 
  Search,
  Bell,
  Diamond,
  Menu,
  X,
  QrCode,
  Shield,
  Plus,
  Hammer,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { AbacusBot } from './AbacusBot';
import { useAuth } from '../context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const menuItems = [
  { path: '/app/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { path: '/app/agente-ia', icon: Bot, label: 'Agente IA', badge: 'NEW' },
  { path: '/app/work', icon: Hammer, label: 'Work' },
  { path: '/app/salas', icon: Shield, label: 'Salas Digitales' },
  { path: '/app/aplicaciones', icon: Briefcase, label: 'Aplicaciones' },
  { path: '/app/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/app/notificaciones', icon: Bell, label: 'Notificaciones' },
  { path: '/app/reviews', icon: Award, label: 'Reviews' },
  { path: '/app/qr', icon: QrCode, label: 'QR Center' },
  { path: '/app/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);

  // Track known notification IDs for toast detection
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Fire Abacus-style toast for new notifications
  const fireNotificationToast = useCallback((notification: any) => {
    // Trigger mobile vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // pattern: vibrate-pause-vibrate
    }

    const iconColor = notification.type === 'aplicacion' ? '#00F2A6' 
      : notification.type === 'disputa' ? '#EF4444' 
      : '#0EA5E9';

    toast.custom((t) => (
      <div 
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0A0E1A 0%, #000000 100%)',
          border: `1px solid ${iconColor}30`,
          boxShadow: `0 0 30px ${iconColor}15`,
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Abacus bot icon */}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${iconColor}, #0EA5E9)`,
              }}
            >
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: iconColor }}>
                  Abacus
                </span>
                <span className="text-zinc-600 text-xs">ahora</span>
              </div>
              <p className="text-white font-semibold text-sm leading-snug mb-1">{notification.title}</p>
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{notification.message}</p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-zinc-600 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 ml-[52px]">
            {notification.link && (
              <button
                onClick={() => {
                  toast.dismiss(t);
                  navigate(`/app${notification.link}`);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: `${iconColor}15`,
                  border: `1px solid ${iconColor}30`,
                  color: iconColor,
                }}
              >
                Ver detalle
              </button>
            )}
            <button
              onClick={() => {
                toast.dismiss(t);
                window.dispatchEvent(new CustomEvent('open-abacus', { 
                  detail: { message: `${notification.title}: ${notification.message}` } 
                }));
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:border-[#00F2A6]/30 hover:text-[#00F2A6] transition-all flex items-center gap-1.5"
            >
              <Bot className="w-3 h-3" />
              Pregúntale a Abacus
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-right',
    });
  }, [navigate]);

  // Determine polling interval based on current page
  const getPollingInterval = useCallback(() => {
    const criticalPages = ['/app/work', '/app/salas', '/app/sala/'];
    const isCritical = criticalPages.some(page => location.pathname.startsWith(page));
    return isCritical ? 15000 : 30000; // 15s for critical, 30s otherwise
  }, [location.pathname]);

  // Load wallet data
  useEffect(() => {
    if (user?.id) {
      loadWallet();
      loadNotifications();
      // Poll with adaptive interval
      const pollInterval = getPollingInterval();
      
      // Log interval change in dev mode for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Polling interval: ${pollInterval / 1000}s (${location.pathname})`);
      }
      
      const interval = setInterval(() => {
        loadWallet();
        loadNotifications();
      }, pollInterval);
      return () => clearInterval(interval);
    }
  }, [user, getPollingInterval]);

  const loadWallet = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/wallet/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
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
        setNotifications(data);

        // Detect new notifications for toasts
        if (isFirstLoad.current) {
          // Seed known IDs on first load — no toasts
          data.forEach((n: any) => knownNotificationIds.current.add(n.id));
          isFirstLoad.current = false;
        } else {
          // Subsequent polls — fire toast only for truly new ones
          data.forEach((notification: any) => {
            if (!knownNotificationIds.current.has(notification.id)) {
              knownNotificationIds.current.add(notification.id);
              if (!notification.read) {
                fireNotificationToast(notification);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Extract salaId if on a sala page
  const salaId = location.pathname.includes('/sala/') 
    ? location.pathname.split('/sala/')[1] 
    : undefined;

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[#00F2A6]/10 flex flex-col fixed left-0 top-0 bottom-0 z-40 hidden lg:flex" style={{
        background: 'linear-gradient(180deg, rgba(0,242,166,0.03) 0%, rgba(0,0,0,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        {/* Logo & Brand */}
        <div className="h-20 border-b border-[#00F2A6]/10 flex items-center px-6">
          <Link to="/app" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
              <Logo size={24} className="text-black" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-[#00F2A6] bg-clip-text text-transparent block">PARTTH</span>
              <span className="text-[#00F2A6] text-xs font-semibold uppercase tracking-widest">{userProfile?.userType === 'marca' || user?.user_metadata?.userType === 'marca' ? 'Marca' : 'Socio'}</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00F2A6]/20 to-[#0EA5E9]/20 text-[#00F2A6] border border-[#00F2A6]/30 shadow-[0_0_20px_rgba(0,242,166,0.2)]'
                    : 'text-zinc-400 hover:bg-[#00F2A6]/5 hover:text-white hover:border-[#00F2A6]/10 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00F2A6]/10 to-transparent animate-pulse" />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,242,166,0.5)]' : ''}`} />
                <span className="font-semibold relative z-10">{item.label}</span>
                {(item as any).badge && !isActive && (
                  <span className="ml-auto bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full relative z-10 uppercase tracking-wider">
                    {(item as any).badge}
                  </span>
                )}
                {item.path === '/app/notificaciones' && unreadCount > 0 && (
                  <span className="ml-auto bg-[#00F2A6] text-black text-xs font-bold px-2 py-0.5 rounded-full relative z-10">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          
          {/* CTA Button */}
          {(userProfile?.userType === 'marca' || user?.user_metadata?.userType === 'marca') ? (
            <button
              onClick={() => navigate('/app/crear-oferta')}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Crear Oferta
            </button>
          ) : (
            <button
              onClick={() => navigate('/app/marketplace')}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] text-black font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all group"
            >
              <ShoppingBag className="w-5 h-5" />
              Explorar Ofertas
            </button>
          )}
        </nav>
        
        <div className="p-6 border-t border-[#00F2A6]/10 space-y-4">
          {/* Wallet Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#00F2A6]/30 p-4 group cursor-pointer" onClick={() => navigate('/app/wallet')}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 via-[#0EA5E9]/5 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F2A6]/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                  <Diamond className="w-5 h-5 text-black fill-black" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Balance Total</p>
                  <p className="text-2xl font-bold text-white">
                    {loadingWallet ? (
                      <span className="animate-pulse">---</span>
                    ) : (
                      (wallet?.disponible || 0).toLocaleString('es-ES')
                    )}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#00F2A6]/20">
                <div>
                  <p className="text-xs text-zinc-500">Escrow</p>
                  <p className="text-sm font-semibold text-[#00F2A6]">
                    {wallet?.enEscrow || 0} 💎
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Hold</p>
                  <p className="text-sm font-semibold text-yellow-500">
                    {wallet?.enHold || 0} 💎
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Profile */}
          <Link 
            to="/app/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-[#00F2A6]/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center text-lg font-bold text-black shadow-lg shadow-[#00F2A6]/20">
              {(userProfile?.name || user?.user_metadata?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{userProfile?.name || user?.user_metadata?.name || 'Usuario'}</p>
              <p className="text-xs text-zinc-500">Ver perfil</p>
            </div>
            <Settings className="w-4 h-4 text-zinc-600 group-hover:text-[#00F2A6] transition-colors" />
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="w-72 border-r border-[#00F2A6]/10 flex flex-col fixed left-0 top-0 bottom-0 z-50 lg:hidden" style={{
            background: 'linear-gradient(180deg, rgba(0,242,166,0.03) 0%, rgba(0,0,0,0.98) 100%)',
          }}>
            {/* Same content as desktop sidebar */}
            <div className="h-20 border-b border-[#00F2A6]/10 flex items-center justify-between px-6">
              <Link to="/app" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30">
                  <Logo size={24} className="text-black" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-[#00F2A6] bg-clip-text text-transparent block">PARTH</span>
                  <span className="text-[#00F2A6] text-xs font-semibold uppercase tracking-widest">{userProfile?.userType === 'marca' || user?.user_metadata?.userType === 'marca' ? 'Marca' : 'Socio'}</span>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00F2A6]/20 to-[#0EA5E9]/20 text-[#00F2A6] border border-[#00F2A6]/30 shadow-[0_0_20px_rgba(0,242,166,0.2)]'
                        : 'text-zinc-400 hover:bg-[#00F2A6]/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                    {item.path === '/app/notificaciones' && unreadCount > 0 && (
                      <span className="ml-auto bg-[#00F2A6] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-6 border-t border-[#00F2A6]/10 space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-[#00F2A6]/30 p-4" onClick={() => { navigate('/app/wallet'); setSidebarOpen(false); }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#00F2A6]/10 via-[#0EA5E9]/5 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <Diamond className="w-6 h-6 text-[#00F2A6] fill-current" />
                    <div>
                      <p className="text-xs text-zinc-400 font-semibold">Balance</p>
                      <p className="text-2xl font-bold text-white">
                        {wallet?.disponible || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Top Bar for mobile */}
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden bg-black/95 backdrop-blur-xl border-b border-[#00F2A6]/10">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-white" />
          </button>
          
          <Link to="/app" className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-[#00F2A6] bg-clip-text text-transparent">
            PARTH
          </Link>
          
          <button onClick={() => navigate('/app/notificaciones')} className="relative">
            <Bell className="w-5 h-5 text-zinc-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00F2A6] rounded-full flex items-center justify-center text-black text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Top Bar for desktop */}
      <div className={`hidden lg:block fixed top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-[#00F2A6]/10 transition-all left-72 right-0`}>
        <div className="flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-800 w-96 focus-within:border-[#00F2A6]/30 transition-colors">
            <Search className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar ofertas, socios, salas..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-zinc-600"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/app/notificaciones')}
              className="relative p-2.5 hover:bg-[#00F2A6]/10 rounded-xl transition-colors group"
            >
              <Bell className="w-5 h-5 text-zinc-400 group-hover:text-[#00F2A6] transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#00F2A6] rounded-full flex items-center justify-center text-black text-xs font-bold shadow-lg shadow-[#00F2A6]/50">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => navigate('/app/settings')}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[#00F2A6]/30 hover:shadow-[#00F2A6]/50 transition-all text-lg font-bold text-black"
            >
              {(userProfile?.name || user?.user_metadata?.name || 'U').charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-16">
        <Outlet />
      </main>

      {/* Abacus Bot - Available globally */}
      <AbacusBot userId={user?.id} salaId={salaId} />
    </div>
  );
}