import { pool, query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { runTenantMigrations } from './tenant-migrate.js';

async function seed(): Promise<void> {
  console.log('[SEED] Starting...');

  // ─── Vendor super admin ───
  const vendorPassword = await bcrypt.hash('admin123', 12);
  await query(
    `INSERT INTO public.vendor_users (id, email, password_hash, nama, role)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
    [uuid(), 'admin@aone-project.com', vendorPassword, 'Super Admin', 'super_admin']
  );
  console.log('[SEED] ✅ Vendor admin created (admin@aone-project.com / admin123)');

  // ─── Contoh tenant (development seed) ───
  const tenantId = uuid();
  const slug = 'contoh';
  const schemaName = 'tenant_contoh';

  const { rows: existing } = await query('SELECT id FROM public.tenants WHERE slug = $1', [slug]);
  if (existing.length === 0) {
    await query(
      `INSERT INTO public.tenants (id, slug, schema_name, name, nama_pt, singkatan, paket)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tenantId, slug, schemaName, 'Contoh Universitas', 'Contoh Universitas AONE', 'CONTOH', 'pro']
    );
    console.log('[SEED] ✅ Tenant created');

    await runTenantMigrations(schemaName);

    // Seed tenant admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    await query(
      `INSERT INTO "${schemaName}".users (id, email, password_hash, role, nama)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      [uuid(), 'admin@contoh.ac.id', adminPassword, 'admin', 'Admin Universitas']
    );

    // Seed prodi
    const prodiId = uuid();
    await query(
      `INSERT INTO "${schemaName}".program_studi (id, kode, nama, jenjang, fakultas)
       VALUES ($1, $2, $3, $4, $5)`,
      [prodiId, 'IF', 'Informatika', 'S1', 'Ilmu Komputer']
    );

    // Seed dosen
    const dosenUserId = uuid();
    const dosenPassword = await bcrypt.hash('dosen123', 12);
    await query(
      `INSERT INTO "${schemaName}".users (id, email, password_hash, role, nama, nidn)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [dosenUserId, 'dosen@contoh.ac.id', dosenPassword, 'dosen', 'Dr. Budi Santoso', '1234567890']
    );
    await query(
      `INSERT INTO "${schemaName}".dosen (id, user_id, nidn, nama, program_studi_id, is_dosen_wali)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuid(), dosenUserId, '1234567890', 'Dr. Budi Santoso', prodiId, true]
    );

    // Seed mahasiswa
    const mhsUserId = uuid();
    const mhsPassword = await bcrypt.hash('mhs123', 12);
    await query(
      `INSERT INTO "${schemaName}".users (id, email, password_hash, role, nama, nim)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mhsUserId, 'mahasiswa@contoh.ac.id', mhsPassword, 'mahasiswa', 'Andi Pratama', '20241001']
    );
    await query(
      `INSERT INTO "${schemaName}".mahasiswa (id, user_id, nim, nama, program_studi_id, angkatan, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuid(), mhsUserId, '20241001', 'Andi Pratama', prodiId, 2024, 2]
    );

    // Seed MK
    const mkId = uuid();
    await query(
      `INSERT INTO "${schemaName}".mata_kuliah (id, kode, nama, sks, semester, program_studi_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mkId, 'IF101', 'Algoritma Pemrograman', 4, 1, prodiId]
    );

    console.log('[SEED] ✅ Tenant data seeded');
    console.log('[SEED]    Admin: admin@contoh.ac.id / admin123');
    console.log('[SEED]    Dosen: dosen@contoh.ac.id / dosen123');
    console.log('[SEED]    Mhs:   mahasiswa@contoh.ac.id / mhs123');
  }

  // ── Content seed (landing page + berita) ──
  const tId = existing.length > 0 ? existing[0].id : tenantId;
  const tSchema = `"${schemaName}"`;
  const { rows: tenantRows } = await query('SELECT nama_pt, name FROM public.tenants WHERE id = $1', [tId]);
  const tName = tenantRows.length > 0 ? (tenantRows[0].nama_pt || tenantRows[0].name) : 'Kampus';

  const LP = {
    active: true,
    seoTitle: `${tName} — Kampus Pilihan Masa Depan`,
    seoDescription: `${tName} — sistem informasi akademik terintegrasi untuk masa depan pendidikan yang lebih baik.`,
    heroTitle: `${tName} Masa Depan`,
    heroSubtitle: `Kami percaya pendidikan berkualitas adalah jembatan menuju masa depan yang lebih cerah. Bergabunglah dengan ribuan mahasiswa yang telah meraih impian mereka.`,
    showBerita: true, showPPDB: true, showProdi: true, showStruktur: true, showPrestasi: true, showPromosi: true, showPopUp: false,
    primaryColor: '#006d36', heroImages: [],
    sambutan: { active: true, title: 'Sambutan', content: `${tName} berkomitmen menciptakan lingkungan akademik yang inovatif, inklusif, dan berdaya saing global.`, nama: `Rektor ${tName}`, jabatan: 'Rektor', image: '' },
    prestasi: [
      { icon: 'Award', title: 'Akreditasi Unggul', desc: 'Terakreditasi BAN-PT dengan peringkat UNGGUL di seluruh prodi.' },
      { icon: 'Users', title: 'Dosen Profesional', desc: 'Tenaga pengajar tersertifikasi dan berpengalaman di bidangnya.' },
      { icon: 'BookOpen', title: 'Kurikulum OBE', desc: 'Kurikulum berbasis Outcome-Based Education relevan dengan industri.' },
      { icon: 'GraduationCap', title: 'Alumni Berprestasi', desc: 'Alumni tersebar di perusahaan ternama dan institusi pemerintah.' },
    ],
    promosi: [
      { title: 'Beasiswa Prestasi', description: 'Dapatkan beasiswa penuh untuk mahasiswa berprestasi. Pendaftaran dibuka hingga 30 Juni 2025.', image: '', link: '#' },
      { title: 'Pertukaran Mahasiswa', description: 'Program pertukaran ke universitas mitra di Jepang, Jerman, dan Australia.', image: '', link: '#' },
    ],
    strukturOrganisasi: [
      { id: uuid(), jabatan: 'Rektor', nama: `Rektor ${tName}`, image: '' },
      { id: uuid(), jabatan: 'Wakil Rektor I', nama: 'Wakil Rektor', image: '' },
      { id: uuid(), jabatan: 'Wakil Rektor II', nama: 'Wakil Rektor', image: '' },
    ],
    popUp: { active: false, title: '', content: '', image: '', buttonText: 'Tutup', buttonLink: '' },
    tahunAkademik: '2025/2026',
  };

  await query(
    `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
     VALUES ($1, 'landing_page', $2, NOW())
     ON CONFLICT (tenant_id, key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [tId, JSON.stringify(LP)]
  );
  console.log('[SEED] ✅ Landing page settings seeded');

  const BERITA = [
    { judul: `${tName} Raih Akreditasi Unggul BAN-PT`, ringkasan: `${tName} berhasil meraih akreditasi UNGGUL dari BAN-PT untuk seluruh program studi. Prestasi ini menegaskan komitmen institusi dalam menjaga kualitas pendidikan tinggi.` },
    { judul: `Tim Robotik ${tName} Juara Nasional`, ringkasan: `Tim robotik ${tName} berhasil meraih juara 1 dalam Kontes Robot Indonesia 2025 tingkat nasional.` },
    { judul: `Program Beasiswa Penuh untuk Mahasiswa Berprestasi`, ringkasan: `${tName} membuka program beasiswa penuh bagi 50 mahasiswa baru jalur prestasi akademik dan non-akademik.` },
    { judul: `Seminar Nasional AI untuk Pendidikan`, ringkasan: `Fakultas menyelenggarakan seminar nasional tentang kecerdasan buatan dalam dunia pendidikan.` },
    { judul: `Wisuda ke-25: 650 Mahasiswa Diwisuda`, ringkasan: `Sebanyak 650 mahasiswa dari berbagai program studi mengikuti wisuda ke-25 ${tName}.` },
  ];
  const { rows: existingBerita } = await query(`SELECT COUNT(*)::int as cnt FROM ${tSchema}.berita`).catch(() => ({ rows: [{ cnt: 0 }] }));
  if (existingBerita[0].cnt === 0) {
    for (const b of BERITA) {
      await query(
        `INSERT INTO ${tSchema}.berita (id, judul, slug, ringkasan, konten, gambar, is_published, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [uuid(), b.judul, b.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), b.ringkasan, b.ringkasan, '']
      );
    }
    console.log('[SEED] ✅ Articles seeded');
  } else {
    console.log(`[SEED] ⏭️  ${existingBerita[0].cnt} articles already exist`);
  }

  await query(
    `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
     VALUES ($1, 'ppdb_form_config', $2, NOW())
     ON CONFLICT (tenant_id, key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [tId, JSON.stringify({
      steps: [
        { title: 'Data Pribadi', fields: [
          { key: 'nama', label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Masukkan nama lengkap', order: 1 },
          { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'contoh@email.com', order: 2 },
          { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Minimal 6 karakter', order: 3 },
          { key: 'no_hp', label: 'No. HP', type: 'tel', required: true, placeholder: '08xxxxxxxxxx', order: 4 },
          { key: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', required: false, order: 5 },
          { key: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', required: false, order: 6 },
          { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', required: true, options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }], order: 7 },
          { key: 'alamat', label: 'Alamat', type: 'textarea', required: false, order: 8 },
          { key: 'asal_sekolah', label: 'Asal Sekolah', type: 'text', required: false, placeholder: 'Nama SMA/SMK', order: 9 },
        ]},
        { title: 'Pilihan Program Studi', fields: [
          { key: 'program_studi_id', label: 'Pilih Program Studi', type: 'prodi', required: true, order: 1 },
        ]},
      ],
      appearance: { bannerImage: '', formColor: '#006d36', accentColor: '#6366f1', showTimeline: true, customCSS: '' },
    })]
  );
  console.log('[SEED] ✅ PPDB form config seeded');

  console.log('[SEED] Done');
  await pool.end();
}

seed().catch((err) => {
  console.error('[SEED] Fatal:', err);
  process.exit(1);
});
