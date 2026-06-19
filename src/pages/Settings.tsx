import React, { useState, useRef } from 'react';
import { Card, Button } from '../components/Shared';
import { Settings as SettingsIcon, User, Bell, Shield, MapPin, Save, Loader2, LogOut, Trash2, ChevronRight, Mail, Phone, CreditCard, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Settings = ({ role, profile }: { role: string, profile: any }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  // Admin RT Info State
  const [rtInfo, setRtInfo] = useState({
    name: localStorage.getItem('rt_name') || 'Harmony Residence RT 05',
    address: localStorage.getItem('rt_address') || 'Jl. Melati No. 12, Cluster Sakura',
    iuranAmount: localStorage.getItem('rt_iuran') || '50000',
    adminEmail: 'admin.rt05@harmony.com',
    appName: localStorage.getItem('app_name') || 'E-Warga',
    heroImage: localStorage.getItem('hero_image') || 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1000'
  });

  // Common Preferences
  const [prefs, setPrefs] = useState({
    pushNotifications: localStorage.getItem('pref_push') !== 'false',
    emailAlerts: localStorage.getItem('pref_email') !== 'false',
    darkMode: false
  });

  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size before processing
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Compress image using canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions for hero image to save space
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use lower quality to ensure it fits in localStorage (5MB limit)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setRtInfo({ ...rtInfo, heroImage: compressedDataUrl });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      // Persist to localStorage
      localStorage.setItem('rt_name', rtInfo.name);
      localStorage.setItem('rt_address', rtInfo.address);
      localStorage.setItem('rt_iuran', rtInfo.iuranAmount);
      localStorage.setItem('app_name', rtInfo.appName);
      localStorage.setItem('hero_image', rtInfo.heroImage);
      localStorage.setItem('pref_push', String(prefs.pushNotifications));
      localStorage.setItem('pref_email', String(prefs.emailAlerts));

      // Dispatch custom event for all components to update
      window.dispatchEvent(new Event('app-settings-updated'));
      
      // Also trigger a storage event for other potential tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'hero_image',
        newValue: rtInfo.heroImage
      }));

      setTimeout(() => {
        setIsSaving(false);
        alert('Pengaturan berhasil disimpan!');
      }, 800);
    } catch (error) {
      console.error('Save error:', error);
      setIsSaving(false);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('Gagal menyimpan: Foto terlalu besar. Silakan gunakan foto dengan resolusi lebih rendah atau link URL.');
      } else {
        alert('Gagal menyimpan pengaturan.');
      }
    }
  };

  const menuItems = [
    { id: 'profile', label: role === 'admin' ? 'Informasi RT' : 'Profil Saya', icon: User },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan Akun', icon: Shield },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight">Pengaturan Sistem</h2>
          <p className="text-slate-500 mt-2 text-sm md:text-base max-w-2xl">
            {role === 'admin' 
              ? 'Konfigurasi identitas RT, besaran iuran, dan preferensi sistem operasional warga.' 
              : 'Perbarui data diri Anda dan atur bagaimana sistem memberikan informasi kepada Anda.'}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="md:col-span-3 space-y-2">
          <Card className="p-2 border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-md">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group",
                    isActive 
                      ? 'bg-teal-primary text-white shadow-lg shadow-teal-primary/20 scale-[1.02]' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
                    )}>
                      <Icon size={18} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {isActive && <motion.div layoutId="active-indicator"><ChevronRight size={16} className="text-white/70" /></motion.div>}
                </button>
              );
            })}
          </Card>

          <button className="w-full flex items-center space-x-3 px-6 py-4 text-coral font-bold hover:bg-coral/5 rounded-2xl transition-all mt-4 text-sm">
            <LogOut size={18} />
            <span>Keluar Sesi</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <Card className="p-8 md:p-10 border-0 shadow-2xl shadow-slate-200/50">
                  <header className="mb-10">
                    <h3 className="text-2xl font-black text-navy tracking-tight">{role === 'admin' ? 'Identitas RT 05' : 'Data Profil Warga'}</h3>
                    <p className="text-slate-400 text-sm mt-1">Pastikan informasi di bawah ini selalu akurat.</p>
                  </header>

                  <div className="space-y-8">
                    {role === 'admin' ? (
                      <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FieldWrapper label="Nama RT / Organisasi" icon={Save}>
                            <input 
                              type="text" 
                              value={rtInfo.name}
                              onChange={(e) => setRtInfo({...rtInfo, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all font-semibold text-navy"
                            />
                          </FieldWrapper>

                          <FieldWrapper label="Nama Aplikasi (Label Sidebar)" icon={SettingsIcon}>
                            <input 
                              type="text" 
                              value={rtInfo.appName}
                              onChange={(e) => setRtInfo({...rtInfo, appName: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all font-semibold text-teal-primary"
                              placeholder="E-Warga"
                            />
                          </FieldWrapper>
                        </div>

                        <FieldWrapper label="Foto Hero (Halaman Utama)" icon={ImageIcon}>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input 
                                type="text" 
                                value={rtInfo.heroImage.startsWith('data:image') ? '[File Gambar Lokal]' : rtInfo.heroImage}
                                onChange={(e) => setRtInfo({...rtInfo, heroImage: e.target.value})}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all font-semibold text-navy text-sm"
                                placeholder="https://images.unsplash.com/..."
                              />
                              <input 
                                type="file" 
                                ref={heroFileInputRef}
                                onChange={handleHeroFileChange}
                                accept="image/*"
                                className="hidden"
                              />
                              <button 
                                onClick={() => heroFileInputRef.current?.click()}
                                className="px-6 py-3.5 bg-white border-2 border-dashed border-slate-200 hover:border-teal-primary hover:text-teal-primary text-slate-500 font-bold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 shrink-0"
                              >
                                <Plus size={14} />
                                <span>Pilih File</span>
                              </button>
                            </div>
                            <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
                              <img src={rtInfo.heroImage} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                                <p className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">Pratinjau Halaman Utama</p>
                              </div>
                            </div>
                          </div>
                        </FieldWrapper>
                        
                        <FieldWrapper label="Alamat Sekretariat" icon={MapPin}>
                          <textarea 
                            rows={3}
                            value={rtInfo.address}
                            onChange={(e) => setRtInfo({...rtInfo, address: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all font-semibold text-navy resize-none"
                          />
                        </FieldWrapper>

                        <div className="grid grid-cols-1 gap-6">
                          <FieldWrapper label="Iuran Bulanan (IDR)" icon={CreditCard}>
                            <input 
                              type="number" 
                              value={rtInfo.iuranAmount}
                              onChange={(e) => setRtInfo({...rtInfo, iuranAmount: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all font-semibold text-navy"
                            />
                          </FieldWrapper>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pb-10 border-b border-slate-100">
                          <div className="relative group">
                            <div className="w-28 h-28 bg-gradient-to-br from-teal-primary to-teal-600 text-white text-4xl font-bold flex items-center justify-center rounded-[2.5rem] shadow-2xl shadow-teal-primary/30 ring-8 ring-slate-50">
                              {profile?.full_name?.[0] || 'W'}
                            </div>
                            <button className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-slate-100 text-teal-primary hover:text-teal-600 transition-colors">
                              <Save size={16} />
                            </button>
                          </div>
                          <div className="text-center sm:text-left">
                            <h4 className="text-3xl font-black text-navy leading-none">{profile?.full_name}</h4>
                            <div className="flex items-center justify-center sm:justify-start space-x-3 mt-3">
                              <div className="flex items-center space-x-1 px-3 py-1 bg-teal-primary/10 text-teal-primary rounded-full text-xs font-bold">
                                <CreditCard size={12} />
                                <span>No. Rumah {profile?.no_rumah}</span>
                              </div>
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Warga Tetap</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <FieldWrapper label="Nomor Induk Kependudukan (NIK)" icon={Shield}>
                            <input type="text" value={profile?.nik} disabled className="w-full bg-slate-100 border border-slate-50 rounded-2xl py-3.5 px-5 text-slate-400 font-bold select-none" />
                          </FieldWrapper>
                          <FieldWrapper label="Nomor WhatsApp Aktif" icon={Phone}>
                            <input type="text" defaultValue={profile?.phone} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all font-semibold" />
                          </FieldWrapper>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card className="p-8 md:p-10 border-0 shadow-2xl shadow-slate-200/50">
                   <header className="mb-10">
                    <h3 className="text-2xl font-black text-navy tracking-tight">Preferensi Notifikasi</h3>
                    <p className="text-slate-400 text-sm mt-1">Atur bagaimana kami menghubungi Anda.</p>
                  </header>
                  
                  <div className="space-y-4">
                    {[
                      { id: 'push', title: 'Aplikasi (Push Notifications)', desc: 'Dapatkan berita mendesak, pengumuman rapat, dan status pengajuan surat secara real-time.', current: prefs.pushNotifications, key: 'pushNotifications' },
                      { id: 'email', title: 'Email Berkala', desc: 'Laporan keuangan bulanan RT dan rangkuman kegiatan akan dikirimkan ke kotak masuk Anda.', current: prefs.emailAlerts, key: 'emailAlerts' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all">
                        <div className="pr-6">
                          <p className="font-extrabold text-navy text-lg">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => setPrefs({...prefs, [item.key as any]: !item.current})}
                          className={cn(
                            "w-16 h-8 rounded-full transition-all duration-500 relative shrink-0",
                            item.current ? 'bg-teal-primary shadow-lg shadow-teal-primary/20' : 'bg-slate-300 shadow-inner'
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 transform",
                            item.current ? 'left-9 rotate-12 scale-110' : 'left-1'
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="p-8 md:p-10 border-0 shadow-2xl shadow-slate-200/50">
                  <header className="mb-10">
                    <h3 className="text-2xl font-black text-navy tracking-tight">Keamanan Akun</h3>
                    <p className="text-slate-400 text-sm mt-1">Gunakan password yang kuat untuk menjaga data Anda.</p>
                  </header>

                  <div className="space-y-6">
                    <div className="space-y-5">
                      <FieldWrapper label="Password Saat Ini" icon={Shield}>
                        <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all" />
                      </FieldWrapper>
                      <FieldWrapper label="Password Baru" icon={Shield}>
                        <input type="password" placeholder="Minimal 8 karakter unik" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-4 focus:ring-teal-primary/10 focus:border-teal-primary transition-all" />
                      </FieldWrapper>
                    </div>
                    
                    <div className="mt-10 p-6 bg-coral/5 rounded-[2.5rem] border border-coral/10">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-coral/10 text-coral rounded-2xl">
                          <Trash2 size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-navy leading-none">Hapus Akun</p>
                          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Tindakan ini permanen. Seluruh data iuran, pengaduan, dan riwayat surat Anda akan dihapus dari server RT 05.
                          </p>
                          <button className="mt-4 px-6 py-2.5 bg-coral text-white rounded-xl text-xs font-bold shadow-lg shadow-coral/20 hover:scale-105 transition-transform active:scale-95">
                            Ya, Hapus Akun Saya
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex justify-end mt-10">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="secondary" 
                  className="w-full md:w-auto md:min-w-[240px] py-4 rounded-[2rem] text-lg font-black shadow-2xl shadow-teal-primary/30 transform active:scale-95 transition-all"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Save size={22} />
                      <span>Simpan Perubahan</span>
                    </div>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FieldWrapper = ({ label, children, icon: Icon }: { label: string, children: React.ReactNode, icon: any }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2 ml-1">
      <Icon size={12} className="text-slate-400" />
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">{label}</label>
    </div>
    {children}
  </div>
);

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(' ');
}

