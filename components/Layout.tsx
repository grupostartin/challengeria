import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  CheckSquare,
  DollarSign,
  Menu,
  X,
  Cpu,
  LogOut,
  Users,
  FileText,
  Store,
  Package,
  User,
  ShoppingCart,
  Calendar,
  MoreVertical,
  Download,
  Layout as LayoutIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { FloatingMenu } from './ui/floating-menu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { appMode, setAppMode } = useApp();
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [swUpdateAvailable, setSwUpdateAvailable] = React.useState(false);
  const [waitingWorker, setWaitingWorker] = React.useState<ServiceWorker | null>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // SW Update logic
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;

        const checkUpdate = (registration: ServiceWorkerRegistration) => {
          if (registration.waiting) {
            setSwUpdateAvailable(true);
            setWaitingWorker(registration.waiting);
          }
        };

        checkUpdate(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdateAvailable(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setSwUpdateAvailable(false);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/agenda', label: 'Agenda', icon: Calendar },
    { path: '/ideias', label: 'Ideias de Vídeo', icon: Lightbulb },
    { path: '/tarefas', label: appMode === 'store' ? 'Tarefas' : 'Kanban Tarefas', icon: CheckSquare },
    ...(appMode === 'store' ? [
      { path: '/estoque', label: 'Estoque', icon: Package },
      { path: '/vendas', label: 'Vendas (PDV)', icon: ShoppingCart }
    ] : []),
    { path: '/financeiro', label: 'Financeiro', icon: DollarSign },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/contratos', label: 'Contratos', icon: FileText },
    { path: '/config-bio', label: 'Página Bio', icon: LayoutIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800/50 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/50 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Cpu className="text-cyan-400" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Startin Clients
          </span>
        </div>

        <div className="px-4 mb-4">
          <button
            onClick={() => setAppMode(appMode === 'user' ? 'store' : 'user')}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-500 border shadow-lg ${appMode === 'store'
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-orange-500/10'
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10 hover:bg-cyan-500/20'
              }`}
          >
            {appMode === 'store' ? (
              <>
                <User size={14} />
                MUDAR PARA MODO USUÁRIO
              </>
            ) : (
              <>
                <Store size={14} className="animate-pulse" />
                MUDAR PARA MODO LOJA
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(item.path)
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <item.icon size={20} className={isActive(item.path) ? "animate-pulse-slow" : ""} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/30"
          >
            <LogOut size={20} />
            Sair
          </button>
          <div className="text-xs text-slate-600 text-center font-mono pt-2">
            SYS.VER.1.0.77 BETA
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Glow effect in background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        </div>

        <header className="md:hidden glass-panel border-b border-slate-800/50 text-white p-4 flex items-center justify-between shadow-lg z-20 relative">
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400" size={20} />
            <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Startin Clients</span>
          </div>
          {swUpdateAvailable ? (
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-pulse"
            >
              <Cpu size={14} className="animate-spin" />
              ATUALIZAR
            </button>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold animate-pulse"
            >
              <Download size={14} />
              INSTALAR
            </button>
          ) : (
            <div className="w-6 h-6"></div>
          )}
        </header>

        {/* Mobile App Mode Indicator */}
        <div className="md:hidden px-4 py-2 glass-panel border-b border-slate-800/50 flex justify-center">
          <button
            onClick={() => setAppMode(appMode === 'user' ? 'store' : 'user')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${appMode === 'store'
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              }`}
          >
            {appMode === 'store' ? (
              <><User size={12} /> MUDAR PARA USUÁRIO</>
            ) : (
              <><Store size={12} /> MUDAR PARA LOJA</>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay removed since we now use the floating bar */}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto md:overflow-auto p-4 md:p-8 z-10 relative pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Floating Bottom Menu for Mobile */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <FloatingMenu
            items={[
              ...navItems.map(item => ({
                icon: (props: any) => <item.icon {...props} />,
                label: item.label,
                active: location.pathname === item.path,
                onClick: () => navigate(item.path)
              })),
              {
                icon: (props: any) => <LogOut {...props} className="text-red-400" />,
                label: "Sair",
                onClick: () => signOut()
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;