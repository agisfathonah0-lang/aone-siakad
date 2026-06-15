import { query, pool } from '../config/database.js';

const plans = [
  {
    id: 'plan-basic',
    name: 'Basic',
    price: 'Rp 149.000/bulan',
    maxStudents: 100,
    maxTenants: 1,
    features: [
      'Manajemen Mahasiswa (max 100)',
      'Manajemen Dosen',
      'Manajemen Prodi',
      'KRS Online',
      'Nilai Online',
      'Absensi',
      'Cetak Dokumen',
      'Landing Page Sederhana',
    ],
    color: 'slate',
    popular: false,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price: 'Rp 599.000/bulan',
    maxStudents: 1000,
    maxTenants: 1,
    features: [
      'Manajemen Mahasiswa (max 1.000)',
      'Manajemen Dosen',
      'Manajemen Prodi',
      'KRS Online',
      'Nilai Online',
      'Absensi',
      'Landing Page Lengkap',
      'PPDB Online',
      'Perwalian',
      'Kalender Akademik',
      'Notifikasi',
      'Laporan Akademik',
      'Integrasi Midtrans',
      'Integrasi PDDIKTI',
    ],
    color: 'blue',
    popular: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    price: 'Rp 1.499.000/bulan',
    maxStudents: 99999,
    maxTenants: 1,
    features: [
      'Manajemen Mahasiswa (Unlimited)',
      'Manajemen Dosen',
      'Manajemen Prodi',
      'KRS Online',
      'Nilai Online',
      'Absensi',
      'Landing Page Lengkap',
      'PPDB Online',
      'Perwalian',
      'Kalender Akademik',
      'Notifikasi',
      'Laporan Akademik',
      'Integrasi Midtrans',
      'Feeder PDDIKTI',
      'Alumni',
      'OJS (Jurnal)',
      'Custom Domain',
      'Prioritas Support 24/7',
    ],
    color: 'purple',
    popular: false,
  },
];

async function main() {
  await query(
    `INSERT INTO public.web_settings (setting_key, setting_value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (setting_key) DO NOTHING`,
    ['subscription_plans', JSON.stringify(plans)]
  );

  // Verify
  const { rows } = await query('SELECT setting_value FROM public.web_settings WHERE setting_key = $1', ['subscription_plans']);
  if (rows.length > 0) {
    const val = rows[0].setting_value;
    console.log('✅ Plans seeded:', JSON.parse(val).length, 'items');
  }
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
