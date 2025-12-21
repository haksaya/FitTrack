
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfile, ActivityType } from '../types';
import { PlusCircle, Info, ChevronRight, Loader2, Zap, Trash2, Edit2, X, Check } from 'lucide-react';

interface NewActivityTypeProps {
  user: UserProfile | null;
  onComplete: () => void;
}

const NewActivityType: React.FC<NewActivityTypeProps> = ({ user, onComplete }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('tekrar');
  const [loading, setLoading] = useState(false);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');

  const quickSuggestions = [
    { name: 'Şınav', unit: 'tekrar' },
    { name: 'Mekik', unit: 'tekrar' },
    { name: 'Barfiks', unit: 'tekrar' },
    { name: 'Dips', unit: 'tekrar' },
    { name: 'Squat', unit: 'tekrar' },
    { name: 'Koşu', unit: 'km' },
    { name: 'Yüzme', unit: 'metre' },
    { name: 'Plank', unit: 'saniye' },
  ];

  useEffect(() => {
    fetchActivityTypes();
  }, [user]);

  const fetchActivityTypes = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('activity_types')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (data) {
      setActivityTypes(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu spor türünü silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase
      .from('activity_types')
      .delete()
      .eq('id', id);
    
    if (!error) {
      fetchActivityTypes();
    }
  };

  const startEdit = (activity: ActivityType) => {
    setEditingId(activity.id);
    setEditName(activity.name);
    setEditUnit(activity.unit);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditUnit('');
  };

  const saveEdit = async (id: string) => {
    if (!editName) return;
    
    const { error } = await supabase
      .from('activity_types')
      .update({ name: editName, unit: editUnit })
      .eq('id', id);
    
    if (!error) {
      setEditingId(null);
      fetchActivityTypes();
    }
  };

  const handleSubmit = async (e?: React.FormEvent, customName?: string, customUnit?: string) => {
    if (e) e.preventDefault();
    
    const finalName = customName || name;
    const finalUnit = customUnit || unit;

    if (!finalName || !user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase.from('activity_types').insert({
        user_id: user.id,
        name: finalName,
        unit: finalUnit,
        icon: 'Activity',
        color: '#3b82f6'
      });

      if (!error) {
        setName('');
        setUnit('tekrar');
        fetchActivityTypes();
        if (!customName) {
          // Manuel ekleme yapıldıysa formu sıfırla
        }
      } else {
        alert('Veritabanı hatası: ' + (error.message || 'Bilinmeyen hata. Lütfen setup.sql dosyasını Supabase\'de çalıştırın.'));
      }
    } catch (error: any) {
      alert('Bağlantı hatası: Veritabanı kurulumu yapılmamış olabilir.');
      console.error('Insert hatası:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Spor Tanımla</h2>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Mekik, şınav veya barfiks... Takip etmek istediğin her türlü aktiviteyi buradan tanımlayabilirsin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Manuel Ekleme Formu */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <PlusCircle size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Yeni Spor Ekle</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Aktivite Adı</label>
              <input 
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-5 rounded-3xl border-2 border-slate-50 focus:border-blue-500 focus:bg-white bg-slate-50 outline-none transition-all font-bold text-slate-700 shadow-sm"
                placeholder="Örn: Dağ Tırmanışı"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Birim Seçimi</label>
              <div className="grid grid-cols-3 gap-3">
                {['tekrar', 'km', 'metre', 'dk', 'kalori', 'set'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      unit === u 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-105' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group disabled:opacity-70 uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Kategori Oluştur <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>
        </div>

        {/* Hızlı Öneriler */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Zap size={150} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/10 text-blue-400 rounded-2xl backdrop-blur-md border border-white/10">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black">Hızlı Öneriler</h3>
            </div>
            
            <p className="text-slate-400 text-sm font-medium mb-8">Sıkça kullanılan spor türlerini tek tıkla listene ekleyebilirsin.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion.name}
                  onClick={() => handleSubmit(undefined, suggestion.name, suggestion.unit)}
                  className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                >
                  <div className="text-left">
                    <p className="font-black text-sm">{suggestion.name}</p>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{suggestion.unit}</p>
                  </div>
                  <PlusCircle size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>

            <div className="mt-10 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-4 text-xs font-medium text-blue-200">
              <Info size={20} className="shrink-0 text-blue-400" />
              <p>Bir kategori zaten listenizde varsa tekrar eklenmeyecektir. Listenizi dashboard üzerinden kontrol edebilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tanımlı Sporlar Listesi */}
      {activityTypes.length > 0 && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900">Tanımlı Sporlar</h3>
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black">
              {activityTypes.length} Spor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activityTypes.map((activity) => (
              <div key={activity.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-all group">
                {editingId === activity.id ? (
                  // Düzenleme modu
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-blue-300 focus:border-blue-500 outline-none font-bold text-slate-700"
                      placeholder="Aktivite adı"
                    />
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-blue-300 focus:border-blue-500 outline-none font-bold text-slate-700"
                    >
                      <option value="tekrar">tekrar</option>
                      <option value="km">km</option>
                      <option value="metre">metre</option>
                      <option value="dk">dk</option>
                      <option value="kalori">kalori</option>
                      <option value="set">set</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(activity.id)}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> Kaydet
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} /> İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal görünüm
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 text-lg">{activity.name}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                        {activity.unit}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(activity)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all"
                        title="Düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewActivityType;
