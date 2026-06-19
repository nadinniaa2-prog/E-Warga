import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Get user profile to determine role safely
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Determine role: if they typed an admin email, they are 'admin'. Any other is 'warga'.
      const isTryingAdmin = email.toLowerCase().includes('admin') || email.toLowerCase() === 'nadinniaa2@gmail.com';
      const determinedRole = (profile && profile.role) ? profile.role : (isTryingAdmin ? 'admin' : 'warga');

      if (determinedRole === 'admin') {
        navigate('/app/admin');
      } else {
        navigate('/app/warga');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa email dan password anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center text-slate-500 hover:text-navy mb-12 group">
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-navy mb-2">Selamat Datang 👋</h1>
            <p className="text-slate-500">Silakan masuk untuk mengakses portal E-Warga Anda.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-coral/10 border border-coral/20 text-coral text-sm font-medium rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-navy mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-11 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all"
                  placeholder="name@mail.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-navy">Password</label>
                <button type="button" className="text-xs font-semibold text-teal-primary hover:underline">Lupa Password?</button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-11 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white py-4 rounded-xl font-bold hover:bg-teal-primary transition-all shadow-lg hover:shadow-teal-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <span>Masuk ke Akun</span>
              )}
            </button>


          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Warga baru? Silakan hubungi <span className="text-navy font-bold">Admin RT</span> untuk pendaftaran akun.
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 gradient-navy-teal opacity-90"></div>
        
        {/* Abstract shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-teal-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-coral/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-white text-3xl mb-8 border border-white/20">E</div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Digitalisasi Pelayanan RT untuk Kehidupan Lebih Mudah.
          </h2>
          <div className="space-y-4">
            {[
              "Akses laporan keuangan transparan",
              "Pengajuan surat keterangan digital",
              "Info kegiatan RT real-time",
              "Salurkan aspirasi & pengaduan cepat"
            ].map((text, i) => (
              <div key={i} className="flex items-center space-x-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-teal-primary/20 flex items-center justify-center text-teal-primary">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
          <div className="text-white/40 text-xs font-medium">© 2024 E-WARGA SYSTEM</div>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-navy bg-slate-800"></div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-navy bg-teal-primary flex items-center justify-center text-[10px] font-bold text-white">+50</div>
          </div>
        </div>
      </div>
    </div>
  );
};
