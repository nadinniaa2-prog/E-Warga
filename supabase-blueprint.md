# E-Warga Database Schema

## Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `full_name` (text)
- `nik` (text, unique)
- `no_rumah` (text)
- `phone` (text)
- `role` (text, default: 'warga') - 'admin' or 'warga'
- `created_at` (timestamp)

### finances (Kas RT)
- `id` (uuid, primary key)
- `warga_id` (uuid, references profiles.id)
- `amount` (numeric)
- `type` (text) - 'keamanan', 'kebersihan', 'sosial'
- `description` (text)
- `payment_date` (timestamp)
- `created_by` (uuid, references profiles.id)

### announcements
- `id` (uuid, primary key)
- `title` (text)
- `content` (text)
- `category` (text)
- `image_url` (text)
- `created_at` (timestamp)

### complaints (Pengaduan)
- `id` (uuid, primary key)
- `warga_id` (uuid, references profiles.id)
- `title` (text)
- `description` (text)
- `status` (text) - 'pending', 'proses', 'selesai'
- `created_at` (timestamp)

### letters (Pengajuan Surat)
- `id` (uuid, primary key)
- `warga_id` (uuid, references profiles.id)
- `type` (text) - 'domisili', 'pengantar_nikah', 'lainnya'
- `status` (text) - 'pending', 'approved', 'rejected'
- `reason` (text)
- `request_date` (timestamp)
