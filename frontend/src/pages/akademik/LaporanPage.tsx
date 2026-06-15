import { useState } from 'react';
import { get } from '../../api/client';
import { BarChart3, Loader2, Download } from 'lucide-react';

function exportCSV(headers: string[], rows: any[], getValues: (r: any) => any[]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(r => getValues(r).map(v => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `laporan-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

export default function LaporanPage() {
  const [tab, setTab] = useState<'mahasiswa' | 'nilai' | 'keuangan' | 'absensi' | 'alumni'>('mahasiswa');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await get<any[]>(`/akademik/laporan/${tab}`);
      setData(Array.isArray(d) ? d : []);
    } finally { setLoading(false); }
  }

  function renderTable(headers: string[], keys: string[], renderRow: (r: any) => any[]) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
        {data.length > 0 && (
          <div className="flex justify-end px-3 pt-3">
            <button onClick={() => exportCSV(headers, data, renderRow)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition" title="Export CSV"><Download size={14} /> Export CSV</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold">
              <tr>{headers.map((h, i) => <th key={i} className="p-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/30">
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  {renderRow(r).map((v, j) => <td key={j} className="p-3 dark:text-zinc-300">{v}</td>)}
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={headers.length} className="p-8 text-center text-sm text-slate-400 dark:text-zinc-500">Belum ada data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'mahasiswa', label: 'Mahasiswa' },
    { key: 'nilai', label: 'Nilai' },
    { key: 'keuangan', label: 'Keuangan' },
    { key: 'absensi', label: 'Absensi' },
    { key: 'alumni', label: 'Alumni' },
  ] as const;

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Laporan & Rekap</h1><p className="text-xs text-slate-500 dark:text-zinc-500">Rekapitulasi data akademik dan keuangan</p></div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setData([]); }} className={`px-4 py-2 text-xs font-bold rounded-xl transition ${tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}>{t.label}</button>
        ))}
        <button onClick={load} className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 ml-auto flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20"><BarChart3 size={15} /> Tampilkan</button>
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}

      {!loading && tab === 'mahasiswa' && renderTable(
        ['Prodi', 'Jenjang', 'Total', 'Aktif', 'Cuti', 'Lulus', 'Keluar'],
        ['prodi', 'jenjang', 'total', 'aktif', 'cuti', 'lulus', 'keluar'],
        r => [r.prodi, r.jenjang, r.total, r.aktif, r.cuti, r.lulus, r.keluar]
      )}

      {!loading && tab === 'nilai' && renderTable(
        ['Kode', 'MK', 'SKS', 'Prodi', 'Total', 'Rata-rata', '≥B', '<C'],
        ['kode', 'mk_nama', 'sks', 'prodi', 'total_nilai', 'rata_rata', 'diatas_b', 'dibawah_c'],
        r => [r.kode, r.mk_nama, r.sks, r.prodi, r.total_nilai, r.rata_rata, r.diatas_b, r.dibawah_c]
      )}

      {!loading && tab === 'keuangan' && renderTable(
        ['Jenis', 'TA', 'Semester', 'Total', 'Nominal', 'Lunas', 'Belum', 'Sebagian'],
        ['jenis', 'tahun_akademik', 'semester', 'total_tagihan', 'total_nominal', 'lunas', 'belum_bayar', 'sebagian'],
        r => [r.jenis, r.tahun_akademik, r.semester, r.total_tagihan, new Intl.NumberFormat('id-ID').format(r.total_nominal), r.lunas, r.belum_bayar, r.sebagian]
      )}

      {!loading && tab === 'absensi' && renderTable(
        ['Kode', 'MK', 'Pertemuan', 'Hadir', 'Izin', 'Sakit', 'Alpha'],
        ['kode', 'mk_nama', 'total_pertemuan', 'hadir', 'izin', 'sakit', 'alpha'],
        r => [r.kode, r.mk_nama, r.total_pertemuan, r.hadir, r.izin, r.sakit, r.alpha]
      )}

      {!loading && tab === 'alumni' && renderTable(
        ['Tahun', 'Prodi', 'Total', 'Rata Masa Tunggu (bln)', 'Rata Gaji (Rp)'],
        ['tahun', 'prodi', 'total', 'rata_masa_tunggu', 'rata_gaji'],
        r => [r.tahun, r.prodi, r.total, r.rata_masa_tunggu ?? '-', r.rata_gaji ? new Intl.NumberFormat('id-ID').format(r.rata_gaji) : '-']
      )}
    </div>
  );
}
