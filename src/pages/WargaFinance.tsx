import React, { useState, useEffect } from 'react';
import { Card, StatusBadge, Button } from '../components/Shared';
import { Wallet, CreditCard, History, Download, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const WargaFinance = ({ profile }: { profile: any }) => {
  const [iuranStatus, setIuranStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data for citizen's bills
    setIuranStatus([
      { period: 'April 2024', amount: 50000, deadline: '2024-04-10', status: 'success', type: 'Iuran Sampah' },
      { period: 'April 2024', amount: 35000, deadline: '2024-04-10', status: 'success', type: 'Keamanan' },
      { period: 'Mei 2024', amount: 50000, deadline: '2024-05-10', status: 'pending', type: 'Iuran Sampah' },
      { period: 'Mei 2024', amount: 35000, deadline: '2024-05-10', status: 'pending', type: 'Keamanan' },
    ]);
    setLoading(false);
  }, []);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy">Info Kas & Iuran</h2>
        <p className="text-slate-500">Pantau riwayat pembayaran dan tagihan iuran rutin Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-navy">Tagihan Iuran Aktif</h3>
              <div className="p-2 bg-coral/10 text-coral rounded-lg"><AlertCircle size={18} /></div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {iuranStatus.filter(i => i.status === 'pending').map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-navy">{item.type} - {item.period}</p>
                      <p className="text-xs text-slate-400">Jatuh tempo: {item.deadline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-coral text-lg">{formatIDR(item.amount)}</p>
                    <p className="text-[10px] font-bold text-coral uppercase">Belum Bayar</p>
                  </div>
                </div>
              ))}
              {iuranStatus.filter(i => i.status === 'pending').length === 0 && (
                <div className="p-12 text-center text-slate-400">Semua iuran sudah lunas. Terima kasih!</div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-navy">Riwayat Pembayaran</h3>
              <History size={18} className="text-slate-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Periode</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {iuranStatus.filter(i => i.status === 'success').map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-navy">{item.period}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{item.type}</td>
                      <td className="px-6 py-4 font-bold text-navy">{formatIDR(item.amount)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 text-teal-primary text-xs font-bold">
                          <CheckCircle2 size={14} />
                          <span>LUNAS</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-navy text-white border-0 shadow-xl shadow-navy/20 p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-primary/20 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-white text-xs border border-white/10">KAS</div>
                <CreditCard size={24} className="text-teal-primary" />
              </div>
              <p className="text-teal-primary/80 font-medium text-xs mb-1">Total Tunai RT Saat Ini</p>
              <p className="text-2xl font-bold mb-4 tracking-wider">Rp 12.450.000</p>
              <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-4">
                <p className="text-[10px] font-medium text-white/40">DIGITAL RT CARD</p>
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-teal-primary/60 border border-navy"></div>
                  <div className="w-5 h-5 rounded-full bg-coral/60 border border-navy"></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-teal-primary/10 text-teal-primary rounded-xl"><Info size={20} /></div>
              <h4 className="font-bold text-navy">Informasi Iuran</h4>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-primary mt-1.5 shrink-0"></div>
                <p className="text-xs text-slate-500 leading-relaxed">Pembayaran dilakukan secara tunai kepada Bendahara RT setiap tanggal <span className="font-bold text-navy">1-10</span> tiap bulannya.</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-primary mt-1.5 shrink-0"></div>
                <p className="text-xs text-slate-500 leading-relaxed">Status tagihan akan diperbarui di dashboard ini maksimal 24 jam setelah pembayaran diterima.</p>
              </li>
            </ul>
            <Button variant="outline" className="w-full mt-8 text-sm py-3">
              <Download size={16} />
              <span>Unduh Rekap Tahunan</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
