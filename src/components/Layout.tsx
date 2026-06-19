import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, FileText, Wallet, MessageSquare, LayoutDashboard, Settings, Image as ImageIcon, Menu, X, Trash2, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick: (path: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, path, isActive, onClick, ...props }) => (
  <button
    {...props}
    onClick={() => onClick(path)}
    className={cn(
      "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
      isActive 
        ? "bg-teal-primary/10 text-teal-primary font-semibold" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

interface SidebarProps {
  role: 'admin' | 'warga';
  currentPath: string;
}

export const Sidebar = ({ role, currentPath }: SidebarProps) => {
  const navigate = useNavigate();
  const [appName, setAppName] = React.useState(localStorage.getItem('app_name') || 'E-Warga');

  React.useEffect(() => {
    const handler = () => {
      const updatedName = localStorage.getItem('app_name');
      if (updatedName) setAppName(updatedName);
    };
    window.addEventListener('app-settings-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('app-settings-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const adminMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/admin' },
    { icon: User, label: 'Manajemen Warga', path: '/app/admin/warga' },
    { icon: Wallet, label: 'Manajemen Keuangan', path: '/app/admin/finance' },
    { icon: FileText, label: 'Layanan Surat', path: '/app/admin/letters' },
    { icon: Bell, label: 'Pengumuman', path: '/app/admin/announcements' },
    { icon: MessageSquare, label: 'Pengaduan', path: '/app/admin/complaints' },
    { icon: Settings, label: 'Pengaturan', path: '/app/admin/settings' },
  ];

  const wargaMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/warga' },
    { icon: User, label: 'Profil Saya', path: '/app/warga/profile' },
    { icon: Bell, label: 'Info & Agenda', path: '/app/warga/agenda' },
    { icon: FileText, label: 'Pengajuan Surat', path: '/app/warga/letters' },
    { icon: Wallet, label: 'Info Kas & Iuran', path: '/app/warga/finance' },
    { icon: MessageSquare, label: 'Aspirasi/Pengaduan', path: '/app/warga/complaints' },
  ];

  const menu = role === 'admin' ? adminMenu : wargaMenu;

  return (
    <aside className="w-64 bg-navy h-screen fixed left-0 top-0 text-white flex flex-col p-4 z-40">
      <div className="flex items-center space-x-2 px-2 mb-8 mt-4">
        <div className="w-8 h-8 bg-teal-primary rounded-lg flex items-center justify-center font-bold text-white uppercase">
          {appName[0]}
        </div>
        <h1 className="text-xl font-bold tracking-tight">{appName}</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menu.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={currentPath === item.path}
            onClick={(path) => navigate(path)}
          />
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-800">
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Support
        </div>
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-not-allowed opacity-50">
          <MessageSquare size={18} />
          <span>Bantuan</span>
        </button>
      </div>
    </aside>
  );
};

export const Topbar = ({ profile }: { profile: any }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('user_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', title: 'Pengumuman Kerja Bakti', message: 'Kerja bakti bulanan warga RT hari Minggu ini pukul 07.00 WIB. Harap hadir ya!', time: '5 Mnt yang lalu', read: false, type: 'info' },
      { id: '2', title: 'Tagihan Iuran Kas Baru', message: 'Tagihan iuran kas & kebersihan periode Juni 2026 telah diterbitkan.', time: '2 Jam yang lalu', read: false, type: 'finance' },
      { id: '3', title: 'Laporan Pengaduan Selesai', message: 'Pengaduan mengenai "Lampu jalan komplek mati" telah diselesaikan oleh Admin.', time: '1 Hari yang lalu', read: true, type: 'complaint' }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('user_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleLogout = async () => {
    localStorage.removeItem('demo_role');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center">
        <span className="text-slate-500 font-medium">Selamat Datang, </span>
        <span className="ml-1 font-bold text-navy">{profile?.full_name || 'User'}</span>
        <span className="ml-2 px-2 py-0.5 bg-teal-primary/10 text-teal-primary text-[10px] font-bold uppercase rounded-full">
          {profile?.role}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-teal-primary transition-colors hover:bg-slate-50 rounded-full relative cursor-pointer"
            title="Notification Bell"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-coral text-white text-[9px] font-extrabold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Transparent Backdrop to Close */}
          {showNotifications && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowNotifications(false)}
            />
          )}

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <Bell size={16} className="text-navy" />
                  <span className="font-bold text-navy text-sm">Notifikasi Kegiatan</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-teal-primary font-bold hover:underline cursor-pointer"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Info size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">Tidak ada notifikasi baru untuk Anda</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 transition-colors relative group hover:bg-slate-50 flex space-x-3 ${!n.read ? 'bg-teal-primary/5' : ''}`}
                      >
                        <div className="mt-0.5">
                          {n.type === 'finance' ? (
                            <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
                              <Wallet size={14} />
                            </div>
                          ) : n.type === 'complaint' ? (
                            <div className="p-1.5 bg-teal-primary/10 text-teal-primary rounded-lg">
                              <MessageSquare size={14} />
                            </div>
                          ) : (
                            <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg">
                              <Info size={14} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-xs font-bold text-navy mb-0.5 flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 bg-coral rounded-full inline-block shrink-0 ml-1.5"></span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-normal mb-1">{n.message}</p>
                          <span className="text-[9px] text-slate-400 font-medium">{n.time}</span>
                        </div>

                        {/* Action buttons inside item */}
                        <div className="absolute right-2 top-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <button 
                              onClick={() => handleMarkAsRead(n.id)}
                              className="p-1 hover:bg-slate-200 rounded text-teal-primary cursor-pointer"
                              title="Tandai dibaca"
                            >
                              <CheckCircle size={12} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteNotification(n.id)}
                            className="p-1 hover:bg-slate-200 rounded text-coral cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-center">
                  <button 
                    onClick={handleClearAll}
                    className="text-[10px] text-slate-400 hover:text-coral font-semibold py-1 px-3 w-full text-center transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Trash2 size={10} />
                    <span>Bersihkan Semua Notifikasi</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-slate-600 hover:text-coral transition-colors font-medium group"
        >
          <span className="hidden sm:inline">Keluar</span>
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};
