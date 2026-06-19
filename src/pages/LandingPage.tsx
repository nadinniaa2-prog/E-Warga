import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Wallet, FileText, ArrowRight, CheckCircle2, Bell } from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage = () => {
  const [appName, setAppName] = React.useState(localStorage.getItem('app_name') || 'E-Warga');
  const [heroImage, setHeroImage] = React.useState(localStorage.getItem('hero_image') || 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1000');

  React.useEffect(() => {
    const handler = () => {
      const updatedAppName = localStorage.getItem('app_name');
      const updatedHeroImage = localStorage.getItem('hero_image');
      
      if (updatedAppName) setAppName(updatedAppName);
      if (updatedHeroImage) setHeroImage(updatedHeroImage);
    };
    
    window.addEventListener('app-settings-updated', handler);
    window.addEventListener('storage', handler); // Also listen for storage events from other tabs
    
    return () => {
      window.removeEventListener('app-settings-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const features = [
    {
      title: "Transparansi Kas",
      description: "Pantau penggunaan keuangan dan iuran RT secara real-time dan terbuka.",
      icon: Wallet
    },
    {
      title: "Administrasi Mudah",
      description: "Ajukan surat pengantar dan dokumen kependudukan langsung dari smartphone.",
      icon: FileText
    },
    {
      title: "Informasi Terpusat",
      description: "Dapatkan pengumuman dan jadwal kegiatan RT tanpa tertinggal informasi.",
      icon: Bell
    }
  ];

  const stats = [
    { label: "Warga Terdaftar", value: "150+" },
    { label: "Surat Diproses", value: "450+" },
    { label: "Kegiatan RT", value: "24+" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-teal-primary rounded-xl flex items-center justify-center font-bold text-white text-xl uppercase">{appName[0]}</div>
          <span className="text-2xl font-bold text-navy">{appName}</span>
        </div>
        <Link 
          to="/login" 
          className="bg-navy text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-primary transition-all shadow-lg hover:shadow-teal-primary/20"
        >
          Masuk ke Portal
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-teal-primary/10 text-teal-primary font-bold text-sm mb-6">
              #ModernisasikanLingkunganmu
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold text-navy leading-tight mb-6">
              Membangun <span className="text-teal-primary">Harmoni</span> Digital di Lingkungan RT.
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
              E-Warga adalah platform pintar untuk mempermudah komunikasi, transparansi keuangan, dan pelayanan warga dalam satu genggaman.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/login" 
                className="bg-teal-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:scale-105 transition-all shadow-xl shadow-teal-primary/20"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight size={20} />
              </Link>
              <button className="border-2 border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                Pelajari Fitur
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src={heroImage} 
                alt="RT Digital"
                className="w-full h-auto min-h-[300px] object-cover"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-coral/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-primary/20 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 lg:gap-32">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-teal-primary/80 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4">Fitur Utama {appName}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Dirancang untuk memudahkan pengurus RT dan memberikan kenyamanan bagi warga dalam berinteraksi.</p>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl group hover:shadow-xl transition-all border border-slate-100">
              <div className="w-14 h-14 bg-teal-primary/10 text-teal-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-primary group-hover:text-white transition-all">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-teal-primary rounded-lg flex items-center justify-center font-bold text-white uppercase">{appName[0]}</div>
            <span className="text-xl font-bold text-navy">{appName}</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 Digital Harmoni RT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
