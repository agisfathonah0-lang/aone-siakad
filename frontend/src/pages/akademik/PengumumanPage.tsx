import { useState } from 'react';
import { Megaphone, Plus, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

const dummyPengumuman = [
  { id: '1', judul: 'Libur Akhir Semester Genap 2024/2025', konten: 'Diberitahukan kepada seluruh civitas akademika bahwa libur akhir semester...', tgl: '2024-12-20', status: 'published', target: 'Semua' },
  { id: '2', judul: 'Pendaftaran KRS Semester Ganjil 2025/2026', konten: 'Pendaftaran KRS dibuka mulai tanggal 2 Januari 2025...', tgl: '2024-12-15', status: 'published', target: 'Mahasiswa' },
  { id: '3', judul: 'Workshop Inovasi Pembelajaran', konten: 'Dalam rangka meningkatkan kualitas pembelajaran, akan diadakan workshop...', tgl: '2024-12-10', status: 'draft', target: 'Dosen' },
];

export default function PengumumanPage() {
  const [pengumuman] = useState(dummyPengumuman);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Pengumuman</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Kelola pengumuman kampus</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all"
          style={{ background: 'var(--primary)' }}>
          <Plus size={14} /> Buat Pengumuman
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                <th className="text-left px-5 py-3 font-semibold">Judul</th>
                <th className="text-left px-5 py-3 font-semibold">Target</th>
                <th className="text-left px-5 py-3 font-semibold">Tanggal</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {pengumuman.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-secondary text-sm" style={{ color: 'var(--foreground)' }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Megaphone size={14} style={{ color: 'var(--primary)' }} />
                      <span className="font-medium">{p.judul}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.target}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.tgl}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {p.status === 'published' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {p.status === 'published' ? 'Terbit' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg transition-colors hover:bg-muted"><Edit size={14} /></button>
                      <button className="p-1.5 rounded-lg transition-colors hover:bg-muted" style={{ color: '#EF4444' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
