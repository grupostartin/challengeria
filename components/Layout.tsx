import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ideias', label: 'Ideias de Vídeo', icon: Lightbulb },
    { path: '/tarefas', label: 'Kanban Tarefas', icon: CheckSquare },
    { path: '/financeiro', label: 'Financeiro', icon: DollarSign },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/contratos', label: 'Contratos', icon: FileText },
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
            ChallengerIA
          </span>
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
            SYS.VER.2.0.77
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
            <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">ChallengerIA</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full glass-panel z-30 border-b border-slate-800">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium ${isActive(item.path)
                    ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800'
                    : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={20} />
                Sair
              </button>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 z-10 relative">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;