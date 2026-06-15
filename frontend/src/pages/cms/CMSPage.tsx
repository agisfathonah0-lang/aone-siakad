import { useState, useEffect, useCallback, useRef } from 'react';
import { get, post as apiPost, put } from '../../api/client';
import type { CmsSection } from '../../types';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, RefreshCw, Pencil, Bold, Italic, Heading, List, Link } from 'lucide-react';

function WysiwygEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt('Masukkan URL:');
    if (url) exec('createLink', url);
  };

  const insertHeading = () => {
    exec('formatBlock', 'h3');
  };

  return (
    <div className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      <div className="flex gap-1 p-2 bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 flex-wrap">
        <button type="button" onClick={() => exec('bold')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"><Bold size={16} /></button>
        <button type="button" onClick={() => exec('italic')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"><Italic size={16} /></button>
        <button type="button" onClick={insertHeading} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"><Heading size={16} /></button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"><List size={16} /></button>
        <button type="button" onClick={insertLink} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"><Link size={16} /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="p-3 min-h-[120px] text-sm focus:outline-none dark:text-zinc-200 dark:bg-zinc-900/30"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

export default function CMSPage() {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [form, setForm] = useState({ key: '', title: '', content: '', is_published: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const res = await get<CmsSection[]>('/cms'); setSections(res || []); }
    catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditKey(null); setForm({ key: '', title: '', content: '', is_published: true }); setModal(true); };
  const openEdit = (s: CmsSection) => {
    const html = typeof s.content === 'object' && s.content && 'html' in s.content ? (s.content as any).html : '';
    setEditKey(s.key);
    setForm({ key: s.key, title: s.title || '', content: html, is_published: s.is_published ?? true });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { title: form.title, content: { html: form.content }, is_published: form.is_published };
      await put(`/cms/${form.key}`, body);
      setModal(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal menyimpan'); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Memuat...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">CMS Sections</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
      </div>
      <div className="grid gap-3">
        {sections.map((s) => (
          <div key={s.key} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{s.key}</span>
                <Badge variant={s.is_published ? 'success' : 'warning'}>{s.is_published ? 'Published' : 'Draft'}</Badge>
              </div>
              {s.title && <p className="text-xs text-slate-400 mt-1">{s.title}</p>}
            </div>
            <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-indigo-500"><Pencil size={16} /></button>
          </div>
        ))}
        {sections.length === 0 && <p className="text-sm text-slate-400 text-center py-10">Belum ada section</p>}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editKey ? `Edit ${editKey}` : 'Tambah Section'}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Key</label><input required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} disabled={!!editKey} className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Content</label><WysiwygEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} /></div>
          <label className="flex items-center gap-2 text-sm dark:text-zinc-300"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" /> Published</label>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Simpan</button>
        </form>
      </Modal>
    </div>
  );
}
