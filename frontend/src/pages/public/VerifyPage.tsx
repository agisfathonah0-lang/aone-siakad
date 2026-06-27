import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../../api/client';
import { ShieldCheck, ShieldX, Link, Hash, CheckCircle, XCircle, Clock, Building2, FileText, User, ExternalLink, Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const { kode } = useParams<{ kode: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!kode) return;
    setLoading(true);
    get<any>(`/verify/${kode}`)
      .then(setData)
      .catch((err: any) => setError(err.response?.data?.message || err.message || 'Gagal verifikasi'))
      .finally(() => setLoading(false));
  }, [kode]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-md w-full text-center">
        <ShieldX size={48} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Dokumen Tidak Terverifikasi</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>{error}</p>
      </div>
    </div>
  );

  if (!data || !data.verified) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-md w-full text-center">
        <ShieldX size={48} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Kode Verifikasi Tidak Valid</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>Dokumen dengan kode ini tidak ditemukan dalam sistem</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-lg space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold font-display" style={{ color: 'var(--foreground)' }}>Dokumen Terverifikasi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{data.nama_pt}</p>
        </div>

        {/* Info Dokumen */}
        <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <FileText size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{data.dokumen?.type || data.surat?.type || 'Dokumen'}</span>
            {data.surat?.status && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 ml-auto">{data.surat.status}</span>}
          </div>

          {data.dokumen?.nama && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nama</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.dokumen.nama}</span></div>}
          {data.dokumen?.nim && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>NIM</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.dokumen.nim}</span></div>}
          {data.dokumen?.prodi && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Program Studi</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.dokumen.prodi}</span></div>}
          {data.dokumen?.semester && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Semester</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.dokumen.semester}</span></div>}

          {data.surat?.nomor && data.surat.nomor !== '-' && (
            <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nomor</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.surat.nomor}</span></div>
          )}
          {data.surat?.perihal && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Perihal</span><span className="text-xs font-semibold text-right max-w-[60%]" style={{ color: 'var(--foreground)' }}>{data.surat.perihal}</span></div>}
          {data.surat?.tujuan && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tujuan</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.surat.tujuan}</span></div>}
          {data.surat?.kategori && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Kategori</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.surat.kategori}</span></div>}
          {data.dokumen?.tanggal && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tanggal</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{new Date(data.dokumen.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}
          {data.surat?.mahasiswa && <div className="flex items-center justify-between"><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Mahasiswa</span><span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{data.surat.mahasiswa} ({data.surat.nim})</span></div>}
        </div>

        {/* Blockchain Chain */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Link size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Blockchain Verification</span>
            {data.chain_valid !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${data.chain_valid ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                {data.chain_valid ? 'Chain Valid' : 'Chain Rusak'}
              </span>
            )}
          </div>

          <div className="space-y-2 text-[10px] font-mono">
            <div className="flex justify-between p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Kode Verifikasi</span>
              <span className="font-bold tracking-wider" style={{ color: 'var(--foreground)' }}>{data.verification_code}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Hash (SHA-256)</span>
              <span className="font-bold text-[8px] max-w-[60%] truncate" style={{ color: 'var(--foreground)' }} title={data.hash}>{data.hash}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Previous Hash</span>
              <span className="font-bold text-[8px] max-w-[60%] truncate" style={{ color: 'var(--foreground)' }} title={data.prev_hash}>{data.prev_hash}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Diverifikasi</span>
              <span className="font-bold" style={{ color: 'var(--foreground)' }}>{data.verified_count}x</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Ditandatangani</span>
              <span className="font-bold" style={{ color: 'var(--foreground)' }}>{new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Chain blocks */}
          {data.chain && data.chain.length > 1 && (
            <div className="mt-4 pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>Blockchain Ledger ({data.chain.length} blocks):</p>
              {data.chain.map((block: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: 'var(--primary)' }}>{i}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-mono truncate" style={{ color: 'var(--foreground)' }}>{block.hash.substring(0, 24)}...</p>
                    <p className="text-[7px]" style={{ color: 'var(--muted-foreground)' }}>Prev: {block.prev_hash.substring(0, 16)}...</p>
                  </div>
                  <Clock size={10} style={{ color: 'var(--muted-foreground)' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
          Dokumen ini diverifikasi secara kriptografis menggunakan SHA-256 blockchain hash chain.
          Setiap perubahan pada dokumen akan memutus rantai kriptografis.
        </p>
      </div>
    </div>
  );
}
