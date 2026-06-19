import React, { useState, useEffect } from 'react';
import { Card, StatusBadge, Button } from '../components/Shared';
import { FileText, Plus, Search, Filter, CheckCircle2, XCircle, Clock, Download, X, Loader2, Send, FileCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Letters = ({ role, profile }: { role: string, profile: any }) => {
  const [items, setItems] = useState<any[]>([]);
  const [allLetters, setAllLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: 'Surat Keterangan Domisili',
    reason: '',
  });

  const [filter, setFilter] = useState('all');

  // Load all letters once
  useEffect(() => {
    const localData = localStorage.getItem('letters_data');
    if (localData) {
      setAllLetters(JSON.parse(localData));
    } else {
      const mockLetters = [
        { id: 1, type: 'Surat Keterangan Domisili', applicant: 'Bpk. Hendra', date: '2024-04-29', status: 'pending', reason: 'Persyaratan buka rekening bank' },
        { id: 2, type: 'Surat Pengantar Nikah', applicant: 'Sdr. Rizky', date: '2024-04-28', status: 'approved', reason: 'Pendaftaran ke KUA' },
        { id: 3, type: 'Surat Keterangan Tidak Mampu', applicant: 'Ibu Sumiati', date: '2024-04-25', status: 'rejected', reason: 'Pengajuan beasiswa sekolah' },
      ];
      setAllLetters(mockLetters);
      localStorage.setItem('letters_data', JSON.stringify(mockLetters));
    }
    setLoading(false);
  }, []);

  // Filter letters when dependency updates
  useEffect(() => {
    let filtered = role === 'admin' ? allLetters : allLetters.filter(l => l.applicant === profile.full_name || l.id === 1);
    
    if (filter === 'pending') {
      filtered = filtered.filter(f => f.status === 'pending');
    } else if (filter === 'finished') {
      filtered = filtered.filter(f => f.status === 'approved' || f.status === 'rejected');
    }

    setItems(filtered);
  }, [allLetters, role, profile.full_name, filter]);

  const handleDownload = (type: string) => {
    alert(`Mengunduh versi digital: ${type}. Dokumen PDF sedang disiapkan...`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newItem = {
      id: Date.now(),
      type: formData.type,
      applicant: profile.full_name,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      reason: formData.reason
    };

    setTimeout(() => {
      const updatedList = [newItem, ...allLetters];
      setAllLetters(updatedList);
      localStorage.setItem('letters_data', JSON.stringify(updatedList));
      setIsSubmitting(false);
      setShowAddModal(false);
      setFormData({ type: 'Surat Keterangan Domisili', reason: '' });
    }, 800);
  };

  const handleUpdateStatus = (id: number | string, newStatus: string) => {
    const updatedList = allLetters.map(item => String(item.id) === String(id) ? { ...item, status: newStatus } : item);
    setAllLetters(updatedList);
    localStorage.setItem('letters_data', JSON.stringify(updatedList));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">
            {role === 'admin' ? 'Manajemen Layanan Surat' : 'Pengajuan Surat Online'}
          </h2>
          <p className="text-slate-500">Urus dokumen kependudukan jadi lebih cepat dan transparan.</p>
        </div>
        {role === 'warga' && (
          <Button onClick={() => setShowAddModal(true)} variant="secondary" className="shadow-lg shadow-teal-primary/20">
            <Plus size={20} />
            <span>Ajukan Surat Baru</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari permohonan..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={filter === 'all' ? 'outline' : 'ghost'} 
                  onClick={() => setFilter('all')}
                  className="py-2 text-xs"
                >
                  Semua
                </Button>
                <Button 
                  variant={filter === 'pending' ? 'outline' : 'ghost'} 
                  onClick={() => setFilter('pending')}
                  className="py-2 text-xs"
                >
                  Pending
                </Button>
                <Button 
                  variant={filter === 'finished' ? 'outline' : 'ghost'} 
                  onClick={() => setFilter('finished')}
                  className="py-2 text-xs"
                >
                  Selesai
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Jenis Surat</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pemohon</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">Memuat...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">Belum ada permohonan surat.</td></tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-navy text-sm">{item.type}</p>
                          <p className="text-[10px] text-slate-400 italic">"{item.reason}"</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.applicant}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{item.date}</td>
                        <td className="px-6 py-4">
                          <StatusBadge 
                            status={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'pending'} 
                            label={item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Proses'} 
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {role === 'admin' && item.status === 'pending' ? (
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                className="p-2 bg-teal-primary/10 text-teal-primary rounded-lg hover:bg-teal-primary hover:text-white transition-all shadow-sm"
                                title="Setujui"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                className="p-2 bg-coral/10 text-coral rounded-lg hover:bg-coral hover:text-white transition-all shadow-sm"
                                title="Tolak"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : item.status === 'approved' ? (
                            <button 
                              onClick={() => handleDownload(item.type)}
                              className="text-teal-primary hover:underline flex items-center justify-end space-x-1 ml-auto text-xs font-bold"
                            >
                              <Download size={14} />
                              <span>Unduh Digital</span>
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="font-bold text-navy mb-4 flex items-center space-x-2">
              <FileCheck size={18} className="text-teal-primary" />
              <span>Daftar Layanan</span>
            </h4>
            <ul className="space-y-3">
              {[
                "Keterangan Domisili",
                "Pengantar Nikah (N1-N4)",
                "Keterangan Berkelakuan Baik",
                "Keterangan Tidak Mampu",
                "Pengantar Pembuatan KK/KTP"
              ].map((s, i) => (
                <li key={i} className="text-xs text-slate-500 flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-primary shrink-0"></div>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 bg-navy text-white border-0 shadow-xl shadow-navy/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg"><Clock size={20} /></div>
              <h4 className="font-bold text-sm">Estimasi Waktu</h4>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Permohonan akan diproses oleh Pengurus RT dalam waktu <span className="text-teal-primary font-bold">1x24 jam</span> di hari kerja. 
              Dokumen fisik dapat diambil di kediaman Ketua RT setelah status berubah menjadi <span className="font-bold uppercase">Disetujui</span>.
            </p>
          </Card>
        </div>
      </div>

      {/* Modal Pengajuan */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-navy">Ajukan Surat Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-coral transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Surat</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20"
                >
                  <option>Surat Keterangan Domisili</option>
                  <option>Surat Pengantar Nikah</option>
                  <option>Surat Keterangan Tidak Mampu</option>
                  <option>Surat Pengantar Pembuatan KTP</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alasan Pengajuan / Keterangan</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20 resize-none"
                  placeholder="Contoh: Untuk persyaratan pendaftaran sekolah anak..."
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <Button type="button" onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">Batal</Button>
                <Button disabled={isSubmitting} type="submit" variant="secondary" className="flex-1 shadow-lg shadow-teal-primary/20">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (
                    <div className="flex items-center space-x-2">
                      <Send size={18} />
                      <span>Kirim Permohonan</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
