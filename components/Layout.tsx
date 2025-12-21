
import React, { ReactNode } from 'react';
import { LayoutDashboard, History, Settings, PlusCircle, LogOut, User, ShieldAlert, ChevronRight } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, onLogout }) => {
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'logs', label: 'Spor Geçmişi', icon: <History size={20} /> },
    { id: 'new-activity', label: 'Özel Spor Tanımla', icon: <PlusCircle size={20} /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={20} /> },
  ];

  if (isAdmin) {
    menuItems.splice(3, 0, { 
      id: 'admin-panel', 
      label: 'Admin Paneli', 
      icon: <ShieldAlert size={20} className="text-amber-500" /> 
    });
  }

  const handleLogout = () => {
    if(confirm('Oturumu kapatmak istediğinize emin misiniz?')) {
      onLogout();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-100 shadow-2xl shadow-slate-200/50 relative z-50">
        <div className="p-10 mb-6">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 transform -rotate-3">
              F
            </div>
            FitTrack <span className="text-blue-600">AI</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Menü</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all group ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-100 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                {item.label}
              </div>
              {currentView === item.id && <ChevronRight size={16} className="animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-8">
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white mb-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-blue-500/20 rounded-full"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-[1.2rem] bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <User size={20} className="text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate">{user?.full_name || 'Sporcu'}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate opacity-80">{user?.email}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full relative z-10">
                <ShieldAlert size={10} /> Yönetici
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-sm font-black text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="lg:hidden h-20 flex items-center justify-between px-8 bg-white border-b border-slate-100 shrink-0 shadow-sm relative z-40">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">
            FitTrack <span className="text-blue-600">AI</span>
          </h1>
          <button 
            onClick={() => setView('settings')}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100"
          >
            <User size={22} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 custom-scrollbar bg-slate-50/30">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        <nav className="lg:hidden flex items-center justify-around h-20 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-40 px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${
                currentView === item.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-300'
              }`}
            >
              {item.icon}
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1.5 ${currentView === item.id ? 'opacity-100' : 'opacity-0'}`}>
                •
              </span>
            </button>
          ))}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-16 h-16 text-red-300"
          >
            <LogOut size={20} />
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
