import React, { useState, useEffect } from 'react';
import { Card, StatusBadge, Button } from '../components/Shared';
import { MessageSquare, Plus, Loader2, Send, Clock, CheckCircle, MessageCircle, ArrowRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Complaints = ({ role, profile }: { role: string, profile: any }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isResponding, setIsResponding] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    // Load local storage first
    const localData = localStorage.getItem('complaints_data');
    if (localData) {
      setItems(JSON.parse(localData));
      setLoading(false);
    } else {
      // Simulated data
      const mockComplaints = [
        { id: 1, title: 'Lampu Jalan Mati', description: 'Lampu jalan di depan blok C-12 mati sudah 3 hari.', status: 'proses', date: '2024-04-29', author: 'Bpk. Budi', response: 'Sedang dikoordinasikan dengan petugas PLN setempat.' },
        { id: 2, title: 'Sampah Belum Diangkut', description: 'Petugas kebersihan belum mengambil sampah di cluster Sakura.', status: 'selesai', date: '2024-04-25', author: 'Ibu Ratna', response: 'Sudah diangkut pagi ini jam 08:00.' },
        { id: 3, title: 'Aspal Berlubang', description: 'Ada lubang cukup dalam di pintu masuk RT.', status: 'pending', date: '2024-04-30', author: 'Bpk. Andi' },
      ];
      setItems(role === 'admin' ? mockComplaints : mockComplaints.filter((c, idx) => c.author === 'Bpk. Andi' || idx === 0)); // Simulation logic
      localStorage.setItem('complaints_data', JSON.stringify(mockComplaints));
      setLoading(false);
    }
  }, [role]);

  const saveToLocal = (newItems: any[]) => {
    localStorage.setItem('complaints_data', JSON.stringify(newItems));
  };

  const handleUpdateStatus = (id: number, newStatus: string) => {
    const updated = items.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setItems(updated);
    saveToLocal(updated);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (isResponding) {
      const updated = items.map(item => item.id === isResponding ? { ...item, response: responseText, status: item.status === 'pending' ? 'proses' : item.status } : item);
      setItems(updated);
      saveToLocal(updated);
      setIsResponding(null);
      setResponseText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, save to Supabase
    const newItem = {
      id: Date.now(),
      title: newTitle,
      description: newDesc,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      author: profile?.full_name || 'Warga'
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveToLocal(updated);
    setIsAdding(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">{role === 'admin' ? 'Manajemen Pengaduan' : 'Pusat Aspirasi & Pengaduan'}</h2>
          <p className="text-slate-500">Sampaikan keluhan atau aspirasi demi kenyamanan bersama.</p>
        </div>
        {role === 'warga' && (
          <Button onClick={() => setIsAdding(true)} variant="secondary" className="shadow-lg shadow-teal-primary/20">
            <Plus size={20} />
            <span>Buat Pengaduan Baru</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mx-auto text-teal-primary" size={40} />
            </div>
          ) : (
            <>
              {items.map((item) => (
            <div key={item.id}>
              <Card className="p-6 hover:border-teal-primary/30 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge 
                    status={item.status === 'selesai' ? 'success' : item.status === 'proses' ? 'warning' : 'pending'} 
                    label={item.status === 'selesai' ? 'Selesai' : item.status === 'proses' ? 'Diproses' : 'Menunggu'} 
                  />
                  <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-teal-primary transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{item.description}</p>
                
                {item.response && (
                  <div className="mb-4 p-4 bg-slate-50 border-l-4 border-teal-primary rounded-r-xl">
                    <p className="text-[10px] font-bold text-teal-primary uppercase mb-1">Tanggapan Pengurus RT:</p>
                    <p className="text-sm text-slate-600 italic">"{item.response}"</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                      {item.author ? item.author[0] : '?'}
                    </div>
                    <span className="text-xs font-bold text-navy">{item.author || 'Anonim'}</span>
                  </div>
                  {role === 'admin' ? (
                    <div className="flex space-x-2">
                      {item.status === 'pending' && (
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'proses'); }}
                          variant="outline" 
                          className="py-1 px-3 text-[10px] border-amber-400 text-amber-600 hover:bg-amber-50"
                        >
                          Proses
                        </Button>
                      )}
                      {item.status !== 'selesai' && (
                        <Button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'selesai'); }}
                          variant="ghost" 
                          className="py-1 px-3 text-[10px] bg-teal-primary/10 text-teal-primary hover:bg-teal-primary hover:text-white"
                        >
                          Selesai
                        </Button>
                      )}
                      <Button 
                        onClick={(e) => { e.stopPropagation(); setIsResponding(item.id); setResponseText(item.response || ''); }}
                        variant="outline" 
                        className="py-1 px-3 text-[10px]"
                      >
                        Tanggapi
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-teal-primary font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                      <span>{item.response ? 'Lihat Tanggapan' : 'Menunggu Tanggapan'}</span>
                      <ArrowRight size={12} />
                    </div>
                  )}
                </div>
              </Card>
            </div>
              ))}
              
              {items.length === 0 && (
                <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">Belum ada pengaduan yang diajukan.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-teal-primary text-white border-0 shadow-xl shadow-teal-primary/20">
            <h4 className="font-bold mb-2">Alur Pengaduan</h4>
            <div className="space-y-4 mt-6">
              {[
                { icon: Send, title: "Kirim Laporan", desc: "Warga melaporkan kendala lewat aplikasi." },
                { icon: Clock, title: "Verifikasi Admin", desc: "Pengurus RT mengecek kebenaran laporan." },
                { icon: CheckCircle, title: "Tindakan Lanjut", desc: "Laporan diteruskan ke pihak terkait." },
              ].map((step, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <step.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-0.5">{step.title}</p>
                    <p className="text-[10px] text-white/70 leading-tight">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {role === 'admin' && (
            <Card className="p-6">
              <h4 className="font-bold text-navy mb-4">Statistik Laporan</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Tuntas</span>
                  <span className="font-bold text-teal-primary">85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-primary h-full w-[85%]"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">*Data bulan April 2024</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Tambah Pengaduan */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-navy">Buat Pengaduan Baru</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-coral transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Laporan</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none"
                  placeholder="Misal: Perbaikan Jalan, Masalah Air, dll"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Lengkap</label>
                <textarea 
                  required
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none resize-none"
                  placeholder="Ceritakan detail kendala yang Anda alami..."
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <Button type="button" onClick={() => setIsAdding(false)} variant="outline" className="flex-1">Batal</Button>
                <Button type="submit" variant="secondary" className="flex-1 shadow-lg shadow-teal-primary/20">Kirim Laporan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tanggapi (Admin) */}
      {isResponding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-navy">Berikan Tanggapan</h3>
              <button onClick={() => setIsResponding(null)} className="text-slate-400 hover:text-coral transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSendResponse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pesan Tanggapan</label>
                <textarea 
                  required
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none resize-none"
                  placeholder="Ketik jawaban atau instruksi untuk warga..."
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <Button type="button" onClick={() => setIsResponding(null)} variant="outline" className="flex-1">Batal</Button>
                <Button type="submit" variant="secondary" className="flex-1 shadow-lg shadow-teal-primary/20">Kirim Tanggapan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
