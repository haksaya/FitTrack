
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { UserProfile } from '../types';
import { PlusCircle, Info, ChevronRight, Loader2, Zap } from 'lucide-react';

interface NewActivityTypeProps {
  user: UserProfile | null;
  onComplete: () => void;
}

const NewActivityType: React.FC<NewActivityTypeProps> = ({ user, onComplete }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('tekrar');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e?: React.FormEvent, customName?: string, customUnit?: string) => {
    if (e) e.preventDefault();
    
    const finalName = customName || name;
    const finalUnit = customUnit || unit;

    if (!finalName || !user) return;

    setLoading(true);
    const { error } = await supabase.from('activity_types').insert({
      user_id: user.id,
      name: finalName,
      unit: finalUnit,
      icon: 'Activity'
    });

    if (!error) {
      onComplete();
    } else {
      alert('Bir hata oluştu. Bu isimde bir kategori zaten olabilir.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Spor Kütüphaneni Genişlet</h2>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Mekik, şınav veya barfiks... Takip etmek istediğin her türlü aktiviteyi buradan tanımlayabilirsin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Manuel Ekleme Formu */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <PlusCircle size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Özel Tanımla</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Aktivite Adı</label>
              <input 
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-5 rounded-3xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white bg-slate-50 outline-none transition-all font-bold text-slate-700 shadow-sm"
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
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md scale-105' 
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
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group disabled:opacity-70 uppercase tracking-widest text-xs"
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
              <div className="p-3 bg-white/10 text-indigo-400 rounded-2xl backdrop-blur-md border border-white/10">
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
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{suggestion.unit}</p>
                  </div>
                  <PlusCircle size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>

            <div className="mt-10 p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex gap-4 text-xs font-medium text-indigo-200">
              <Info size={20} className="shrink-0 text-indigo-400" />
              <p>Bir kategori zaten listenizde varsa tekrar eklenmeyecektir. Listenizi dashboard üzerinden kontrol edebilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewActivityType;
