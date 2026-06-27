import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Eye, EyeOff, Code, Variable, BookOpen, User, Mail, FileText, Calendar, Hash, ArrowLeftRight } from 'lucide-react';

interface VariableGroup {
  label: string;
  icon: any;
  vars: { key: string; desc: string }[];
}

const VARIABLE_GROUPS: VariableGroup[] = [
  {
    label: 'Surat', icon: FileText,
    vars: [
      { key: 'nomor_surat', desc: 'Nomor surat' },
      { key: 'perihal', desc: 'Perihal surat' },
      { key: 'tujuan', desc: 'Tujuan surat' },
      { key: 'lampiran', desc: 'Lampiran' },
      { key: 'tanggal_surat', desc: 'Tanggal surat' },
      { key: 'tempat_surat', desc: 'Tempat + tanggal' },
      { key: 'isi_surat', desc: 'Isi surat' },
    ],
  },
  {
    label: 'Mahasiswa', icon: User,
    vars: [
      { key: 'nama_mahasiswa', desc: 'Nama mahasiswa' },
      { key: 'nim', desc: 'NIM' },
      { key: 'prodi_nama', desc: 'Program studi' },
      { key: 'semester', desc: 'Semester' },
      { key: 'tahun_akademik', desc: 'Tahun akademik' },
      { key: 'ipk', desc: 'IPK' },
      { key: 'alamat', desc: 'Alamat' },
      { key: 'tempat_lahir', desc: 'Tempat lahir' },
      { key: 'tanggal_lahir', desc: 'Tanggal lahir' },
    ],
  },
  {
    label: 'Akademik', icon: BookOpen,
    vars: [
      { key: 'nama_pt', desc: 'Nama perguruan tinggi' },
      { key: 'fakultas_nama', desc: 'Nama fakultas' },
      { key: 'kaprodi_nama', desc: 'Nama kaprodi' },
      { key: 'dekan_nama', desc: 'Nama dekan' },
      { key: 'rektor_nama', desc: 'Nama rektor' },
    ],
  },
  {
    label: 'Tanggal & Nomor', icon: Calendar,
    vars: [
      { key: 'tanggal_sekarang', desc: 'Tanggal hari ini' },
      { key: 'bulan_romawi', desc: 'Bulan romawi (IX)' },
      { key: 'tahun_sekarang', desc: 'Tahun (2025)' },
    ],
  },
];

interface SuratTemplateBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SuratTemplateBuilder({ value, onChange }: SuratTemplateBuilderProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [activeVarGroup, setActiveVarGroup] = useState<string | null>(null);
  const [sampleData, setSampleData] = useState<Record<string, string>>({
    nomor_surat: '0001/UNIV/A/VI/2025',
    perihal: '[Isi Perihal]',
    tujuan: 'Yth. [Nama Tujuan]',
    lampiran: '-',
    tanggal_surat: '15 Juni 2025',
    tempat_surat: 'Jakarta, 15 Juni 2025',
    isi_surat: '[Isi surat akan ditampilkan di sini]',
    nama_mahasiswa: 'Ahmad Fauzi',
    nim: '20241001',
    prodi_nama: 'Teknik Informatika (S1)',
    semester: '4 (Genap)',
    tahun_akademik: '2024/2025',
    ipk: '3.75',
    alamat: 'Jl. Merdeka No. 123, Jakarta',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '10 Mei 2005',
    nama_pt: 'Universitas Aone',
    fakultas_nama: 'Fakultas Teknik dan Informatika',
    kaprodi_nama: 'Dr. Ali, M.Kom.',
    dekan_nama: 'Prof. Dr. Budi, M.T.',
    rektor_nama: 'Prof. Dr. H. Ahmad, M.Sc.',
    tanggal_sekarang: '27 Juni 2025',
    bulan_romawi: 'VI',
    tahun_sekarang: '2025',
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newVal = before + text + after;
    onChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    });
  }, [value, onChange]);

  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newVal = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }, [value, onChange]);

  const renderPreview = () => {
    let html = value;
    for (const [key, val] of Object.entries(sampleData)) {
      html = html.replaceAll(`{{${key}}}`, val);
    }
    html = html
      .replace(/\n/g, '<br/>')
      .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-lg font-bold mt-4 mb-2">$1</h1>')
      .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-base font-bold mt-3 mb-1">$1</h2>')
      .replace(/<ul>([\s\S]*?)<\/ul>/g, (_, content) => `<ul class="list-disc pl-5 space-y-1">${content.replace(/<li>(.*?)<\/li>/g, '<li>$1</li>')}</ul>`)
      .replace(/<ol>([\s\S]*?)<\/ol>/g, (_, content) => `<ol class="list-decimal pl-5 space-y-1">${content.replace(/<li>(.*?)<\/li>/g, '<li>$1</li>')}</ol>`)
      .replace(/<li>(.*?)<\/li>/g, '<li class="text-xs">$1</li>');
    return html;
  };

  const unresolvedVars = value.match(/\{\{(\w+)\}\}/g);
  const unresolvedCount = unresolvedVars ? new Set(unresolvedVars).size : 0;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 rounded-xl flex-wrap" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
        <button type="button" onClick={() => wrapSelection('<b>', '</b>')} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors" title="Bold" style={{ color: 'var(--muted-foreground)' }}><Bold size={14} /></button>
        <button type="button" onClick={() => wrapSelection('<i>', '</i>')} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors" title="Italic" style={{ color: 'var(--muted-foreground)' }}><Italic size={14} /></button>
        <button type="button" onClick={() => wrapSelection('<u>', '</u>')} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors" title="Underline" style={{ color: 'var(--muted-foreground)' }}><Underline size={14} /></button>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
        <button type="button" onClick={() => wrapSelection('<h1>', '</h1>\n')} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors" title="Heading 1" style={{ color: 'var(--muted-foreground)' }}><Heading1 size={14} /></button>
        <button type="button" onClick={() => wrapSelection('<h2>', '</h2>\n')} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors" title="Heading 2" style={{ color: 'var(--muted-foreground)' }}><Heading2 size={14} /></button>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
        <button type="button" onClick={() => { const li = '<li></li>\n'; wrapSelection('<ul>\n' + li, '</ul>'); }} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors" title="Bullet list" style={{ color: 'var(--muted-foreground)' }}><List size={14} /></button>
        <button type="button" onClick={() => { const li = '<li></li>\n'; wrapSelection('<ol>\n' + li, '</ol>'); }} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors" title="Numbered list" style={{ color: 'var(--muted-foreground)' }}><ListOrdered size={14} /></button>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
        <div className="relative">
          <button type="button" onClick={() => setActiveVarGroup(activeVarGroup ? null : 'vars')} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }} title="Insert variable">
            <Variable size={14} /> Variable
          </button>
          {activeVarGroup === 'vars' && (
            <div className="absolute top-full left-0 mt-1 w-72 rounded-xl shadow-2xl border z-50 p-2" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {VARIABLE_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="text-[10px] font-semibold px-1.5 py-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                      <group.icon size={11} /> {group.label}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {group.vars.map(v => (
                        <button key={v.key} type="button" onClick={() => { insertAtCursor(`{{${v.key}}}`); setActiveVarGroup(null); }}
                          className="px-2 py-1 rounded-lg text-[10px] font-medium transition-colors hover:bg-white dark:hover:bg-zinc-700"
                          style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}
                          title={v.desc}>
                          {`{{${v.key}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1" />
        <button type="button" onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${mode === 'preview' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-white dark:hover:bg-zinc-700'}`}
          style={{ color: mode === 'preview' ? 'var(--primary)' : 'var(--muted-foreground)' }}>
          {mode === 'preview' ? <Code size={14} /> : <Eye size={14} />} {mode === 'preview' ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {mode === 'edit' ? (
        <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)}
          className="input-field text-sm font-mono leading-relaxed min-h-[200px] resize-y"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          placeholder={`Gunakan toolbar di atas untuk format teks.\nKlik "Variable" untuk menyisipkan {{variable}}.\n\nContoh:\n<h1>SURAT KEPUTUSAN</h1>\n<b>Nomor:</b> {{nomor_surat}}\n\nDengan ini menetapkan...`}
        />
      ) : (
        <div className="min-h-[200px] rounded-xl border p-4 text-sm leading-relaxed whitespace-pre-wrap overflow-auto"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          dangerouslySetInnerHTML={{ __html: renderPreview() }} />
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
        <span>{value.length} karakter · {unresolvedCount} variable unik</span>
        {mode === 'preview' && (
          <button type="button" onClick={() => setSampleData(prev => ({ ...prev }))} className="flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
            <ArrowLeftRight size={11} /> Sample data
          </button>
        )}
      </div>
    </div>
  );
}
