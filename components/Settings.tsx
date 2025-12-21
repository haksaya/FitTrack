
import React from 'react';
import { UserProfile } from '../types';
import { User, Shield, Bell, HelpCircle, ChevronRight, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  user: UserProfile | null;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const isAdmin = user?.role === 'admin';

  const sections = [
    { title: 'Hesap Ayarları', items: ['Profil Bilgileri', 'Şifre Değiştir', 'E-posta Tercihleri'], icon: <User size={20} /> },
    { title: 'Güvenlik', items: ['İki Faktörlü Doğrulama', 'Oturum Yönetimi'], icon: <Shield size={20} /> },
    { title: 'Bildirimler', items: ['Günlük Hatırlatıcılar', 'Haftalık Raporlar'], icon: <Bell size={20} /> },
    { title: 'Destek', items: ['Yardım Merkezi', 'Geri Bilgi Gönder'], icon: <HelpCircle size={20} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ayarlar</h2>
        <p className="text-slate-500 font-medium">Uygulama tercihlerini buradan yönetebilirsin.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8 bg-slate-50/50">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            {isAdmin && (
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-xl shadow-lg border-4 border-white">
                <ShieldCheck size={16} />
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user?.full_name || 'Sporcu'}</h3>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                isAdmin ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {isAdmin ? 'Sistem Yöneticisi' : 'Standart Üye'}
              </span>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 bg-emerald-50 border-emerald-200 text-emerald-700">
                Aktif Hesap
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {sections.map((section, idx) => (
            <div key={idx} className="p-8">
              <div className="flex items-center gap-4 mb-6 text-slate-900">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">{section.icon}</div>
                <h4 className="font-black text-lg tracking-tight">{section.title}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {section.items.map((item, itemIdx) => (
                  <button 
                    key={itemIdx} 
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 text-slate-600 text-sm font-bold transition-all group border border-transparent hover:border-slate-100"
                  >
                    {item}
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-black text-red-900 text-xl tracking-tight">Tehlikeli Bölge</h4>
          <p className="text-sm text-red-700 font-medium">Hesabınızı silerseniz tüm verileriniz kalıcı olarak yok edilir.</p>
        </div>
        <button className="px-8 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100">
          Hesabı Kalıcı Olarak Sil
        </button>
      </div>
    </div>
  );
};

export default Settings;
