import useSEO from '../../hooks/useSEO';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const features = [
  { slug: 'manajemen-akademik', title: 'Manajemen Akademik', icon: '🎓', desc: 'KRS online, KHS digital, jadwal kuliah, transkrip nilai, dan monitoring akademik real-time. Sistem pengelolaan akademik terintegrasi untuk institusi pendidikan.',
    detail: 'Kelola seluruh siklus akademik mahasiswa dari pendaftaran hingga wisuda. Fitur lengkap meliputi KRS online, KHS digital, jadwal kuliah berbasis ruang dan dosen, transkrip nilai otomatis, monitoring akademik real-time, dan manajemen wisuda.',
    highlights: ['KRS Online mandiri oleh mahasiswa', 'KHS Digital dengan grafik IP per semester', 'Jadwal kuliah anti bentrok', 'Transkrip nilai otomatis siap cetak', 'Monitoring akademik real-time', 'Manajemen wisuda terintegrasi'],
    keywords: 'sistem informasi akademik, software akademik, krs online, khs digital, transkrip nilai, jadwal kuliah' },
  { slug: 'keuangan-terintegrasi', title: 'Keuangan Terintegrasi', icon: '💰', desc: 'Tagihan SPP, pembayaran online, beasiswa, dan laporan keuangan institusi dalam satu platform.',
    detail: 'Otomatiskan seluruh proses keuangan kampus. Dari tagihan SPP, pembayaran online via Midtrans, manajemen beasiswa, hingga laporan keuangan institusi yang akurat dan real-time.',
    highlights: ['Tagihan SPP otomatis per semester', 'Pembayaran online via Midtrans', 'Manajemen beasiswa', 'Laporan keuangan real-time', 'Notifikasi tagihan via email/WA', 'Integrasi dengan modul akademik'],
    keywords: 'sistem keuangan kampus, spp online, pembayaran kuliah, beasiswa, laporan keuangan institusi' },
  { slug: 'perpustakaan-digital', title: 'Perpustakaan Digital', icon: '📚', desc: 'Katalog online, e-book, repositori karya ilmiah, dan manajemen peminjaman terintegrasi.',
    detail: 'Transformasi perpustakaan konvensional menjadi digital. Kelola katalog buku, e-book, repositori skripsi/tesis/disertasi, peminjaman mandiri, dan anggota perpustakaan dalam satu sistem.',
    highlights: ['Katalog online dengan pencarian', 'E-book reader built-in', 'Repositori karya ilmiah (skripsi, tesis, disertasi)', 'Peminjaman mandiri oleh anggota', 'Manajemen anggota perpustakaan', 'Laporan sirkulasi dan statistik'],
    keywords: 'perpustakaan digital, e-book, repositori, katalog online, manajemen perpustakaan, software perpustakaan' },
  { slug: 'evaluasi-dosen', title: 'Evaluasi Dosen (EDOM)', icon: '⭐', desc: 'Kuesioner online, analisis mutu pengajaran, dan tindak lanjut hasil evaluasi.',
    detail: 'Tingkatkan mutu pengajaran dengan sistem evaluasi dosen online. Mahasiswa mengisi kuesioner secara anonim, hasil diolah otomatis menjadi laporan analisis mutu pengajaran per dosen.',
    highlights: ['Kuesioner online anonim', 'Analisis mutu pengajaran', 'Laporan per dosen dan prodi', 'Tindak lanjut hasil evaluasi', 'Grafik tren mutu per semester', 'Export PDF/Excel'],
    keywords: 'edom, evaluasi dosen, kuesioner online, mutu pengajaran, sistem evaluasi pembelajaran' },
  { slug: 'akreditasi-ban-pt', title: 'Akreditasi BAN-PT', icon: '🏆', desc: 'Dokumen 9 standar, borang akreditasi, dan pemantauan siklus akreditasi institusi.',
    detail: 'Persiapkan akreditasi institusi dan prodi dengan mudah. Kelola dokumen 9 standar akreditasi, borang LED/LKPS, jadwal asesmen, dan pemantauan tindak lanjut hasil akreditasi.',
    highlights: ['Manajemen 9 standar akreditasi', 'Borang LED dan LKPS', 'Jadwal asesmen lapangan', 'Dokumen pendukung terpusat', 'Pemantauan siklus akreditasi', 'Notifikasi masa berlaku akreditasi'],
    keywords: 'akreditasi ban-pt, borang akreditasi, 9 standar akreditasi, sistem akreditasi, led lkps' },
  { slug: 'cetak-dokumen', title: 'Cetak Dokumen Akademik', icon: '🖨️', desc: 'Cetak KHS, transkrip, sertifikat, dan ijazah dengan tanda tangan digital.',
    detail: 'Cetak dokumen akademik resmi dengan tanda tangan digital dan QR code. Dukungan cetak massal untuk KHS, transkrip nilai, sertifikat, dan ijazah dengan format yang telah disesuaikan.',
    highlights: ['Cetak KHS dan transkrip', 'Tanda tangan digital', 'QR code anti pemalsuan', 'Cetak massal', 'Template dokumen custom', 'Riwayat cetak terekam'],
    keywords: 'cetak khs, cetak transkrip, tanda tangan digital, ijazah online, sertifikat digital' },
  { slug: 'integrasi-pddikti', title: 'Integrasi PDDIKTI', icon: '🔄', desc: 'Sinkronisasi data mahasiswa, dosen, dan prodi ke PDDIKTI secara otomatis.',
    detail: 'Sinkronisasi data otomatis ke PDDIKTI tanpa input manual. Data mahasiswa, dosen, prodi, mata kuliah, dan nilai tersinkronisasi real-time dengan server PDDIKTI.',
    highlights: ['Sinkronisasi data mahasiswa', 'Sinkronisasi data dosen', 'Sinkronisasi prodi dan mata kuliah', 'Sinkronisasi nilai dan KRS', 'Monitoring status sinkron', 'Log error dan retry otomatis'],
    keywords: 'pddikti, sinkronisasi pddikti, feeder pddikti, laporan pddikti, integrasi pddikti, software pddikti' },
  { slug: 'landing-page-builder', title: 'Landing Page Builder', icon: '🌐', desc: 'Buat website kampus sendiri dengan drag & drop builder tanpa coding.',
    detail: 'Buat website resmi kampus dengan mudah. Drag & drop builder, template siap pakai, kustomisasi warna dan font, hero slider, berita, prestasi, struktur organisasi, dan PPDB online.',
    highlights: ['Drag & drop builder', 'Template siap pakai', 'Hero slider dan banner', 'Halaman berita dan prestasi', 'PPDB online terintegrasi', 'SEO-friendly dan mobile responsive'],
    keywords: 'landing page kampus, website kampus, builder website akademik, ppdb online, website sekolah' },
];

export default function FeaturePage({ slug }: { slug: string }) {
  const feat = features.find(f => f.slug === slug);

  useSEO(
    `${feat?.title || 'Fitur'} - AONE SIAKAD`,
    `${feat?.desc || ''} ${feat?.keywords || ''}. Solusi SIAKAD terintegrasi untuk institusi pendidikan di Indonesia.`,
    '/logo.png'
  );

  if (!feat) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold dark:text-white">Fitur tidak ditemukan</h1>
        <Link to="/" className="text-emerald-500 hover:underline mt-2 block">Kembali ke Beranda</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AONE SIAKAD" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/testimoni" className="text-sm text-slate-500 hover:text-emerald-500">Testimoni</Link>
            <Link to="/harga" className="text-sm text-slate-500 hover:text-emerald-500">Harga</Link>
            <Link to="/login?tenant=demo" className="text-sm font-bold text-emerald-600 hover:text-emerald-500">Demo</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="text-sm text-emerald-500 hover:underline mb-8 inline-block">&larr; Kembali</Link>
        <div className="text-5xl mb-6">{feat.icon}</div>
        <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">{feat.title}</h1>
        <p className="text-lg text-slate-600 dark:text-zinc-300 mb-8 leading-relaxed">{feat.detail}</p>

        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-8 shadow-sm ring-1 ring-slate-200 dark:ring-zinc-800 mb-8">
          <h2 className="text-xl font-bold font-display dark:text-white mb-6">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feat.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-slate-600 dark:text-zinc-300">{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold font-display mb-3">Siap Digitalisasi Kampus?</h2>
          <p className="text-emerald-100 mb-6 max-w-md mx-auto">Mulai dari Rp149rb/bulan. Konsultasi gratis dengan tim kami.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login?tenant=demo" className="px-6 py-2.5 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all">Coba Demo</Link>
            <Link to="/harga" className="px-6 py-2.5 border border-white/30 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">Lihat Harga</Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 dark:border-zinc-800 py-8 text-center text-sm text-slate-400">
        <p>&copy; 2026 AONE SIAKAD. All rights reserved.</p>
      </footer>
    </div>
  );
}

export { features };
