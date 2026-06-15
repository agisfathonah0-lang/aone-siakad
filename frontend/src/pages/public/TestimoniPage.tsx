import useSEO from '../../hooks/useSEO';
import { Link } from 'react-router-dom';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  { quote: 'AONE SIAKAD membantu kami mengelola administrasi akademik dengan sangat efisien. Implementasinya cepat dan tim support sangat responsif.', name: 'Dr. Ahmad Fauzi, M.Pd.', institution: 'Universitas Pendidikan Indonesia', rating: 5 },
  { quote: 'Setelah migrasi ke AONE SIAKAD, proses PPDB kami menjadi 3x lebih cepat. Dashboard yang intuitif memudahkan tim dalam memantau pendaftaran.', name: 'Rina Wijaya, S.Kom., M.T.', institution: 'Politeknik Negeri Bandung', rating: 5 },
  { quote: 'Fitur integrasi PDDIKTI sangat membantu. Data otomatis tersinkronisasi tanpa perlu input manual berulang kali.', name: 'Prof. Dr. Budi Santoso', institution: 'Universitas Gadjah Mada', rating: 5 },
  { quote: 'Modul keuangannya sangat lengkap. Tagihan SPP, pembayaran online, dan laporan keuangan semua terintegrasi rapi.', name: 'Sri Wahyuni, S.E., M.Ak.', institution: 'STIE Indonesia', rating: 5 },
  { quote: 'Cetak KHS dan transkrip dengan tanda tangan digital menghemat waktu kami berhari-hari setiap semester.', name: 'Drs. H. Agus Salim, M.Pd.', institution: 'MAN 2 Jakarta', rating: 4 },
  { quote: 'Landing page builder sangat memudahkan kami membuat website kampus tanpa perlu jasa web developer.', name: 'Fitriani, S.Kom.', institution: 'AMIK BSI Yogyakarta', rating: 5 },
];

export default function TestimoniPage() {
  useSEO('Testimoni Pengguna AONE SIAKAD - Sistem Informasi Akademik Terpercaya',
    'Lihat apa kata kampus-kampus di Indonesia yang sudah menggunakan AONE SIAKAD. Testimoni dan review pengguna sistem informasi akademik terintegrasi.',
    '/logo.png');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><img src="/logo.png" alt="AONE SIAKAD" className="h-8 w-auto" /></Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-emerald-500">Beranda</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold font-display text-center text-slate-900 dark:text-white mb-3">Testimoni Pengguna</h1>
        <p className="text-center text-slate-500 dark:text-zinc-400 mb-12 max-w-xl mx-auto">Apa kata institusi yang sudah merasakan kemudahan AONE SIAKAD?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-zinc-800">
              <Quote size={24} className="text-emerald-300 mb-3" />
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.institution}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/login?tenant=demo" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            Coba Gratis Sekarang
          </Link>
        </div>
      </div>

      <footer className="border-t border-slate-200 dark:border-zinc-800 py-8 text-center text-sm text-slate-400">
        <p>&copy; 2026 AONE SIAKAD. All rights reserved.</p>
      </footer>
    </div>
  );
}
