import { pool, query } from '../config/database.js';
import { v4 as uuid } from 'uuid';

const SLUG = process.argv[2] || 'contoh';

const LANDING_PAGE = {
  active: true,
  seoTitle: 'IAI Ma\'arif — Universitas Pilihan Masa Depan',
  seoDescription: 'IAI Ma\'arif — sistem informasi akademik terintegrasi untuk masa depan pendidikan yang lebih baik.',
  heroTitle: 'IAI Ma\'arif Masa Depan',
  heroSubtitle: 'Kami percaya bahwa pendidikan berkualitas adalah jembatan menuju masa depan yang lebih cerah. Bergabunglah dengan ribuan mahasiswa yang telah meraih impian mereka.',
  showBerita: true,
  showPPDB: true,
  showProdi: true,
  showStruktur: true,
  showPrestasi: true,
  showPromosi: true,
  showPopUp: false,
  primaryColor: '#006d36',
  heroImages: [],
  sambutan: {
    active: true,
    title: 'Sambutan Rektor',
    content: 'Kami berkomitmen untuk menciptakan lingkungan akademik yang inovatif, inklusif, dan berdaya saing global. Setiap mahasiswa adalah pemimpin masa depan yang akan membawa perubahan positif bagi bangsa.',
    nama: 'Prof. Dr. Ahmad Syukri, M.Ag.',
    jabatan: 'Rektor IAI Ma\'arif',
    image: '',
  },
  prestasi: [
    { icon: 'Award', title: 'Akreditasi Institusi Unggul', desc: 'Terakreditasi BAN-PT dengan peringkat UNGGUL untuk seluruh program studi.' },
    { icon: 'Users', title: 'Dosen Profesional & Bersertifikasi', desc: '90% tenaga pengajar telah tersertifikasi profesional dan berpengalaman di bidangnya.' },
    { icon: 'BookOpen', title: 'Kurikulum Berbasis OBE', desc: 'Menerapkan Outcome-Based Education yang relevan dengan kebutuhan industri 4.0.' },
    { icon: 'GraduationCap', title: 'Alumni Berprestasi', desc: 'Lebih dari 5.000 alumni tersebar di berbagai perusahaan ternama dan institusi pemerintah.' },
    { icon: 'Target', title: 'Penelitian & Pengabdian', desc: 'Publikasi penelitian internasional dan program pengabdian masyarakat di 15 desa binaan.' },
    { icon: 'Eye', title: 'Visi Global', desc: 'Kemitraan dengan 20+ universitas luar negeri untuk program pertukaran mahasiswa.' },
  ],
  promosi: [
    { title: 'Beasiswa Prestasi 2025', description: 'Dapatkan beasiswa penuh untuk mahasiswa berprestasi akademik dan non-akademik. Pendaftaran dibuka hingga 30 Juni 2025.', image: '', link: '#' },
    { title: 'Program Pertukaran Mahasiswa', description: 'Ikuti program pertukaran ke MIT, Oxford, dan National University of Singapore. Periode pendaftaran semester ganjil 2025/2026.', image: '', link: '#' },
    { title: 'Innovation Tech Fest 2025', description: 'Kompetisi inovasi teknologi antar mahasiswa se-Indonesia. Total hadiah Rp 150 juta.', image: '', link: '#' },
  ],
  strukturOrganisasi: [
    { id: uuid(), jabatan: 'Rektor', nama: 'Prof. Dr. Ahmad Syukri, M.Ag.', image: '' },
    { id: uuid(), jabatan: 'Wakil Rektor I', nama: 'Dr. Nurhayati, M.Pd.', image: '' },
    { id: uuid(), jabatan: 'Wakil Rektor II', nama: 'Dr. Muhammad Fadli, M.E.I.', image: '' },
    { id: uuid(), jabatan: 'Wakil Rektor III', nama: 'Dr. Rina Kartika, M.T.', image: '' },
    { id: uuid(), jabatan: 'Dekan FTI', nama: 'Dr. Andi Pratama, S.T., M.Kom.', image: '' },
  ],
  popUp: { active: false, title: '', content: '', image: '', buttonText: 'Tutup', buttonLink: '' },
  tahunAkademik: '2025/2026',
};

const BERITA = [
  { judul: 'IAI Ma\'arif Raih Akreditasi Unggul BAN-PT', ringkasan: 'Institut Agama Islam Ma\'arif berhasil meraih akreditasi UNGGUL dari BAN-PT untuk seluruh program studi. Prestasi ini menegaskan komitmen institusi dalam menjaga kualitas pendidikan tinggi.', gambar: '' },
  { judul: 'Tim Robotik IAI Ma\'arif Juara Nasional Kontes Robot Indonesia', ringkasan: 'Tim robotik IAI Ma\'arif berhasil meraih juara 1 dalam Kontes Robot Indonesia 2025 tingkat nasional. Prestasi ini membanggakan dan menunjukkan kualitas mahasiswa di bidang teknologi.', gambar: '' },
  { judul: 'Rektor Tandatangani MoU dengan 5 Universitas Luar Negeri', ringkasan: 'Rektor IAI Ma\'arif menandatangani Nota Kesepahaman dengan 5 universitas dari Jepang, Jerman, dan Australia untuk program pertukaran mahasiswa, penelitian bersama, dan publikasi internasional.', gambar: '' },
  { judul: 'Program Beasiswa Penuh untuk Mahasiswa Berprestasi', ringkasan: 'IAI Ma\'arif membuka program beasiswa penuh bagi 50 mahasiswa baru jalur prestasi akademik dan non-akademik. Beasiswa meliputi UKT, biaya hidup, dan asrama selama 4 tahun.', gambar: '' },
  { judul: 'Seminar Nasional "AI untuk Pendidikan Masa Depan"', ringkasan: 'Fakultas Teknologi Informasi menyelenggarakan seminar nasional tentang kecerdasan buatan dalam dunia pendidikan dengan menghadirkan pembicara dari MIT dan Google Indonesia.', gambar: '' },
  { judul: 'Wisuda ke-25: 650 Mahasiswa Diwisuda', ringkasan: 'Sebanyak 650 mahasiswa dari berbagai program studi mengikuti wisuda ke-25 IAI Ma\'arif. Wisuda kali ini mengusung tema "Bridging Future Leaders Through Innovation".', gambar: '' },
];

async function seed() {
  console.log(`[SEED-CONTENT] Targeting tenant slug: "${SLUG}"`);

  const { rows: tenants } = await query('SELECT id, schema_name, nama_pt FROM public.tenants WHERE slug = $1', [SLUG]);
  if (tenants.length === 0) {
    console.log(`[SEED-CONTENT] ❌ Tenant with slug "${SLUG}" not found.`);
    console.log(`[SEED-CONTENT]    Available tenants:`);
    const { rows: all } = await query('SELECT slug, name FROM public.tenants ORDER BY slug');
    for (const t of all) console.log(`    - ${t.slug} (${t.name})`);
    await pool.end();
    return;
  }

  const tenant = tenants[0];
  const schema = `"${tenant.schema_name}"`;

  // ── Landing page settings ──
  const lpWithName = {
    ...LANDING_PAGE,
    heroTitle: LANDING_PAGE.heroTitle.replace('IAI Ma\'arif', tenant.nama_pt),
    seoTitle: LANDING_PAGE.seoTitle.replace('IAI Ma\'arif', tenant.nama_pt),
    seoDescription: LANDING_PAGE.seoDescription.replace('IAI Ma\'arif', tenant.nama_pt),
    sambutan: { ...LANDING_PAGE.sambutan, content: `${tenant.nama_pt} berkomitmen menciptakan lingkungan akademik yang inovatif, inklusif, dan berdaya saing global. Setiap mahasiswa adalah pemimpin masa depan yang akan membawa perubahan positif bagi bangsa.` },
    promosi: LANDING_PAGE.promosi.map(p => ({ ...p, description: p.description })),
    strukturOrganisasi: LANDING_PAGE.strukturOrganisasi.map(s => ({ ...s, id: uuid() })),
  };

  await query(
    `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
     VALUES ($1, 'landing_page', $2, NOW())
     ON CONFLICT (tenant_id, key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [tenant.id, JSON.stringify(lpWithName)]
  );
  console.log(`[SEED-CONTENT] ✅ Landing page settings seeded for "${tenant.nama_pt}"`);

  // ── Berita / Articles ──
  const { rows: existingBerita } = await query(`SELECT COUNT(*)::int as cnt FROM ${schema}.berita`);
  if (existingBerita[0].cnt === 0) {
    for (const b of BERITA) {
      await query(
        `INSERT INTO ${schema}.berita (id, judul, slug, ringkasan, konten, gambar, is_published, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [uuid(), b.judul, b.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), b.ringkasan, b.ringkasan + '\n\nDetail lebih lanjut dapat dilihat di portal akademik.', b.gambar]
      );
    }
    console.log(`[SEED-CONTENT] ✅ ${BERITA.length} articles seeded`);
  } else {
    console.log(`[SEED-CONTENT] ⏭️  ${existingBerita[0].cnt} articles already exist, skipping`);
  }

  // ── PPDB form config ──
  await query(
    `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
     VALUES ($1, 'ppdb_form_config', $2, NOW())
     ON CONFLICT (tenant_id, key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [tenant.id, JSON.stringify({
      steps: [
        {
          title: 'Data Pribadi',
          fields: [
            { key: 'nama', label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Masukkan nama lengkap', order: 1 },
            { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'contoh@email.com', order: 2 },
            { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Minimal 6 karakter', order: 3 },
            { key: 'no_hp', label: 'No. HP/WA', type: 'tel', required: true, placeholder: '08xxxxxxxxxx', order: 4 },
            { key: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', required: false, placeholder: '', order: 5 },
            { key: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', required: false, placeholder: '', order: 6 },
            { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', required: true, options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }], order: 7 },
            { key: 'alamat', label: 'Alamat', type: 'textarea', required: false, placeholder: '', order: 8 },
            { key: 'asal_sekolah', label: 'Asal Sekolah', type: 'text', required: false, placeholder: 'Nama SMA/SMK sederajat', order: 9 },
          ],
        },
        {
          title: 'Pilihan Program Studi',
          fields: [
            { key: 'program_studi_id', label: 'Pilih Program Studi', type: 'prodi', required: true, order: 1 },
          ],
        },
      ],
      appearance: {
        bannerImage: '',
        formColor: '#006d36',
        accentColor: '#6366f1',
        showTimeline: true,
        customCSS: '',
      },
    })]
  );
  console.log(`[SEED-CONTENT] ✅ PPDB form config seeded`);

  console.log('[SEED-CONTENT] ✅ Done');
  await pool.end();
}

seed().catch(err => {
  console.error('[SEED-CONTENT] ❌ Fatal:', err);
  process.exit(1);
});
