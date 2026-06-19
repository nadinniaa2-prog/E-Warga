import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, StatusBadge, Button } from '../components/Shared';
import { Wallet, CreditCard, History, Plus, Loader2, TrendingUp, TrendingDown, Calendar, X, Save, Trash2, Search, FileText, Printer } from 'lucide-react';

export const ManageFinance = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState({ total_paid: 0, total_pending: 0, total_warga: 0 });

  // Filter and search states for Report modal
  const [reportSearch, setReportSearch] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('Semua');

  // Modal State for deleting transaction
  const [deleteTxId, setDeleteTxId] = useState<any | null>(null);
  const [deleteTxAmount, setDeleteTxAmount] = useState<number>(0);
  const [deleteTxName, setDeleteTxName] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Iuran Sampah',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Load local storage first
    const localData = localStorage.getItem('iuran_data');
    if (localData) {
      const parsed = JSON.parse(localData);
      setTransactions(parsed.transactions);
      setSummary(parsed.summary);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // For now, if no local storage exists, use defaults
      if (!localStorage.getItem('iuran_data')) {
        const defaultTransactions = [
          { id: 1, name: 'Bpk. Ahmad Suherman', type: 'Iuran Sampah', amount: 50000, date: '2024-04-28', status: 'success' },
          { id: 2, name: 'Ibu Ratna Sari', type: 'Keamanan & Kebersihan', amount: 35000, date: '2024-04-27', status: 'success' },
          { id: 3, name: 'Bpk. Hendra Kurniawan', type: 'Iuran Sosial (Kematian/Sakit)', amount: 20000, date: '2024-04-26', status: 'success' },
        ];
        const defaultSummary = { total_paid: 1250000, total_pending: 450000, total_warga: 45 };
        setTransactions(defaultTransactions);
        setSummary(defaultSummary);
        localStorage.setItem('iuran_data', JSON.stringify({ transactions: defaultTransactions, summary: defaultSummary }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputIuran = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newTransaction = {
        id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        name: formData.name,
        type: formData.type,
        amount: parseInt(formData.amount),
        date: formData.date,
        status: 'success'
      };

      const updatedTransactions = [newTransaction, ...transactions];
      const updatedSummary = {
        ...summary,
        total_paid: summary.total_paid + newTransaction.amount,
        total_pending: Math.max(0, summary.total_pending - newTransaction.amount)
      };

      setTransactions(updatedTransactions);
      setSummary(updatedSummary);
      
      // Persist
      localStorage.setItem('iuran_data', JSON.stringify({ 
        transactions: updatedTransactions, 
        summary: updatedSummary 
      }));

      setShowModal(false);
      setFormData({
        name: '',
        type: 'Iuran Sampah',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      alert('Gagal menginput iuran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteTransaction = () => {
    if (!deleteTxId) return;

    const updatedTransactions = transactions.filter(t => t.id !== deleteTxId);
    const updatedSummary = {
      ...summary,
      total_paid: Math.max(0, summary.total_paid - deleteTxAmount),
      total_pending: summary.total_pending + deleteTxAmount
    };

    setTransactions(updatedTransactions);
    setSummary(updatedSummary);

    localStorage.setItem('iuran_data', JSON.stringify({
      transactions: updatedTransactions,
      summary: updatedSummary
    }));

    setDeleteTxId(null);
    setDeleteTxAmount(0);
    setDeleteTxName('');
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Manajemen Keuangan</h2>
          <p className="text-slate-500">Pantau kas RT dan verifikasi pembayaran iuran warga.</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="secondary" className="shadow-lg shadow-teal-primary/20">
          <Plus size={20} />
          <span>Input Iuran Manual</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-l-teal-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-teal-primary/10 text-teal-primary rounded-xl"><TrendingUp size={20} /></div>
            <StatusBadge status="success" label="Bulan Ini" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Total Kas Masuk</p>
          <p className="text-2xl font-bold text-navy">{formatIDR(summary.total_paid)}</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-coral">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-coral/10 text-coral rounded-xl"><TrendingDown size={20} /></div>
            <StatusBadge status="danger" label="Tunggakan" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Piutang Iuran</p>
          <p className="text-2xl font-bold text-navy">{formatIDR(summary.total_pending)}</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-navy">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-navy/10 text-navy rounded-xl"><Plus size={20} /></div>
            <StatusBadge status="pending" label="Estimasi" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Target Kas RT</p>
          <p className="text-2xl font-bold text-navy">{formatIDR(summary.total_paid + summary.total_pending)}</p>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-navy flex items-center space-x-2">
            <History size={18} className="text-slate-400" />
            <span>Riwayat Transaksi Terbaru</span>
          </h3>
          <button 
            onClick={() => {
              setReportSearch('');
              setReportTypeFilter('Semua');
              setShowReportModal(true);
            }}
            className="text-teal-primary font-bold text-xs hover:underline cursor-pointer bg-teal-primary/5 hover:bg-teal-primary/10 transition-all px-3 py-1.5 rounded-full flex items-center space-x-1"
          >
            <FileText size={14} />
            <span>Lihat Semua Laporan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Warga</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Iuran</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Memuat...</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-navy">{t.name}</p>
                      <p className="text-xs text-slate-400">ID: TR-00{t.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">{t.type}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{t.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-navy">{formatIDR(t.amount)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status="success" label="Lunas" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setDeleteTxId(t.id);
                          setDeleteTxAmount(t.amount);
                          setDeleteTxName(t.name);
                        }}
                        className="p-2 text-coral hover:bg-coral/10 rounded-lg transition-colors inline-flex items-center space-x-1"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-bold hidden md:inline">Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Input Iuran */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-primary/10 text-teal-primary rounded-lg">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-xl font-bold text-navy">Input Iuran Manual</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-coral transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleInputIuran} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Warga</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none transition-all"
                  placeholder="Nama warga pembayar"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe Iuran</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none transition-all"
                  >
                    <option>Iuran Sampah</option>
                    <option>Keamanan & Kebersihan</option>
                    <option>Iuran Sosial (Kematian/Sakit)</option>
                    <option>Iuran Khusus/Agustus-an</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none transition-all"
                    placeholder="Contoh: 50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Bayar</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-teal-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <Button 
                  type="button" 
                  onClick={() => setShowModal(false)}
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
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Simpan Transaksi</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Transaksi */}
      {deleteTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center font-sans">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-coral" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Hapus Catatan Iuran?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Apakah Anda yakin ingin menghapus catatan iuran milik <strong className="text-navy">"{deleteTxName}"</strong> sebesar <strong className="text-navy">{formatIDR(deleteTxAmount)}</strong>?
              Tindakan ini akan mengembalikan nominal ini ke tunggakan warga secara otomatis.
            </p>
            <div className="flex space-x-3">
              <Button 
                type="button" 
                onClick={() => {
                  setDeleteTxId(null);
                  setDeleteTxAmount(0);
                  setDeleteTxName('');
                }} 
                variant="outline" 
                className="flex-1"
              >
                Batal
              </Button>
              <Button 
                onClick={confirmDeleteTransaction}
                type="button" 
                variant="danger"
                className="flex-1 shadow-lg shadow-coral/10 py-3 bg-coral hover:bg-coral/90 text-white"
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Riwayat Transaksi Lengkap */}
      {showReportModal && (() => {
        const getCategoryKey = (type: string) => {
          if (type === 'Iuran Sampah') return 'Iuran Sampah';
          if (type === 'Keamanan' || type === 'Keamanan & Kebersihan') return 'Keamanan & Kebersihan';
          if (type === 'Iuran Sosial' || type === 'Iuran Sosial (Kematian/Sakit)') return 'Iuran Sosial (Kematian/Sakit)';
          if (type === 'Iuran Khusus' || type === 'Iuran Khusus/Agustus-an') return 'Iuran Khusus/Agustus-an';
          return type;
        };

        const filteredTx = transactions.filter(t => {
          const matchesSearch = t.name.toLowerCase().includes(reportSearch.toLowerCase());
          const matchesFilter = reportTypeFilter === 'Semua' || getCategoryKey(t.type) === reportTypeFilter;
          return matchesSearch && matchesFilter;
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-primary/10 text-teal-primary rounded-lg">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy">Riwayat Transaksi Lengkap</h3>
                    <p className="text-xs text-slate-500">Seluruh catatan penerimaan iuran warga yang terdaftar pada kas RT.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReportModal(false)} 
                  className="text-slate-400 hover:text-coral transition-colors p-1 hover:bg-slate-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-6 space-y-4">
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  {/* Search Bar */}
                  <div className="relative flex-1 w-full max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      placeholder="Cari nama warga pembayar..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-10 text-sm focus:ring-2 focus:ring-teal-primary/20 outline-none transition-all placeholder:text-slate-400 font-sans text-navy"
                    />
                  </div>

                  {/* Dropdown Filter */}
                  <div className="w-full sm:w-64">
                    <select
                      value={reportTypeFilter}
                      onChange={(e) => setReportTypeFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-teal-primary/20 outline-none transition-all font-sans text-navy"
                    >
                      <option value="Semua">Semua Kategori Iuran</option>
                      <option value="Iuran Sampah">Iuran Sampah</option>
                      <option value="Keamanan & Kebersihan">Keamanan & Kebersihan</option>
                      <option value="Iuran Sosial (Kematian/Sakit)">Iuran Sosial (Kematian/Sakit)</option>
                      <option value="Iuran Khusus/Agustus-an">Iuran Khusus/Agustus-an</option>
                    </select>
                  </div>
                </div>

                {/* Unified Table View matching dashboard */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Warga</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Iuran</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredTx.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <p className="font-bold text-navy text-sm">{t.name}</p>
                            <p className="text-[10px] text-slate-400">ID: TR-00{t.id}</p>
                          </td>
                          <td className="px-6 py-3">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">
                              {getCategoryKey(t.type)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-slate-500 text-xs">
                            <div className="flex items-center space-x-1">
                              <Calendar size={12} />
                              <span>{t.date}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 font-extrabold text-navy text-sm">
                            {formatIDR(t.amount)}
                          </td>
                          <td className="px-6 py-3">
                            <StatusBadge status="success" label="Lunas" />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => {
                                setDeleteTxId(t.id);
                                setDeleteTxAmount(t.amount);
                                setDeleteTxName(t.name);
                              }}
                              className="p-1.5 text-coral hover:bg-coral/10 rounded-lg transition-colors inline-flex items-center space-x-1"
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={14} />
                              <span className="text-xs font-bold">Hapus</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredTx.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                            Tidak ditemukan hasil yang cocok dengan pencarian Anda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="text-xs text-slate-500 font-medium font-sans">
                  Menampilkan {filteredTx.length} dari {transactions.length} total catatan
                </div>
                <Button 
                  type="button" 
                  onClick={() => setShowReportModal(false)}
                  variant="secondary" 
                  className="py-2.5 px-6 font-bold"
                >
                  Selesai
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
