
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { UserProfile, ActivityLog, ActivityType } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Flame, TrendingUp, Calendar, Plus, BrainCircuit, Loader2, Target, Award, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  user: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Hem genel hem de kullanıcıya özel tipleri getir
    const { data: typeData } = await supabase
      .from('activity_types')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('name');
    
    const { data: logData } = await supabase
      .from('activity_logs')
      .select('*, activity_type:activity_types(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    setTypes(typeData || []);
    setLogs(logData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const generateAiInsight = async () => {
    if (logs.length === 0) {
      setAiInsight("Henüz veri yok. Birkaç mekik veya şınav kaydı girin, gelişiminizi yorumlayayım!");
      return;
    }
    
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = logs.slice(0, 10).map(l => `${l.date}: ${l.activity_type?.name} - ${l.value} ${l.activity_type?.unit}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Aşağıdaki spor verilerine sahip kullanıcı için motive edici, profesyonel ve kısa bir analiz yap. Özellikle mekik, şınav, barfiks gibi temel egzersizlerdeki sürekliliği ödüllendiren bir dil kullan. (Türkçe, maksimum 2-3 cümle):\n${summary}`,
      });
      
      setAiInsight(response.text || "Gelişim sürecin çok istikrarlı. Hedeflerine her gün bir adım daha yaklaşıyorsun!");
    } catch (e) {
      setAiInsight("Analiz şu an yapılamıyor ancak verilerin harika görünüyor. Antrenmanlara devam!");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId || !value || !user) return;

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const { error } = await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type_id: selectedTypeId,
      value: parseFloat(value),
      date: dateStr,
      notes
    });

    if (!error) {
      setShowLogModal(false);
      setValue('');
      setNotes('');
      fetchData();
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayLogs = logs.filter(l => l.date === todayStr);
    // Filtrelenmiş loglar (aktivite bazında)
    const filteredLogs = selectedActivityFilter === 'all' 
      ? logs 
      : logs.filter(l => l.activity_type_id === selectedActivityFilter);
    
    // Aylık grafik verisi (son 30 gün)
    const monthlyData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLogs = filteredLogs.filter(l => l.date === dateStr);
      const totalValue = dayLogs.reduce((sum, log) => sum + (log.value || 0), 0);
      
      // Her aktivite türü için ayrı değerler
      const dataPoint: any = {
        name: new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        date: dateStr,
        count: dayLogs.length,
        value: totalValue
      };
      
      // Eğer "Tüm Aktiviteler" seçiliyse, her aktivite türü için ayrı sütunlar oluştur
      if (selectedActivityFilter === 'all') {
        types.forEach(type => {
          const typeValue = dayLogs
            .filter(l => l.activity_type_id === type.id)
            .reduce((sum, log) => sum + (log.value || 0), 0);
          dataPoint[type.name] = typeValue;
        });
      }
      
      return dataPoint;
    });

    return { 
      todayCount: todayLogs.length, 
      total: logs.length, 
      monthlyData,
      streak: logs.length > 0 ? Math.min(logs.length, 7) : 0
    };
  }, [logs, selectedActivityFilter, types]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Spor Verileri Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Üst Karşılama */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-blue-50 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <Sparkles size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                Güç Sende, <br /><span className="text-blue-600">{user?.full_name?.split(' ')[0] || 'Sporcu'}!</span> ⚡
              </h2>
              <p className="text-slate-500 mt-6 font-medium text-lg max-w-md leading-relaxed">
                Bugün mekik, şınav veya barfiks... Kendine bir söz verdin ve şimdi tutma zamanı.
              </p>
            </div>
            <button 
              onClick={() => setShowLogModal(true)}
              className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2.5rem] transition-all shadow-2xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-4 group/btn"
            >
              <Plus size={28} className="group-hover/btn:rotate-90 transition-transform" />
              Veri Girişi Yap
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-200 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/10">
                <Flame size={24} className="animate-pulse" />
              </div>
              <span className="font-black uppercase tracking-widest text-[10px] opacity-80">Antrenman Serisi</span>
            </div>
            <h4 className="text-6xl font-black mb-1">{stats.streak}</h4>
            <p className="text-blue-100 font-bold text-sm">Gündür Hedefini Vuruyorsun!</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-2 text-[11px] font-black text-blue-200 uppercase tracking-widest">
            <Target size={14} /> İstikrar Başarı Getirir
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Bugün', val: stats.todayCount, sub: 'Antrenman' },
          { label: 'Toplam', val: stats.total, sub: 'Kayıt' },
          { label: 'Aylık', val: stats.monthlyData.reduce((a, b) => a + b.count, 0), sub: 'Aktivite' }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{s.label}</p>
            <h4 className="text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{s.val}</h4>
            <p className="text-xs font-bold text-slate-400 mt-2">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Aylık Performans Grafiği - Tam Genişlik */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Aylık Performans</h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedActivityFilter}
              onChange={(e) => setSelectedActivityFilter(e.target.value)}
              className="px-6 py-3 bg-slate-50 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-100 outline-none cursor-pointer hover:bg-slate-100 transition-all"
            >
              <option value="all">Tüm Aktiviteler</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-slate-100">
              <Calendar size={14} /> Son 30 Gün
            </div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyData} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                dy={15}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}}
                label={{ value: 'Toplam Değer', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontWeight: 800, fontSize: 11 } }}
              />
              <Tooltip 
                cursor={{fill: 'rgba(37, 99, 235, 0.1)'}}
                contentStyle={{borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px', fontWeight: 900}}
                itemStyle={{color: '#2563eb'}}
                labelStyle={{color: '#1e293b', fontWeight: 900, marginBottom: 8}}
              />
              {selectedActivityFilter === 'all' ? (
                // Tüm aktiviteler için farklı renkli barlar - yan yana
                (() => {
                  // Aktivite türlerini sırala: önce şınav, sonra dumble, sonra diğerleri
                  const sortedTypes = [...types].sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    if (aName.includes('şınav')) return -1;
                    if (bName.includes('şınav')) return 1;
                    if (aName.includes('dumble') || aName.includes('dumbbell')) return -1;
                    if (bName.includes('dumble') || bName.includes('dumbbell')) return 1;
                    return 0;
                  });
                  
                  // Bootstrap renkleri: success, primary, warning, danger, info, secondary
                  const getColor = (typeName: string, index: number) => {
                    const name = typeName.toLowerCase();
                    if (name.includes('şınav')) return '#198754'; // success (yeşil)
                    if (name.includes('dumble') || name.includes('dumbbell')) return '#0d6efd'; // primary (mavi)
                    if (name.includes('plank')) return '#ffc107'; // warning (sarı)
                    if (name.includes('squat')) return '#dc3545'; // danger (kırmızı)
                    const otherColors = ['#0dcaf0', '#6c757d', '#20c997', '#fd7e14', '#6f42c1', '#d63384'];
                    return otherColors[index % otherColors.length];
                  };
                  
                  return sortedTypes.map((type, index) => (
                    <Bar 
                      key={type.id}
                      dataKey={type.name} 
                      fill={getColor(type.name, index)} 
                      radius={[6, 6, 0, 0]}
                      barSize={15}
                    />
                  ));
                })()
              ) : (
                // Tek aktivite için mavi bar
                <Bar dataKey="value" fill="#0d6efd" radius={[12, 12, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Renk Göstergesi - Sadece "Tüm Aktiviteler" seçiliyken göster */}
        {selectedActivityFilter === 'all' && types.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex flex-wrap gap-4 justify-center">
              {(() => {
                // Aktivite türlerini sırala: önce şınav, sonra dumble, sonra diğerleri
                const sortedTypes = [...types].sort((a, b) => {
                  const aName = a.name.toLowerCase();
                  const bName = b.name.toLowerCase();
                  if (aName.includes('şınav')) return -1;
                  if (bName.includes('şınav')) return 1;
                  if (aName.includes('dumble') || aName.includes('dumbbell')) return -1;
                  if (bName.includes('dumble') || bName.includes('dumbbell')) return 1;
                  return 0;
                });
                
                // Bootstrap renkleri: success, primary, warning, danger, info, secondary
                const getColor = (typeName: string, index: number) => {
                  const name = typeName.toLowerCase();
                  if (name.includes('şınav')) return '#198754'; // success (yeşil)
                  if (name.includes('dumble') || name.includes('dumbbell')) return '#0d6efd'; // primary (mavi)
                  if (name.includes('plank')) return '#ffc107'; // warning (sarı)
                  if (name.includes('squat')) return '#dc3545'; // danger (kırmızı)
                  const otherColors = ['#0dcaf0', '#6c757d', '#20c997', '#fd7e14', '#6f42c1', '#d63384'];
                  return otherColors[index % otherColors.length];
                };
                
                return sortedTypes.map((type, index) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-lg"
                      style={{ backgroundColor: getColor(type.name, index) }}
                    />
                    <span className="text-xs font-black text-slate-600">{type.name}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Aylık Aktivite Takvimi */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} Takvimi
            </h3>
            <p className="text-slate-500 font-medium mt-2">Her gün bir adım, büyük bir değişim</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-black text-slate-400">
            <span>Az</span>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map(level => (
                <div 
                  key={level}
                  className="w-5 h-5 rounded-lg"
                  style={{
                    backgroundColor: level === 0 ? '#f1f5f9' : 
                                   level === 1 ? '#bfdbfe' :
                                   level === 2 ? '#60a5fa' :
                                   level === 3 ? '#2563eb' : '#1e40af'
                  }}
                />
              ))}
            </div>
            <span>Çok</span>
          </div>
        </div>
        
        {/* Haftanın günleri */}
        <div className="grid grid-cols-7 gap-3 mb-3">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {(() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Pazartesi = 0
            
            const cells = [];
            
            // Boş hücreler (ayın başlangıcından önceki günler)
            for (let i = 0; i < startDayOfWeek; i++) {
              cells.push(
                <div key={`empty-${i}`} className="aspect-square"></div>
              );
            }
            
            // Ayın günleri
            for (let day = 1; day <= daysInMonth; day++) {
              const d = new Date(year, month, day);
              // Yerel tarih string'i oluştur (UTC saat dilimi farkından kaçınmak için)
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayLogs = logs.filter(l => l.date === dateStr);
              const totalValue = dayLogs.reduce((sum, log) => sum + (log.value || 0), 0);
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              
              // Aktivite seviyesine göre renk
              let bgColor = '#f1f5f9';
              let textColor = '#94a3b8';
              let intensity = 'Aktivite yok';
              if (totalValue > 0) {
                if (totalValue < 50) {
                  bgColor = '#bfdbfe';
                  textColor = '#1e40af';
                  intensity = 'Az aktivite';
                } else if (totalValue < 100) {
                  bgColor = '#60a5fa';
                  textColor = '#ffffff';
                  intensity = 'Orta aktivite';
                } else if (totalValue < 200) {
                  bgColor = '#2563eb';
                  textColor = '#ffffff';
                  intensity = 'Yoğun aktivite';
                } else {
                  bgColor = '#1e40af';
                  textColor = '#ffffff';
                  intensity = 'Çok yoğun!';
                }
              }
              
              cells.push(
                <div
                  key={day}
                  className="group relative aspect-square rounded-2xl transition-all hover:scale-105 hover:shadow-xl cursor-pointer flex items-center justify-center"
                  style={{ backgroundColor: bgColor }}
                >
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse z-10"></div>
                  )}
                  <span 
                    className="text-sm font-black transition-all"
                    style={{ color: textColor }}
                  >
                    {day}
                  </span>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    <div className="font-black mb-1">{d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</div>
                    <div className="text-slate-300">{intensity}</div>
                    {dayLogs.length > 0 && (
                      <div className="text-blue-300 mt-1">{dayLogs.length} aktivite • {totalValue.toFixed(0)} toplam</div>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              );
            }
            
            return cells;
          })()}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-500">
            <Award size={20} className="text-blue-600" />
            <span className="font-bold text-sm">
              {(() => {
                const now = new Date();
                const monthLogs = logs.filter(l => {
                  const logDate = new Date(l.date);
                  return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
                });
                return monthLogs.length;
              })()} aktivite bu ay
            </span>
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            İstikrar = Başarı
          </div>
        </div>
      </div>

      {/* Son Kayıtlar ve AI Gelişim Rehberi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Son Kayıtlar</h3>
          <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {logs.length > 0 ? (
              logs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-2xl transition-all cursor-default">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg leading-none mb-2">{log.activity_type?.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(log.date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600 leading-none mb-1">{log.value}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{log.activity_type?.unit}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 gap-4">
                <Award size={64} className="text-slate-300" />
                <p className="font-black text-slate-400">Henüz bir antrenman<br/>kaydı bulunamadı.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Gelişim Rehberi */}
        <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.35),transparent)]"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-start justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-600/30 group-hover:rotate-12 transition-transform">
                  <BrainCircuit size={40} />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">AI Gelişim Rehberi</h3>
                  <p className="text-slate-400 font-medium mt-1">Verilerin yapay zeka tarafından analiz ediliyor.</p>
                </div>
              </div>
              {!aiInsight && !isAiThinking && (
                <button 
                  onClick={generateAiInsight}
                  className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl"
                >
                  Analizimi Oluştur
                </button>
              )}
            </div>

          {isAiThinking ? (
            <div className="flex items-center gap-6 p-10 bg-white/5 rounded-[2.5rem] border border-white/10 animate-pulse">
              <Loader2 className="animate-spin text-blue-400" size={32} />
              <p className="text-slate-300 font-bold text-lg">Son antrenmanların inceleniyor, sana özel mesaj hazırlanıyor...</p>
            </div>
          ) : aiInsight ? (
            <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">“</div>
              <p className="text-blue-50 text-2xl leading-relaxed font-semibold italic">
                {aiInsight}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 font-bold text-lg ml-6">Sana özel motivasyon ve analiz için yukarıdaki butona tıkla.</p>
)}
          </div>
        </div>
      </div>

      {/* Kayıt Modalı */}
      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl p-14 animate-in zoom-in-95 duration-500 border border-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <h3 className="text-4xl font-black text-slate-900 mb-12 tracking-tighter">Hemen Kaydet</h3>
            <form onSubmit={handleLogSubmit} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Egzersiz Türü</label>
                <select 
                  required
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full px-8 py-6 rounded-[2rem] border-2 border-slate-50 focus:border-blue-500 focus:bg-white bg-slate-50 outline-none transition-all font-black text-slate-700 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="">Aktivite Seçin...</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                  Performans {selectedTypeId && `(${types.find(t => t.id === selectedTypeId)?.unit})`}
                </label>
                <input 
                  type="number"
                  required
                  step="0.1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-8 py-6 rounded-[2rem] border-2 border-slate-50 focus:border-blue-500 focus:bg-white bg-slate-50 outline-none transition-all font-black text-slate-700 shadow-sm text-center text-3xl"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-6 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-[2rem] transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all text-xs uppercase tracking-widest"
                >
                  Kayıt Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
