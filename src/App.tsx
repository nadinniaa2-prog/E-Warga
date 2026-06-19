import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Sidebar, Topbar } from './components/Layout';
import { ManajemenWarga } from './pages/ManageWarga';
import { ManageFinance } from './pages/ManageFinance';
import { WargaFinance } from './pages/WargaFinance';
import { Complaints } from './pages/Complaints';
import { Letters } from './pages/Letters';
import { Announcements } from './pages/Announcements';
import { Settings } from './pages/Settings';
import { supabase, type Profile, type Role } from './lib/supabase';
import { Loader2, Users, Wallet, FileText, Bell, MessageSquare, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, StatusBadge } from './components/Shared';

// Shell components for simpler features
const getValidImageUrl = (url: any): string => {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600';
  }
  const s = url.trim();
  if (s === '' || s === 'null' || s === 'undefined' || s === '[object Object]') {
    return 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600';
  }
  return s;
};

const Dashboard = ({ profile }: { profile: Profile }) => {
  const isAdmin = profile.role === 'admin';
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalWarga: 154,
    permohonanSurat: 12,
    agendaRT: 3,
    pengaduanAktif: 5
  });

  useEffect(() => {
    const loadAnnouncements = async () => {
      // Load from localStorage first
      const localData = localStorage.getItem('announcements_data');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = parsed.map(item => ({
              ...item,
              image: getValidImageUrl(item.image || item.image_url)
            }));
            setAnnouncements(sanitized.slice(0, 2));
          }
        } catch (err) {
          console.warn('Dashboard failed to parse announcements:', err);
        }
      }

      // Query Supabase for latest announcements and update localStorage & state
      try {
        const { data: remoteData, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && remoteData) {
          const mappedData = remoteData.map((r: any) => ({
            id: r.id,
            title: r.title,
            content: r.content,
            category: r.category,
            date: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            image: getValidImageUrl(r.image_url || r.image)
          }));

          const currentLocal = JSON.parse(localStorage.getItem('announcements_data') || '[]');
          const remoteTitles = new Set(mappedData.map(r => r.title));
          const localOnly = currentLocal.filter((l: any) => !remoteTitles.has(l.title));
          const merged = [...mappedData, ...localOnly].map(item => ({
            ...item,
            image: getValidImageUrl(item.image || item.image_url)
          }));

          localStorage.setItem('announcements_data', JSON.stringify(merged));
          setAnnouncements(merged.slice(0, 2));
        }
      } catch (err) {
        console.warn('Dashboard failed to fetch live announcements:', err);
        if (!localData) {
          const mockData = [
            { 
              id: '1', 
              title: 'Rapat Rutin Bulanan - Mei', 
              content: 'Agenda membahas persiapan lomba kebersihan antar RT dan evaluasi keamanan lingkungan.', 
              category: 'Rapat', 
              date: '2024-05-05',
              image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600'
            },
            { 
              id: '2', 
              title: 'Kerja Bakti Massal', 
              content: 'Diharapkan seluruh warga membawa peralatan kebersihan untuk membersihkan selokan di jalur utama.', 
              category: 'Kegiatan', 
              date: '2024-05-12',
              image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=600'
            }
          ];
          setAnnouncements(mockData);
        }
      }
    };

    const loadStats = async () => {
      // 1. Total Warga count from localstorage or profiles db
      let countWarga = 154;
      try {
        const localWarga = localStorage.getItem('warga_data');
        if (localWarga) {
          const parsed = JSON.parse(localWarga);
          if (Array.isArray(parsed) && parsed.length > 0) {
            countWarga = parsed.length;
          }
        } else {
          const { data } = await supabase.from('profiles').select('id');
          if (data && data.length > 0) {
            countWarga = data.length;
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic warga count:', err);
      }

      // 2. Permohonan Surat
      let countLetters = 12;
      try {
        const localLetters = localStorage.getItem('letters_data');
        const mockLetters = [
          { id: 1, type: 'Surat Keterangan Domisili', applicant: 'Bpk. Hendra', date: '2024-04-29', status: 'pending', reason: 'Persyaratan buka rekening bank' },
          { id: 2, type: 'Surat Pengantar Nikah', applicant: 'Sdr. Rizky', date: '2024-04-28', status: 'approved', reason: 'Pendaftaran ke KUA' },
          { id: 3, type: 'Surat Keterangan Tidak Mampu', applicant: 'Ibu Sumiati', date: '2024-04-25', status: 'rejected', reason: 'Pengajuan beasiswa sekolah' },
        ];
        const lettersList = localLetters ? JSON.parse(localLetters) : mockLetters;
        if (Array.isArray(lettersList)) {
          const userLetters = isAdmin 
            ? lettersList 
            : lettersList.filter(l => l.applicant === profile.full_name || l.id === 1);
          countLetters = userLetters.length;
        }
      } catch (err) {
        console.warn('Failed to load dynamic letters count:', err);
      }

      // 3. Agenda RT
      let countAgenda = 3;
      try {
        const localAnnouncements = localStorage.getItem('announcements_data');
        if (localAnnouncements) {
          const parsed = JSON.parse(localAnnouncements);
          if (Array.isArray(parsed)) {
            countAgenda = parsed.length;
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic agenda count:', err);
      }

      // 4. Pengaduan Aktif (status: pending or proses)
      let countComplaints = isAdmin ? 5 : 0;
      try {
        const localComplaints = localStorage.getItem('complaints_data');
        const mockComplaints = [
          { id: 1, title: 'Lampu Jalan Mati', description: 'Lampu jalan di depan blok C-12 mati sudah 3 hari.', status: 'proses', date: '2024-04-29', author: 'Bpk. Budi', response: 'Sedang dikoordinasikan dengan petugas PLN setempat.' },
          { id: 2, title: 'Sampah Belum Diangkut', description: 'Petugas kebersihan belum mengambil sampah di cluster Sakura.', status: 'selesai', date: '2024-04-25', author: 'Ibu Ratna', response: 'Sudah diangkut pagi ini jam 08:00.' },
          { id: 3, title: 'Aspal Berlubang', description: 'Ada lubang cukup dalam di pintu masuk RT.', status: 'pending', date: '2024-04-30', author: 'Bpk. Andi' },
        ];
        const complaintsList = localComplaints ? JSON.parse(localComplaints) : mockComplaints;
        if (Array.isArray(complaintsList)) {
          const userComplaints = isAdmin 
            ? complaintsList 
            : complaintsList.filter((c, idx) => c.author === profile.full_name || c.author === 'Bpk. Andi' || idx === 0);
          
          const active = userComplaints.filter(c => c.status === 'pending' || c.status === 'proses');
          countComplaints = active.length;
        }
      } catch (err) {
        console.warn('Failed to load dynamic complaints count:', err);
      }

      setStats({
        totalWarga: countWarga,
        permohonanSurat: countLetters,
        agendaRT: countAgenda,
        pengaduanAktif: countComplaints
      });
    };

    loadAnnouncements();
    loadStats();
  }, [profile, isAdmin]);
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy">Ringkasan {isAdmin ? 'Manajemen RT' : 'Warga'}</h2>
        <p className="text-slate-500">Pantau aktivitas terbaru di lingkungan RT Anda.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 group hover:shadow-xl hover:shadow-teal-primary/5 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-teal-primary/10 text-teal-primary rounded-2xl group-hover:bg-teal-primary group-hover:text-white transition-all">
              {isAdmin ? <Users size={24} /> : <Wallet size={24} />}
            </div>
            <span className="flex items-center text-teal-primary text-xs font-bold">
              <TrendingUp size={14} className="mr-1" />
              +12%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">{isAdmin ? 'Total Warga' : 'Status Iuran'}</p>
          <p className="text-2xl font-bold text-navy">{isAdmin ? stats.totalWarga : 'Lunas'}</p>
        </Card>

        <Card className="p-6 group hover:shadow-xl hover:shadow-teal-primary/5 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-navy/10 text-navy rounded-2xl group-hover:bg-navy group-hover:text-white transition-all">
              <FileText size={24} />
            </div>
            <ArrowUpRight size={18} className="text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Permohonan Surat</p>
          <p className="text-2xl font-bold text-navy">{stats.permohonanSurat < 10 ? `0${stats.permohonanSurat}` : stats.permohonanSurat}</p>
        </Card>

        <Card className="p-6 group hover:shadow-xl hover:shadow-teal-primary/5 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Bell size={24} />
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full">BARU</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Agenda RT</p>
          <p className="text-2xl font-bold text-navy">{stats.agendaRT < 10 ? `0${stats.agendaRT}` : stats.agendaRT}</p>
        </Card>

        <Card className="p-6 group hover:shadow-xl hover:shadow-teal-primary/5 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-coral/10 text-coral rounded-2xl group-hover:bg-coral group-hover:text-white transition-all">
              <MessageSquare size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Pengaduan Aktif</p>
          <p className="text-2xl font-bold text-navy">{stats.pengaduanAktif < 10 ? `0${stats.pengaduanAktif}` : stats.pengaduanAktif}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-navy">Pengumuman Terkini</h3>
            <button 
              onClick={() => navigate(isAdmin ? '/app/admin/announcements' : '/app/warga/agenda')}
              className="text-teal-primary text-[11px] font-bold hover:underline cursor-pointer bg-teal-primary/5 hover:bg-teal-primary/10 transition-all px-3 py-1.5 rounded-full"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-4">
            {announcements.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(isAdmin ? '/app/admin/announcements' : '/app/warga/agenda')}
                className="flex space-x-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                  <img src={getValidImageUrl(item.image || item.image_url)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-navy mb-1 text-sm group-hover:text-teal-primary transition-colors truncate">{item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.content}</p>
                  <p className="text-[10px] text-teal-primary font-bold mt-2 tracking-wider uppercase font-mono">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-navy">Aktivitas Terakhir</h3>
            <div className="p-1.5 bg-slate-100 rounded-lg"><TrendingUp size={14} className="text-slate-400" /></div>
          </div>
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
            {[
              { title: "Pembayaran Iuran Diterima", desc: "Bpk. Ahmad S. telah melunasi iuran April", time: "10 menit lalu", color: "bg-teal-primary" },
              { title: "Surat Selesai Diproses", desc: "Surat domisili Ibu Siti Amanah telah disetujui", time: "2 jam lalu", color: "bg-navy" },
              { title: "Pengaduan Baru", desc: "Ada keluhan mengenai lampu jalan blok A", time: "5 jam lalu", color: "bg-coral" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full ${item.color} border-4 border-white shadow-sm`}></div>
                <h4 className="text-sm font-bold text-navy">{item.title}</h4>
                <p className="text-xs text-slate-500 mb-1">{item.desc}</p>
                <p className="text-[10px] text-slate-400 font-medium">{item.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const FeaturePlaceholder = ({ name }: { name: string }) => (
  <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
      <Loader2 size={32} />
    </div>
    <h2 className="text-2xl font-bold text-navy mb-2">{name}</h2>
    <p className="text-slate-500 max-w-md">Halaman ini sedang dalam tahap pengembangan untuk memberikan pengalaman terbaik bagi Anda.</p>
  </div>
);

// Private Route Wrapper
const AppLayout = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Safe dynamic role mapping for unregistered or mock users
        const isTryingAdmin = user.email?.toLowerCase().includes('admin') || user.email?.toLowerCase() === 'nadinniaa2@gmail.com';
        const determinedRole = isTryingAdmin ? 'admin' : 'warga';
        const rawName = user.email?.split('@')[0] || 'Warga';
        const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        setProfile({
          id: user.id,
          full_name: capitalizedName,
          role: determinedRole as Role,
          nik: '-',
          no_rumah: '-',
          phone: '-',
          created_at: new Date().toISOString()
        });
      } else {
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-teal-primary" size={40} />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 transition-all">
      <Sidebar role={profile.role} currentPath={location.pathname} />
      <div className="ml-64 flex flex-col min-h-screen">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {profile.role === 'admin' ? (
              <>
                <Route path="admin" element={<Dashboard profile={profile} />} />
                <Route path="admin/warga" element={<ManajemenWarga />} />
                <Route path="admin/finance" element={<ManageFinance />} />
                <Route path="admin/letters" element={<Letters role="admin" profile={profile} />} />
                <Route path="admin/announcements" element={<Announcements role="admin" />} />
                <Route path="admin/complaints" element={<Complaints role="admin" profile={profile} />} />
                <Route path="admin/settings" element={<Settings role="admin" profile={profile} />} />
                <Route path="*" element={<Navigate to="admin" />} />
              </>
            ) : (
              <>
                <Route path="warga" element={<Dashboard profile={profile} />} />
                <Route path="warga/profile" element={<Settings role="warga" profile={profile} />} />
                <Route path="warga/agenda" element={<Announcements role="warga" />} />
                <Route path="warga/letters" element={<Letters role="warga" profile={profile} />} />
                <Route path="warga/finance" element={<WargaFinance profile={profile} />} />
                <Route path="warga/complaints" element={<Complaints role="warga" profile={profile} />} />
                <Route path="*" element={<Navigate to="warga" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
