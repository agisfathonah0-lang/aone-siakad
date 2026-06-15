INSERT INTO public.web_settings (setting_key, setting_value, updated_at)
VALUES (
  'subscription_plans',
  '[
    {
      "id": "plan-basic",
      "name": "Basic",
      "price": "Gratis",
      "maxStudents": 50,
      "maxTenants": 1,
      "features": [
        "Manajemen Mahasiswa (max 50)",
        "Manajemen Dosen",
        "Manajemen Prodi",
        "KRS Online",
        "Nilai Online",
        "Absensi",
        "Landing Page Sederhana"
      ],
      "color": "slate",
      "popular": false
    },
    {
      "id": "plan-pro",
      "name": "Pro",
      "price": "Rp 150.000/bulan",
      "maxStudents": 500,
      "maxTenants": 1,
      "features": [
        "Manajemen Mahasiswa (max 500)",
        "Manajemen Dosen",
        "Manajemen Prodi",
        "KRS Online",
        "Nilai Online",
        "Absensi",
        "Landing Page Lengkap",
        "PPDB Online",
        "Perwalian",
        "Kalender Akademik",
        "Notifikasi",
        "Laporan Akademik",
        "Integrasi Midtrans"
      ],
      "color": "blue",
      "popular": true
    },
    {
      "id": "plan-enterprise",
      "name": "Enterprise",
      "price": "Rp 500.000/bulan",
      "maxStudents": 99999,
      "maxTenants": 1,
      "features": [
        "Manajemen Mahasiswa (Unlimited)",
        "Manajemen Dosen",
        "Manajemen Prodi",
        "KRS Online",
        "Nilai Online",
        "Absensi",
        "Landing Page Lengkap",
        "PPDB Online",
        "Perwalian",
        "Kalender Akademik",
        "Notifikasi",
        "Laporan Akademik",
        "Integrasi Midtrans",
        "Alumni",
        "OJS (Jurnal)",
        "Feeder PDDIKTI",
        "Custom Domain",
        "Prioritas Support"
      ],
      "color": "purple",
      "popular": false
    }
  ]'::jsonb,
  NOW()
)
ON CONFLICT (setting_key) DO NOTHING;
