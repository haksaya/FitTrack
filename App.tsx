
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ActivityLogs from './components/ActivityLogs';
import Settings from './components/Settings';
import NewActivityType from './components/NewActivityType';
import AdminPanel from './components/AdminPanel';
import { ViewState, UserProfile } from './types';
import { Loader2 } from 'lucide-react';

// Uygulama doğrudan bu profil ile açılacak (Giriş ekranı atlandı)
const DEFAULT_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@sportakip.com',
  full_name: 'Admin Kullanıcı',
  role: 'admin'
};

const App: React.FC = () => {
  const [user] = useState<UserProfile>(DEFAULT_USER);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklenme simülasyonu
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    if(confirm('Giriş ekranı kaldırıldı. Sayfayı yenilemek istiyor musunuz?')) {
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">FitTrack AI Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      user={user} 
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' && <Dashboard user={user} />}
      {currentView === 'logs' && <ActivityLogs user={user} />}
      {currentView === 'settings' && <Settings user={user} />}
      {currentView === 'new-activity' && <NewActivityType user={user} onComplete={() => setCurrentView('dashboard')} />}
      {currentView === 'admin-panel' && <AdminPanel user={user} />}
    </Layout>
  );
};

export default App;
