import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { UserProfile, ActivityLog } from '../types';
import { Trash2, Search, Loader2, Calendar, Target } from 'lucide-react';

interface ActivityLogsProps {
  user: UserProfile | null;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ user }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Join işlemi için alias ekledik: activity_type:activity_types(*)
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, activity_type:activity_types(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.log('Veritabanı hatası:', error);
        setLogs([]);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Kayıt çekme hatası:', error);
      setLogs([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const deleteLog = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('activity_logs').delete().eq('id', id);
    if (!error) fetchLogs();
  };

  const filteredLogs = logs.filter(log => 
    log.activity_type?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Spor Arşivi</h2>
          <p className="text-slate-500 font-medium mt-2">Geçmişteki tüm antrenmanlarını yönet ve analiz et.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Kayıtlar içinde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border-2 border-slate-50 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Veriler Getiriliyor...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="px-10 py-6">Egzersiz</th>
                  <th className="px-10 py-6">Tarih</th>
                  <th className="px-10 py-6">Performans</th>
                  <th className="px-10 py-6">Notlar</th>
                  <th className="px-10 py-6 text-right">Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Target size={20} />
                        </div>
                        <span className="font-black text-slate-900 text-lg">{log.activity_type?.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(log.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl text-base shadow-sm">
                        {log.value} {log.activity_type?.unit}
                      </span>
                    </td>
                    <td className="px-10 py-7 max-w-xs">
                      <p className="text-sm text-slate-400 font-medium italic truncate">{log.notes || '—'}</p>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <button 
                        onClick={() => deleteLog(log.id)}
                        className="p-4 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                        title="Kaydı Sil"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Search size={64} />
                        <p className="font-black text-xl">Aradığınız kayıt bulunamadı.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;