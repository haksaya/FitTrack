import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { UserProfile } from '../types';
import { Users, BarChart3, ShieldCheck, Loader2, UserPlus, ShieldAlert, UserMinus, Search, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  user: UserProfile | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'users'>('stats');
  const [stats, setStats] = useState({ totalUsers: 0, totalLogs: 0 });

  const isAdmin = user?.role === 'admin';

  const fetchAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);

    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*, activity_type:activity_types(name, unit), users:user_id(email, full_name)')
      .order('created_at', { ascending: false });

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!logsError && logs) {
      setAllLogs(logs);
      setStats({
        totalUsers: usersData?.length || 0,
        totalLogs: logs.length
      });
    }

    if (!usersError && usersData) {
      setAllUsers(usersData as UserProfile[]);
    }
    
    setLoading(false);
  };

  const toggleUserRole = async (targetUser: UserProfile) => {
    if (targetUser.id === user?.id) {
      alert("Kendi yetkinizi değiştiremezsiniz!");
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = `${targetUser.email} kullanıcısının rolünü ${newRole === 'admin' ? 'YÖNETİCİ' : 'STANDART KULLANICI'} yapmak istediğinize emin misiniz?`;
    
    if (!confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', targetUser.id);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      fetchAdminData();
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white p-16 rounded-[3rem] shadow-2xl border border-red-50 max-w-lg">
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Erişim Yetkiniz Yok</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Bu sayfa yalnızca sistem yöneticileri içindir. Lütfen yetkili bir hesapla giriş yapın.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-amber-500 text-white rounded-[2rem] shadow-2xl shadow-amber-200">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kontrol Merkezi</h2>
            <p className="text-slate-500 font-medium">Sistem genelindeki performans ve kullanıcı verileri.</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[2rem]">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-10 py-4 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${activeTab === 'stats' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500'}`}
          >
            İstatistikler
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-10 py-4 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500'}`}
          >
            Kullanıcılar
          </button>
        </div>
      </div>

      {activeTab === 'stats' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all duration-300">
              <div className="p-5 bg-blue-50 text-blue-600 rounded-[2rem] group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Sporcu</p>
                <h4 className="text-4xl font-black text-slate-900">{stats.totalUsers}</h4>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all duration-300">
              <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem] group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <BarChart3 size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tüm Kayıtlar</p>
                <h4 className="text-4xl font-black text-slate-900">{stats.totalLogs}</h4>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-2xl tracking-tight">Sistem Akışı</h3>
              <button 
                onClick={fetchAdminData} 
                className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Veriyi Yenile
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="px-10 py-6">Sporcu</th>
                    <th className="px-10 py-6">Aktivite</th>
                    <th className="px-10 py-6">Miktar</th>
                    <th className="px-10 py-6">Zaman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={40} /></td></tr>
                  ) : allLogs.slice(0, 20).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{log.users?.full_name || 'İsimsiz'}</span>
                          <span className="text-xs text-slate-400">{log.users?.email}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-black text-slate-700">{log.activity_type?.name}</td>
                      <td className="px-10 py-6">
                        <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-black">
                          {log.value} {log.activity_type?.unit}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h3 className="font-black text-slate-900 text-2xl tracking-tight">Kullanıcı Yönetimi</h3>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="İsim veya e-posta ile ara..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="px-10 py-6">Kullanıcı Bilgisi</th>
                  <th className="px-10 py-6">Yetki Düzeyi</th>
                  <th className="px-10 py-6">Kayıt Tarihi</th>
                  <th className="px-10 py-6 text-right">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg shadow-sm">
                          {u.full_name?.[0] || u.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{u.full_name || 'İsimsiz Sporcu'}</span>
                          <span className="text-xs text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-2 px-5 py-2 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 shadow-sm">
                          <ShieldAlert size={12} /> Yönetici
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200">
                          Standart
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-slate-400 text-xs font-black">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-10 py-6 text-right">
                      {u.id !== user?.id && (
                        <button 
                          onClick={() => toggleUserRole(u)}
                          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            u.role === 'admin' 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <><UserMinus size={16} /> Yetkiyi Geri Al</>
                          ) : (
                            <><UserPlus size={16} /> Admin Yetkisi Ver</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;