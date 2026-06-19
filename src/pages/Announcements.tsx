import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Button, StatusBadge } from '../components/Shared';
import { Bell, Plus, Calendar, Megaphone, Trash2, Edit, X, Save, Loader2, Image as ImageIcon } from 'lucide-react';

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

export const Announcements = ({ role }: { role: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Kegiatan',
    date: new Date().toISOString().split('T')[0]
  });

  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<any | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    category: 'Kegiatan',
    date: ''
  });
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (item: any) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      date: item.date
    });
    setEditImagePreview(item.image || item.image_url);
  };

  useEffect(() => {
    // Load from localStorage first
    const localData = localStorage.getItem('announcements_data');
    if (localData) {
      setItems(JSON.parse(localData));
      setLoading(false);
    }
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data: remoteData, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (remoteData) {
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
        
        const merged = [...mappedData, ...localOnly].map((item: any) => ({
          ...item,
          image: getValidImageUrl(item.image || item.image_url)
        }));
        setItems(merged);
        localStorage.setItem('announcements_data', JSON.stringify(merged));
      }
    } catch (error) {
      console.warn('Supabase fetch announcements failed or table not found, using local storage fallback:', error);
      const localData = localStorage.getItem('announcements_data');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((item: any) => ({
              ...item,
              image: getValidImageUrl(item.image || item.image_url)
            }));
            setItems(sanitized);
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        }
      } else {
        const mockData = [
          { 
            id: '1', 
            title: 'Rapat Rutin Bulanan - Mei 2024', 
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
          },
          { 
            id: '3', 
            title: 'Sosialisasi Bahaya DBD', 
            content: 'Pertemuan dengan Puskesmas setempat untuk edukasi pencegahan nyamuk DBD di lingkungan rumah.', 
            category: 'Informasi', 
            date: '2024-05-18',
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
          }
        ];
        setItems(mockData);
        localStorage.setItem('announcements_data', JSON.stringify(mockData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newItemId = Math.random().toString(36).substr(2, 9);
    const newItem = {
      id: newItemId,
      ...formData,
      image: imagePreview || 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600'
    };

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          title: formData.title,
          content: formData.content,
          category: formData.category,
          image_url: imagePreview || 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600'
        }])
        .select();

      let updatedItems;
      if (error) {
        console.warn('Supabase insert failed, saving locally:', error.message);
        updatedItems = [newItem, ...items];
      } else if (data && data[0]) {
        const r = data[0];
        const addedItem = {
          id: r.id,
          title: r.title,
          content: r.content,
          category: r.category,
          date: r.created_at ? r.created_at.split('T')[0] : formData.date,
          image: r.image_url || 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600'
        };
        updatedItems = [addedItem, ...items];
      } else {
        updatedItems = [newItem, ...items];
      }

      setItems(updatedItems);
      localStorage.setItem('announcements_data', JSON.stringify(updatedItems));
      setShowAdd(false);
      setImagePreview(null);
      setFormData({ title: '', content: '', category: 'Kegiatan', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.warn('Failed to save to database, using local storage fallback:', err);
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      localStorage.setItem('announcements_data', JSON.stringify(updatedItems));
      setShowAdd(false);
      setImagePreview(null);
      setFormData({ title: '', content: '', category: 'Kegiatan', date: new Date().toISOString().split('T')[0] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setImagePreview(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setEditImagePreview(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);

    const updatedItem = {
      ...editingItem,
      ...editFormData,
      image: editImagePreview || 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600'
    };

    try {
      const isUUID = typeof editingItem.id === 'string' && editingItem.id.length > 15;
      
      if (isUUID) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: editFormData.title,
            content: editFormData.content,
            category: editFormData.category,
            image_url: editImagePreview
          })
          .eq('id', editingItem.id);
        
        if (error) console.warn('Supabase update error:', error.message);
      }

      const updatedItems = items.map(item => String(item.id) === String(editingItem.id) ? updatedItem : item);
      setItems(updatedItems);
      localStorage.setItem('announcements_data', JSON.stringify(updatedItems));
    } catch (err) {
      console.warn('Failed to update announcement, using local storage fallback:', err);
      const updatedItems = items.map(item => String(item.id) === String(editingItem.id) ? updatedItem : item);
      setItems(updatedItems);
      localStorage.setItem('announcements_data', JSON.stringify(updatedItems));
    } finally {
      setIsSubmitting(false);
      setEditingItem(null);
      setEditImagePreview(null);
    }
  };

  const handleDelete = (id: any) => {
    setDeleteItemId(id);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsSubmitting(true);
    try {
      const isUUID = typeof deleteItemId === 'string' && deleteItemId.length > 15;
      if (isUUID) {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', deleteItemId);
        
        if (error) console.warn('Supabase delete error:', error.message);
      }
    } catch (err) {
      console.warn('Failed to delete from Supabase, removing locally only:', err);
    }

    const updatedItems = items.filter(i => String(i.id) !== String(deleteItemId));
    setItems(updatedItems);
    localStorage.setItem('announcements_data', JSON.stringify(updatedItems));
    setDeleteItemId(null);
    setIsSubmitting(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">
            {role === 'admin' ? 'Manajemen Pengumuman' : 'Informasi & Agenda RT'}
          </h2>
          <p className="text-slate-500">Tetap terupdate dengan kegiatan dan berita terbaru di lingkungan kita.</p>
        </div>
        {role === 'admin' && (
          <Button onClick={() => setShowAdd(true)} variant="secondary" className="shadow-lg shadow-teal-primary/20">
            <Plus size={20} />
            <span>Buat Pengumuman Baru</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">Belum ada pengumuman tersedia.</div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="flex flex-col h-full group hover:shadow-xl transition-all border border-slate-100 overflow-hidden">
              <div className="h-48 relative overflow-hidden bg-slate-100">
                <img 
                  src={item.image || item.image_url || 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600'} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-navy uppercase tracking-wider shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-teal-primary text-[10px] font-bold uppercase tracking-widest mb-3">
                  <Calendar size={12} className="mr-1" />
                  <span>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                
                <h3 
                  onClick={() => setViewingItem(item)}
                  className="text-lg font-bold text-navy mb-3 group-hover:text-teal-primary transition-colors leading-tight cursor-pointer"
                >
                  {item.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {item.content}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                  <Button 
                    onClick={() => setViewingItem(item)}
                    variant="ghost" 
                    className="text-xs p-0 h-auto hover:bg-transparent text-teal-primary font-bold cursor-pointer"
                  >
                    Baca Selengkapnya
                  </Button>
                  
                  {role === 'admin' && (
                    <div className="flex items-center space-x-1">
                      <button onClick={() => startEdit(item)} className="p-2 text-slate-400 hover:text-navy transition-colors" title="Ubah Pengumuman"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-coral transition-colors" title="Hapus Pengumuman"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Edit */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-primary/10 text-teal-primary rounded-lg"><Megaphone size={20} /></div>
                <h3 className="text-xl font-bold text-navy">Ubah Pengumuman</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-coral transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Pengumuman</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20"
                  placeholder="Misal: Rapat Keamanan RT"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                  <select 
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20"
                  >
                    <option>Kegiatan</option>
                    <option>Rapat</option>
                    <option>Informasi</option>
                    <option>Urgents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Kegiatan</label>
                  <input 
                    type="date" 
                    required
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detail Pengumuman</label>
                <textarea 
                  required
                  rows={4}
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({...editFormData, content: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20 resize-none"
                  placeholder="Ceritakan detail kegiatan atau informasi..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gambar (Opsional)</label>
                <input 
                  type="file" 
                  ref={editFileInputRef}
                  onChange={handleEditImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => editFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative min-h-[100px] flex flex-col items-center justify-center"
                >
                  {editImagePreview ? (
                    <>
                      <img src={editImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                      <div className="relative z-10 flex flex-col items-center">
                        <ImageIcon size={24} className="text-teal-primary mb-1" />
                        <p className="text-[10px] text-teal-primary font-bold">Gambar Terpilih (Klik untuk ganti)</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[10px] text-slate-400">Klik untuk upload foto kegiatan (.jpg, .png)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <Button type="button" onClick={() => setEditingItem(null)} variant="outline" className="flex-1">Batal</Button>
                <Button disabled={isSubmitting} type="submit" variant="secondary" className="flex-1 shadow-lg shadow-teal-primary/20">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (
                    <div className="flex items-center space-x-2">
                      <Save size={18} />
                      <span>Simpan Perubahan</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-primary/10 text-teal-primary rounded-lg"><Megaphone size={20} /></div>
                <h3 className="text-xl font-bold text-navy">Pengumuman Baru</h3>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-coral transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Pengumuman</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20"
                  placeholder="Misal: Rapat Keamanan RT"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20"
                  >
                    <option>Kegiatan</option>
                    <option>Rapat</option>
                    <option>Informasi</option>
                    <option>Urgents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Kegiatan</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detail Pengumuman</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-teal-primary/20 resize-none"
                  placeholder="Ceritakan detail kegiatan atau informasi..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gambar (Opsional)</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative min-h-[100px] flex flex-col items-center justify-center"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                      <div className="relative z-10 flex flex-col items-center">
                        <ImageIcon size={24} className="text-teal-primary mb-1" />
                        <p className="text-[10px] text-teal-primary font-bold">Gambar Terpilih (Klik untuk ganti)</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[10px] text-slate-400">Klik untuk upload foto kegiatan (.jpg, .png)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <Button type="button" onClick={() => setShowAdd(false)} variant="outline" className="flex-1">Batal</Button>
                <Button disabled={isSubmitting} type="submit" variant="secondary" className="flex-1 shadow-lg shadow-teal-primary/20">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (
                    <div className="flex items-center space-x-2">
                      <Save size={18} />
                      <span>Simpan & Sebar</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-coral" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Hapus Pengumuman?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan di sistem.
            </p>
            <div className="flex space-x-3">
              <Button 
                type="button" 
                onClick={() => setDeleteItemId(null)} 
                variant="outline" 
                className="flex-1"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={isSubmitting}
                type="button" 
                variant="danger"
                className="flex-1 shadow-lg shadow-coral/10 py-3"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto animate-infinite" /> : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Pengumuman */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header with image */}
            <div className="h-64 relative bg-slate-100 shrink-0">
              <img 
                src={viewingItem.image || viewingItem.image_url || 'https://images.unsplash.com/photo-1544928147-7972ef55539d?auto=format&fit=crop&q=80&w=600'} 
                alt={viewingItem.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent"></div>
              <button 
                onClick={() => setViewingItem(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
                title="Tutup"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="px-3 py-1 bg-teal-primary text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                  {viewingItem.category}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <div className="flex items-center text-teal-primary text-xs font-bold uppercase tracking-widest mb-3">
                <Calendar size={14} className="mr-1.5 shrink-0" />
                <span>{new Date(viewingItem.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-4 leading-tight">
                {viewingItem.title}
              </h2>

              <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                {viewingItem.content}
              </p>
            </div>

            {/* Footer with Close Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <Button 
                onClick={() => setViewingItem(null)} 
                variant="outline" 
                className="px-6 py-2 rounded-xl text-sm font-semibold cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
