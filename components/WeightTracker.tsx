
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { UserProfile, WeightLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, TrendingDown, TrendingUp, Plus, Trash2, Calendar, Target, Loader2 } from 'lucide-react';

interface WeightTrackerProps {
  user: UserProfile | null;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({ user }) => {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchWeightLogs = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    setWeightLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeightLogs();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !user) return;

    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight: parseFloat(weight),
      date,
      notes
    });

    if (!error) {
      setShowAddModal(false);
      setWeight('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      fetchWeightLogs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kilo kaydını silmek istediğinize emin misiniz?')) return;

    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchWeightLogs();
    }
  };

  const stats = useMemo(() => {
    if (weightLogs.length === 0) return { current: 0, start: 0, change: 0, trend: 'stable' };

    const sorted = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const current = sorted[sorted.length - 1].weight;
    const start = sorted[0].weight;
    const change = current - start;
    const trend = change < -0.5 ? 'down' : change > 0.5 ? 'up' : 'stable';

    return { current, start, change, trend };
  }, [weightLogs]);

  const chartData = useMemo(() => {
    return [...weightLogs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(log => ({
        date: new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        weight: log.weight,
        fullDate: log.date
      }));
  }, [weightLogs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Kilo Verileri Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Başlık ve Hızlı Ekle */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              <Scale className="text-blue-600" size={40} />
              Kilo Takibi
            </h2>
            <p className="text-slate-500 mt-3 font-medium text-lg">
              Kilonu düzenli takip et, hedefe ulaş! 💪
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] transition-all shadow-2xl shadow-blue-200 active:scale-95 flex items-center gap-3"
          >
            <Plus size={24} />
            Kilo Ekle
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Scale className="text-blue-600" size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Güncel Kilo</p>
          </div>
          <h4 className="text-4xl font-black text-slate-900">{stats.current.toFixed(1)} <span className="text-xl text-slate-400">kg</span></h4>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-2xl">
              <Target className="text-green-600" size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Başlangıç</p>
          </div>
          <h4 className="text-4xl font-black text-slate-900">{stats.start.toFixed(1)} <span className="text-xl text-slate-400">kg</span></h4>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-2xl ${stats.trend === 'down' ? 'bg-green-50' : stats.trend === 'up' ? 'bg-orange-50' : 'bg-slate-50'}`}>
              {stats.trend === 'down' ? (
                <TrendingDown className="text-green-600" size={20} />
              ) : stats.trend === 'up' ? (
                <TrendingUp className="text-orange-600" size={20} />
              ) : (
                <TrendingUp className="text-slate-400" size={20} />
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Değişim</p>
          </div>
          <h4 className={`text-4xl font-black ${stats.trend === 'down' ? 'text-green-600' : stats.trend === 'up' ? 'text-orange-600' : 'text-slate-900'}`}>
            {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)} <span className="text-xl">kg</span>
          </h4>
        </div>
      </div>

      {/* Grafik */}
      {chartData.length > 0 && (
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kilo Grafiği</h3>
            <div className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-slate-100">
              <Calendar size={14} /> {chartData.length} Ölçüm
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  label={{ value: 'Kilo (kg)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontWeight: 800, fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '12px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Kayıt Listesi */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Tüm Kayıtlar</h3>
        {weightLogs.length === 0 ? (
          <div className="text-center py-16">
            <Scale className="mx-auto text-slate-300 mb-4" size={60} />
            <p className="text-slate-400 font-bold text-lg">Henüz kilo kaydı yok</p>
            <p className="text-slate-400 text-sm mt-2">İlk kilonu ekleyerek başla!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weightLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-blue-100 rounded-xl">
                    <Scale className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{log.weight} kg</h4>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                      <Calendar size={14} />
                      {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-slate-400 mt-2 italic">"{log.notes}"</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ekleme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Kilo Ekle</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Kilo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="75.5"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Tarih
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Notlar (Opsiyonel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Bugün kendimi nasıl hissediyorum..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-200"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightTracker;
