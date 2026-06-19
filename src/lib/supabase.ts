import { createClient } from '@supabase/supabase-js';

// These will be configured by the user in the secrets panel
// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

class HybridSupabaseClient {
  auth = {
    signInWithPassword: async ({ email, password }: any) => {
      // Fast feeling but premium realistic micro-delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const isTryingAdmin = email.toLowerCase().includes('admin') || email.toLowerCase() === 'nadinniaa2@gmail.com';
      
      if (isTryingAdmin && !isMock && realSupabase) {
        try {
          const { data, error } = await realSupabase.auth.signInWithPassword({ email, password });
          if (error) {
            throw error;
          }
          const user = data.user;
          // Store locally to mark they are authenticated
          localStorage.setItem('sb-access-token', JSON.stringify({ user, role: 'admin', name: 'RT Admin' }));
          return { data, error: null };
        } catch (err: any) {
          return { data: { user: null }, error: err };
        }
      } else {
        // Residents / default mockup - allow arbitrary credentials
        const role = isTryingAdmin ? 'admin' : 'warga';
        const name = email.split('@')[0];
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        const user = {
          id: role === 'admin' ? 'mock-admin-id-123' : `mock-warga-${Math.random().toString(36).substr(2, 9)}`,
          email: email,
        };
        
        localStorage.setItem('sb-access-token', JSON.stringify({ user, role, name: capitalizedName }));
        return { data: { user }, error: null };
      }
    },
    getUser: async () => {
      const sessionStr = localStorage.getItem('sb-access-token');
      if (!sessionStr) {
        if (!isMock && realSupabase) {
          try {
            return await realSupabase.auth.getUser();
          } catch {
            return { data: { user: null }, error: null };
          }
        }
        return { data: { user: null }, error: null };
      }
      try {
        const session = JSON.parse(sessionStr);
        return { data: { user: session.user }, error: null };
      } catch {
        return { data: { user: null }, error: null };
      }
    },
    signOut: async () => {
      localStorage.removeItem('sb-access-token');
      if (!isMock && realSupabase) {
        try {
          await realSupabase.auth.signOut();
        } catch {}
      }
      return { error: null };
    }
  };

  from(table: string) {
    const sessionStr = localStorage.getItem('sb-access-token');
    let session: any = null;
    if (sessionStr) {
      try {
        session = JSON.parse(sessionStr);
      } catch {}
    }
    const isMockUser = !session || !session.user || String(session.user.id).includes('mock');

    if (!isMock && realSupabase && (!isMockUser || table === 'announcements')) {
      return realSupabase.from(table);
    }

    return {
      select: (columns?: string) => {
        return {
          order: (column: string, options?: any) => {
            let list: any[] = [];
            const key = table === 'profiles' ? 'warga_data' : `${table}_data`;
            const localData = localStorage.getItem(key);
            if (localData) {
              try {
                list = JSON.parse(localData);
              } catch (e) {
                list = [];
              }
            }
            if (list.length === 0 && table === 'profiles') {
              list = [
                { id: '1', full_name: 'Bpk. Ahmad Suherman', type: 'Iuran Sampah', amount: 50000, date: '2024-04-28', status: 'success', nik: '3201234567890001', no_rumah: 'B-14', phone: '08123456789', role: 'warga', email: 'ahmad@mail.com' },
                { id: '2', full_name: 'Ibu Ratna Sari', type: 'Keamanan & Kebersihan', amount: 35000, date: '2024-04-27', status: 'success', nik: '3201234567890002', no_rumah: 'C-03', phone: '08123456781', role: 'warga', email: 'ratna@mail.com' },
                { id: '3', full_name: 'Bpk. Hendra Kurniawan', type: 'Iuran Sosial (Kematian/Sakit)', amount: 20000, date: '2024-04-26', status: 'success', nik: '3201234567890003', no_rumah: 'A-08', phone: '08123456782', role: 'warga', email: 'hendra@mail.com' }
              ];
              localStorage.setItem('warga_data', JSON.stringify(list));
            }
            return Promise.resolve({ data: list, error: null });
          },
          eq: (column: string, value: any) => {
            return {
              single: () => {
                const sessionStrObj = localStorage.getItem('sb-access-token');
                let role = 'warga';
                let name = 'Warga';
                
                if (sessionStrObj) {
                  try {
                    const parsedSession = JSON.parse(sessionStrObj);
                    if (parsedSession.user.id === value) {
                      role = parsedSession.role;
                      name = parsedSession.name || (role === 'admin' ? 'Pak RT' : 'Warga');
                      
                      return Promise.resolve({
                        data: {
                          id: value,
                          full_name: name,
                          nik: role === 'admin' ? '-' : '3201234567890001',
                          no_rumah: role === 'admin' ? '-' : 'B-14',
                          phone: '08123456789',
                          role: role,
                          created_at: new Date().toISOString()
                        },
                        error: null
                      });
                    }
                  } catch (e) {}
                }

                if (value === 'mock-admin-id-123') {
                  role = 'admin';
                  name = 'Pak RT (Admin)';
                }

                const localData = localStorage.getItem('warga_data');
                if (localData) {
                  try {
                    const list = JSON.parse(localData);
                    const found = list.find((item: any) => item.id === value || item.nik === value);
                    if (found) {
                      return Promise.resolve({ data: found, error: null });
                    }
                  } catch {}
                }

                return Promise.resolve({
                  data: null,
                  error: { message: 'Profile not found' }
                });
              }
            };
          }
        };
      },
      insert: (values: any[]) => {
        return {
          select: () => {
            const records = values.map(v => ({
              id: Math.random().toString(36).substr(2, 9),
              ...v,
              created_at: new Date().toISOString()
            }));
            
            const key = table === 'profiles' ? 'warga_data' : `${table}_data`;
            const localData = localStorage.getItem(key);
            let currentList = [];
            if (localData) {
              try { currentList = JSON.parse(localData); } catch (e) {}
            }
            const updatedList = [...records, ...currentList];
            localStorage.setItem(key, JSON.stringify(updatedList));
            
            return Promise.resolve({ data: records, error: null });
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            const key = table === 'profiles' ? 'warga_data' : `${table}_data`;
            const localData = localStorage.getItem(key);
            let currentList = [];
            if (localData) {
              try { currentList = JSON.parse(localData); } catch (e) {}
            }
            const updatedList = currentList.filter((c: any) => c[column] !== value);
            localStorage.setItem(key, JSON.stringify(updatedList));
            return Promise.resolve({ error: null });
          }
        };
      }
    };
  }
}

let realSupabase: any = null;
const isMock = !supabaseUrl || !supabaseUrl.startsWith('https://') || supabaseUrl.includes('placeholder') || supabaseUrl.includes('YOUR_');

if (!isMock) {
  try {
    realSupabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Real Supabase client creation failed, falling back to mock client', err);
  }
}

export const supabase = new HybridSupabaseClient() as any;

export type Role = 'admin' | 'warga';

export interface Profile {
  id: string;
  full_name: string;
  nik: string;
  no_rumah: string;
  phone: string;
  role: Role;
  created_at: string;
}

