import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, StatusBadge, Button } from '../components/Shared';
import { Users, Plus, Search, Filter, Mail, Phone, Home, Trash2, Loader2, Save, X } from 'lucide-react';

export const ManajemenWarga = () => {
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State for details and deletion support
  const [selectedWarga, setSelectedWarga] = useState<any | null>(null);
  const [deleteWargaId, setDeleteWargaId] = useState<any | null>(null);
  const [deleteWargaName, setDeleteWargaName] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    nik: '',
    no_rumah: '',
    phone: '',
    email: '', // to create supabase auth user
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    // Try to load from localStorage first for immediate results
    const localWarga = localStorage.getItem('warga_data');
    if (localWarga) {
      setWarga(JSON.parse(localWarga));
    }
    fetchWarga();
  }, []);

  const fetchWarga = async () => {
    setLoading(true);
    try {
      const { data: remoteData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (remoteData) {
        // Merge strategy: Keep all remote data, and add local data that doesn't exist remotely (merged by NIK)
        // This prevents "losing" data that's only in localStorage due to sync delays
        const currentLocal = JSON.parse(localStorage.getItem('warga_data') || '[]');
        const remoteNIKs = new Set(remoteData.map(r => r.nik));
        const localOnly = currentLocal.filter((l: any) => !remoteNIKs.has(l.nik));
        
        const merged = [...remoteData, ...localOnly];
        setWarga(merged);
        localStorage.setItem('warga_data', JSON.stringify(merged));
      }
    } catch (error) {
      console.warn('Supabase fetch failed, strictly using local storage');
    } finally {
      setLoading(false);
    }
  };

  const filteredWarga = warga.filter(item => {
    const searchMatch = 
      item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_rumah?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const roleMatch = filterRole === 'all' || item.role === filterRole;
    
    return searchMatch && roleMatch;
  });

  const handleAddWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validasi sederhana
      if (!formData.full_name || !formData.nik || !formData.no_rumah) {
        throw new Error('Mohon lengkapi data wajib (Nama, NIK, No Rumah)');
      }

      const newWargaObj = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        role: 'warga',
        created_at: new Date().toISOString()
      };

      // Mencoba simpan ke Supabase
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          full_name: formData.full_name,
          nik: formData.nik,
          no_rumah: formData.no_rumah,
          phone: formData.phone,
          role: 'warga'
        }])
        .select();

      let updatedWarga;
      if (error) {
        console.warn('Supabase Error, saving to local storage:', error.message);
        updatedWarga = [newWargaObj, ...warga];
      } else if (data) {
        updatedWarga = [data[0], ...warga];
      } else {
        updatedWarga = [newWargaObj, ...warga];
      }

      setWarga(updatedWarga);
      localStorage.setItem('warga_data', JSON.stringify(updatedWarga));
      
      // Berhasil
      setShowAddModal(false);
      setFormData({ full_name: '', nik: '', no_rumah: '', phone: '', email: '' });
      
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteWarga = async () => {
    if (!deleteWargaId) return;
    setIsSubmitting(true);
    try {
      // Try to delete from Supabase
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteWargaId);

      if (error) console.warn('Supabase delete error:', error.message);

      // Always update local state for better UX
      const updatedWarga = warga.filter(item => item.id !== deleteWargaId);
      setWarga(updatedWarga);
      localStorage.setItem('warga_data', JSON.stringify(updatedWarga));
    } catch (err: any) {
      console.warn('Gagal menghapus dari Supabase, menghapus dari lokal saja:', err);
      const updatedWarga = warga.filter(item => item.id !== deleteWargaId);
      setWarga(updatedWarga);
      localStorage.setItem('warga_data', JSON.stringify(updatedWarga));
    } finally {
      setIsSubmitting(false);
      setDeleteWargaId(null);
      setDeleteWargaName('');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Manajemen Warga</h2>
          <p className="text-slate-500">Kelola data penduduk dan akun akses warga RT.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="secondary" className="shadow-lg shadow-teal-primary/20">
          <Plus size={20} />
          <span>Tambah Warga Baru</span>
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, NIK, atau no rumah..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-primary/20 transition-all font-medium"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-primary/20 transition-all font-medium text-slate-600"
          >
            <option value="all">Semua Peran</option>
            <option value="warga">Warga</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIK</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No. Rumah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && warga.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredWarga.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    {searchTerm ? 'Tidak ada hasil pencarian yang cocok.' : 'Tidak ada data warga tersedia.'}
                  </td>
                </tr>
              ) : (
                filteredWarga.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-navy">{item.full_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{item.nik}</td>
                    <td className="px-6 py-4 text-slate-600">{item.no_rumah}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <a href={`tel:${item.phone}`} className="p-1.5 bg-teal-primary/10 text-teal-primary rounded-lg hover:bg-teal-primary hover:text-white transition-all"><Phone size={14} /></a>
                        <a href={`mailto:${item.email}`} className="p-1.5 bg-navy/10 text-navy rounded-lg hover:bg-navy hover:text-white transition-all"><Mail size={14} /></a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setSelectedWarga(item)}
                          className="p-2 text-teal-primary hover:bg-teal-primary/10 rounded-lg transition-colors flex items-center space-x-1"
                          title="Lihat Detail"
                        >
                          <Users size={18} />
                          <span className="text-xs font-bold hidden lg:inline">Detail</span>
                        </button>
                        <button 
                          onClick={() => {
                            setDeleteWargaId(item.id);
                            setDeleteWargaName(item.full_name);
                          }}
                          className="p-2 text-coral hover:bg-coral/10 rounded-lg transition-colors flex items-center space-x-1"
                          title="Hapus Warga"
                        >
                          <Trash2 size={18} />
                          <span className="text-xs font-bold hidden lg:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Warga */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-navy">Pendaftaran Warga Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-coral transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddWarga} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none"
                    placeholder="Nama sesuai KTP"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NIK</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none"
                    placeholder="16 digit NIK"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. Rumah</label>
                  <input 
                    type="text" 
                    required
                    value={formData.no_rumah}
                    onChange={(e) => setFormData({...formData, no_rumah: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none"
                    placeholder="Contoh: A-12"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor Telepon (WhatsApp)</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none"
                    placeholder="0812xxxxxx"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <Button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button 
                  disabled={isSubmitting}
                  type="submit" 
                  variant="secondary" 
                  className="flex-1 shadow-lg shadow-teal-primary/20"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <span>Simpan Data</span>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Warga */}
      {selectedWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-primary/10 text-teal-primary rounded-lg">
                  <Users size={20} />
                </div>
                <h3 className="text-xl font-bold text-navy">Detail Data Warga</h3>
              </div>
              <button onClick={() => setSelectedWarga(null)} className="text-slate-400 hover:text-coral transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                  <p className="text-base font-bold text-navy">{selectedWarga.full_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NIK (Nomor Induk)</p>
                    <p className="text-sm font-bold text-navy font-mono">{selectedWarga.nik || '-'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">No. Rumah</p>
                    <p className="text-sm font-bold text-navy">{selectedWarga.no_rumah || '-'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Telepon</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">{selectedWarga.phone || '-'}</p>
                      {selectedWarga.phone && (
                        <a 
                          href={`tel:${selectedWarga.phone}`} 
                          className="text-xs font-bold text-teal-primary hover:underline flex items-center space-x-1"
                        >
                          <Phone size={12} />
                          <span>Hubungi</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <hr className="border-slate-200/50" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{selectedWarga.email || '-'}</p>
                      {selectedWarga.email && (
                        <a 
                          href={`mailto:${selectedWarga.email}`} 
                          className="text-xs font-bold text-navy hover:underline flex items-center space-x-1"
                        >
                          <Mail size={12} />
                          <span>Kirim Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Peran</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="capitalize font-bold text-sm text-navy">
                      {selectedWarga.role === 'admin' ? 'Ketua RT (Admin)' : 'Warga'}
                    </div>
                    <StatusBadge status={selectedWarga.role === 'admin' ? 'success' : 'pending'} label={selectedWarga.role === 'admin' ? 'Pengurus/RT' : 'Warga'} />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="button" 
                  onClick={() => setSelectedWarga(null)}
                  variant="outline" 
                  className="w-full py-3"
                >
                  Tutup Detail
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Warga */}
      {deleteWargaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center font-sans">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-coral" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Hapus Data Warga?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Apakah Anda yakin ingin menghapus data warga <strong className="text-navy">"{deleteWargaName}"</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan di dalam sistem.
            </p>
            <div className="flex space-x-3">
              <Button 
                type="button" 
                onClick={() => {
                  setDeleteWargaId(null);
                  setDeleteWargaName('');
                }} 
                variant="outline" 
                className="flex-1"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                onClick={confirmDeleteWarga}
                disabled={isSubmitting}
                type="button" 
                variant="danger"
                className="flex-1 shadow-lg shadow-coral/10 py-3 bg-coral hover:bg-coral/90 text-white"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
