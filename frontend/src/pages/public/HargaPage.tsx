import useSEO from '../../hooks/useSEO';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  { name: 'Basic', price: 'Rp 149rb', period: '/bulan', desc: 'Untuk institusi kecil yang ingin memulai digitalisasi.', features: ['Manajemen Akademik Dasar', '100 Mahasiswa', '3 Admin', 'KRS & KHS Online', 'Cetak Dokumen Dasar', 'Aplikasi Mobile'], popular: false },
  { name: 'Pro', price: 'Rp 599rb', period: '/bulan', desc: 'Solusi lengkap untuk institusi berkembang.', features: ['Semua Fitur Basic', '1.000+ Mahasiswa', '10 Admin', 'Keuangan Terintegrasi', 'Integrasi PDDIKTI', 'Landing Page Builder', 'Dukungan Prioritas 24/7'], popular: true },
  { name: 'Enterprise', price: 'Rp 1.499rb', period: '/bulan', desc: 'Untuk universitas besar dengan kebutuhan kompleks.', features: ['Semua Fitur Pro', 'Unlimited Mahasiswa', 'Admin Tak Terbatas', 'Kustomisasi Modul', 'SLA 99.9%', 'Dedicated Support', 'On-Premise Opsional'], popular: false },
];

const faq = [
  { q: 'Apakah ada biaya implementasi?', a: 'Tidak ada biaya implementasi. Tim kami akan membantu setup dan migrasi data secara gratis.' },
  { q: 'Bisa custom fitur sesuai kebutuhan?', a: 'Ya, khusus paket Enterprise kami menyediakan kustomisasi modul sesuai kebutuhan institusi.' },
  { q: 'Apakah data kami aman?', a: 'Data tersimpan di cloud dengan enkripsi SSL, backup otomatis harian, dan sertifikasi keamanan.' },
  { q: 'Berapa lama proses implementasi?', a: 'Rata-rata 3-7 hari kerja untuk migrasi data dan pelatihan admin.' },
];

export default function HargaPage() {
  useSEO('Harga Paket AONE SIAKAD - Sistem Informasi Akademik Mulai Rp149rb',
    'Lihat paket harga AONE SIAKAD: Basic Rp149rb, Pro Rp599rb, Enterprise Rp1.499rb per bulan. Gratis trial 1 hari. Konsultasi gratis.',
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
        <h1 className="text-4xl font-bold font-display text-center text-slate-900 dark:text-white mb-3">Paket Harga</h1>
        <p className="text-center text-slate-500 dark:text-zinc-400 mb-12 max-w-xl mx-auto">Pilih paket yang sesuai dengan kebutuhan institusi Anda. Gratis trial 1 hari.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative bg-white dark:bg-zinc-900/50 rounded-2xl p-6 shadow-sm ring-1 transition-all hover:shadow-md ${plan.popular ? 'ring-2 ring-emerald-500 scale-105' : 'ring-slate-200 dark:ring-zinc-800'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><Sparkles size={12} /> TERPOPULER</div>}
              <h3 className="text-lg font-bold font-display dark:text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold dark:text-white">{plan.price}</span>
                <span className="text-sm text-slate-400">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-300">
                    <Check size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login?tenant=demo" className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${plan.popular ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700'}`}>
                Coba Gratis
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-8 shadow-sm ring-1 ring-slate-200 dark:ring-zinc-800 mb-8">
          <h2 className="text-xl font-bold font-display dark:text-white mb-6 text-center">Pertanyaan Umum</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-700 dark:text-zinc-200 py-3 border-b border-slate-100 dark:border-zinc-800">{item.q}</summary>
                <p className="text-sm text-slate-500 dark:text-zinc-400 py-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/login?tenant=demo" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            Mulai Trial Gratis
          </Link>
        </div>
      </div>

      <footer className="border-t border-slate-200 dark:border-zinc-800 py-8 text-center text-sm text-slate-400">
        <p>&copy; 2026 AONE SIAKAD. All rights reserved.</p>
      </footer>
    </div>
  );
}
