
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Doğrudan users tablosundan kontrol et
        const { data, error: dbError } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('email', email)
          .eq('password', password) // Basit şifre kontrolü
          .maybeSingle();

        if (dbError) throw dbError;
        if (!data) throw new Error('E-posta veya şifre hatalı.');

        onLoginSuccess(data as UserProfile);
      } else {
        // Yeni kullanıcı kaydı
        if (!fullName) throw new Error('Lütfen adınızı girin.');

        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (existingUser) throw new Error('bu e-posta adresi zaten kullanımda.');

        const { data, error: signUpError } = await supabase
          .from('users')
          .insert({
            email,
            password,
            full_name: fullName,
            role: 'user'
          })
          .select()
          .single();
        
        if (signUpError) throw signUpError;
        
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'İşlem başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 mb-6 transform hover:rotate-6 transition-transform">
            <Sparkles size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Spor<span className="text-indigo-600">Takip</span>
          </h1>
          <p className="text-slate-500 mt-3 font-medium">
            Kendi veritabanınla özgürce takip et.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 p-10 border border-white">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                isLogin ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Giriş
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                !isLogin ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Kayıt
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tam Adınız</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white bg-slate-50 transition-all outline-none font-bold text-slate-700"
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white bg-slate-50 transition-all outline-none font-bold text-slate-700"
                  placeholder="admin@sportakip.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white bg-slate-50 transition-all outline-none font-bold text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs rounded-2xl border border-red-100 font-bold flex items-center gap-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-70 shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Oturum Aç' : 'Hesap Oluştur'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 p-6 bg-white/50 rounded-2xl border border-white text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Varsayılan Giriş</p>
          <div className="flex flex-col gap-1 text-xs font-mono text-indigo-600">
            <span>admin@sportakip.com</span>
            <span>SporTakip123!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
