import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post, del, put } from '../../api/client';
import { toast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Plus, Trash2, Download, FileText, Link, ExternalLink, ClipboardList, Megaphone, BookOpen, Users, Clock, CheckCircle, XCircle, Loader2, Send, Star, CalendarDays } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';

type Tab = 'materi' | 'tugas' | 'pengumuman';

export default function KelasRoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('materi');
  const [loading, setLoading] = useState(true);
  const isDosen = user?.role === 'dosen' || user?.role === 'admin' || user?.role === 'akademik';

  const [materi, setMateri] = useState<any[]>([]);
  const [showMateriForm, setShowMateriForm] = useState(false);
  const [materiForm, setMateriForm] = useState({ judul: '', deskripsi: '', file_url: '', file_nama: '', link_url: '', tipe: 'file' });

  const [tugas, setTugas] = useState<any[]>([]);
  const [showTugasForm, setShowTugasForm] = useState(false);
  const [tugasForm, setTugasForm] = useState({ judul: '', deskripsi: '', file_url: '', file_nama: '', deadline: '', bobot: 0 });

  const [submitUrl, setSubmitUrl] = useState('');
  const [submitCatatan, setSubmitCatatan] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [nilaiInput, setNilaiInput] = useState<Record<string, string>>({});
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});
  const [savingNilai, setSavingNilai] = useState<string | null>(null);

  const [pengumuman, setPengumuman] = useState<any[]>([]);
  const [showPengForm, setShowPengForm] = useState(false);
  const [pengForm, setPengForm] = useState({ judul: '', konten: '', file_url: '', file_nama: '' });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      get<any>(`/akademik/kelas-room/${id}`),
      get<any>(`/akademik/kelas-room/${id}/materi`),
      get<any>(`/akademik/kelas-room/${id}/tugas`),
      get<any>(`/akademik/kelas-room/${id}/pengumuman`),
    ]).then(([r, m, t, p]) => {
      setRoom(r);
      setMateri(m.rows || m);
      setTugas(t.rows || t);
      setPengumuman(p.rows || p);
    }).catch(() => navigate('/kelas-room')).finally(() => setLoading(false));
  }, [id]);

  const handleAddMateri = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: any = { judul: materiForm.judul, deskripsi: materiForm.deskripsi, tipe: materiForm.tipe };
      if (materiForm.tipe === 'link') {
        body.link_url = materiForm.link_url;
      } else {
        body.file_url = materiForm.file_url;
        body.file_nama = materiForm.file_nama;
      }
      await post(`/akademik/kelas-room/${id}/materi`, body);
      toast('Materi ditambahkan', 'success');
      setShowMateriForm(false);
      setMateriForm({ judul: '', deskripsi: '', file_url: '', file_nama: '', link_url: '', tipe: 'file' });
      const res = await get<any>(`/akademik/kelas-room/${id}/materi`);
      setMateri(res.rows || res);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); } finally { setSaving(false); }
  };

  const handleDeleteMateri = async (materiId: string) => {
    try {
      await del(`/akademik/kelas-room/${id}/materi/${materiId}`);
      toast('Materi dihapus', 'success');
      setMateri(prev => prev.filter(m => m.id !== materiId));
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const handleAddTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await post(`/akademik/kelas-room/${id}/tugas`, {
        ...tugasForm,
        deadline: tugasForm.deadline || null,
        bobot: Number(tugasForm.bobot) || 0,
      });
      toast('Tugas ditambahkan', 'success');
      setShowTugasForm(false);
      setTugasForm({ judul: '', deskripsi: '', file_url: '', file_nama: '', deadline: '', bobot: 0 });
      const res = await get<any>(`/akademik/kelas-room/${id}/tugas`);
      setTugas(res.rows || res);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); } finally { setSaving(false); }
  };

  const handleSubmitTugas = async (tugasId: string) => {
    if (!submitUrl) { toast('Upload file terlebih dahulu', 'warning'); return; }
    setSubmitting(tugasId);
    try {
      await post(`/akademik/kelas-room/tugas/${tugasId}/submit`, { file_url: submitUrl, file_nama: submitUrl.split('/').pop(), catatan: submitCatatan });
      toast('Tugas berhasil dikumpulkan', 'success');
      setSubmitUrl('');
      setSubmitCatatan('');
      const res = await get<any>(`/akademik/kelas-room/${id}/tugas`);
      setTugas(res.rows || res);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); } finally { setSubmitting(null); }
  };

  const handleNilai = async (tugasId: string, userId: string) => {
    setSavingNilai(`${tugasId}_${userId}`);
    try {
      await put(`/akademik/kelas-room/tugas/${tugasId}/nilai/${userId}`, {
        nilai: Number(nilaiInput[`${tugasId}_${userId}`]) || 0,
        feedback: feedbackInput[`${tugasId}_${userId}`] || '',
      });
      toast('Nilai disimpan', 'success');
      const res = await get<any>(`/akademik/kelas-room/${id}/tugas`);
      setTugas(res.rows || res);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); } finally { setSavingNilai(null); }
  };

  const handleAddPengumuman = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await post(`/akademik/kelas-room/${id}/pengumuman`, pengForm);
      toast('Pengumuman diposting', 'success');
      setShowPengForm(false);
      setPengForm({ judul: '', konten: '', file_url: '', file_nama: '' });
      const res = await get<any>(`/akademik/kelas-room/${id}/pengumuman`);
      setPengumuman(res.rows || res);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>;
  }

  if (!room) return null;

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: 'materi', label: 'Materi', icon: FileText, count: materi.length },
    { key: 'tugas', label: 'Tugas', icon: ClipboardList, count: tugas.length },
    { key: 'pengumuman', label: 'Pengumuman', icon: Megaphone, count: pengumuman.length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/kelas-room')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" style={{ color: 'var(--muted-foreground)' }}><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">{room.nama}</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {room.dosen_nama} {room.semester && `· ${room.semester} ${room.tahun_akademik || ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Users size={14} /><span>{room.anggota?.length || 0} anggota</span>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center ${tab === t.key ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
            style={{ color: tab === t.key ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
            <t.icon size={14} /> {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'materi' && (
        <div className="space-y-3">
          {isDosen && <button onClick={() => setShowMateriForm(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah Materi</button>}
          {materi.length === 0 ? (
            <div className="flex flex-col items-center py-12"><BookOpen size={36} style={{ color: 'var(--muted-foreground)', opacity: 0.2 }} /><p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Belum Ada Materi</p></div>
          ) : (
            <div className="space-y-2">
              {materi.map((m: any) => (
                <div key={m.id} className="bg-card rounded-xl border border-border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        {m.tipe === 'link' ? <Link size={16} className="text-indigo-500" /> : <FileText size={16} className="text-indigo-500" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{m.judul}</h3>
                        {m.deskripsi && <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{m.deskripsi}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          {m.file_url && <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-medium hover:underline" style={{ color: 'var(--primary)' }}><Download size={11} />{m.file_nama || 'File'}</a>}
                          {m.link_url && <a href={m.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-medium hover:underline" style={{ color: 'var(--primary)' }}><ExternalLink size={11} />Link</a>}
                          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{m.created_by_nama} · {new Date(m.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    {isDosen && <button onClick={() => handleDeleteMateri(m.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'tugas' && (
        <div className="space-y-3">
          {isDosen && <button onClick={() => setShowTugasForm(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Buat Tugas</button>}
          {tugas.length === 0 ? (
            <div className="flex flex-col items-center py-12"><ClipboardList size={36} style={{ color: 'var(--muted-foreground)', opacity: 0.2 }} /><p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Belum Ada Tugas</p></div>
          ) : (
            <div className="space-y-3">
              {tugas.map((t: any) => {
                const deadlinePassed = t.deadline && new Date(t.deadline) < new Date();
                return (
                  <div key={t.id} className="bg-card rounded-xl border border-border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.sudah_submit ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        {t.sudah_submit ? <CheckCircle size={16} className="text-emerald-500" /> : <Clock size={16} className="text-amber-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{t.judul}</h3>
                        {t.deskripsi && <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{t.deskripsi}</p>}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {t.deadline && <span className={`flex items-center gap-1 text-[10px] font-medium ${deadlinePassed ? 'text-red-500' : 'text-emerald-500'}`}><CalendarDays size={11} /> {new Date(t.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Bobot: {t.bobot}%</span>
                          {!isDosen && t.sudah_submit && <span className="text-[10px] font-medium text-emerald-500">✓ Dikumpulkan {t.nilai_saya > 0 ? `· Nilai: ${t.nilai_saya}` : ''}</span>}
                          {isDosen && <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{t.total_submit || 0} submit</span>}
                        </div>

                        {!isDosen && !t.sudah_submit && !deadlinePassed && (
                          <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
                            <FileUpload value={submitUrl} onChange={setSubmitUrl} accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.png,.xls,.xlsx,.ppt,.pptx" label="Upload file tugas" />
                            <div className="flex gap-2">
                              <input placeholder="Catatan (opsional)" value={submitCatatan} onChange={e => setSubmitCatatan(e.target.value)} className="input-field text-xs flex-1" />
                              <button onClick={() => handleSubmitTugas(t.id)} disabled={submitting === t.id || !submitUrl} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                                {submitting === t.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Kumpulkan
                              </button>
                            </div>
                          </div>
                        )}

                        {!isDosen && t.sudah_submit && t.feedback && (
                          <div className="mt-2 text-xs p-2 rounded-lg" style={{ background: 'var(--secondary)' }}><span className="font-medium">Feedback: </span>{t.feedback}</div>
                        )}
                      </div>
                    </div>

                    {isDosen && t.submissions && t.submissions.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>Pengumpulan:</p>
                        {t.submissions.map((s: any) => (
                          <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg flex-wrap" style={{ background: 'var(--secondary)' }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: 'var(--primary)' }}>{(s.nama || '?').charAt(0)}</div>
                            <span className="text-[10px] font-medium min-w-0 truncate" style={{ color: 'var(--foreground)' }}>{s.nama}</span>
                            {s.file_url && <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-[9px] flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}><Download size={9} />{s.file_nama || 'File'}</a>}
                            <input type="number" placeholder="Nilai" value={nilaiInput[`${t.id}_${s.user_id}`] ?? s.nilai ?? ''} onChange={e => setNilaiInput(p => ({ ...p, [`${t.id}_${s.user_id}`]: e.target.value }))} className="input-field text-xs w-14 text-center" min="0" max="100" />
                            <input placeholder="Feedback" value={feedbackInput[`${t.id}_${s.user_id}`] ?? s.feedback ?? ''} onChange={e => setFeedbackInput(p => ({ ...p, [`${t.id}_${s.user_id}`]: e.target.value }))} className="input-field text-xs w-20" />
                            <button onClick={() => handleNilai(t.id, s.user_id)} disabled={savingNilai === `${t.id}_${s.user_id}`} className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 transition-all">
                              {savingNilai === `${t.id}_${s.user_id}` ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'pengumuman' && (
        <div className="space-y-3">
          {isDosen && <button onClick={() => setShowPengForm(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Buat Pengumuman</button>}
          {pengumuman.length === 0 ? (
            <div className="flex flex-col items-center py-12"><Megaphone size={36} style={{ color: 'var(--muted-foreground)', opacity: 0.2 }} /><p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Belum Ada Pengumuman</p></div>
          ) : (
            <div className="space-y-3">
              {pengumuman.map((p: any) => (
                <div key={p.id} className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    {p.created_by_foto ? <img src={p.created_by_foto} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--primary)' }}>{(p.created_by_nama || '?').charAt(0)}</div>}
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{p.created_by_nama}</p>
                      <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{new Date(p.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>{p.judul}</h3>
                  <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted-foreground)' }}>{p.konten}</div>
                  {p.file_url && <a href={p.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-medium mt-2 hover:underline" style={{ color: 'var(--primary)' }}><Download size={11} />{p.file_nama || 'Download'}</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showMateriForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowMateriForm(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl shadow-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Tambah Materi</h2>
            <form onSubmit={handleAddMateri} className="space-y-3">
              <input required placeholder="Judul Materi" value={materiForm.judul} onChange={e => setMateriForm({ ...materiForm, judul: e.target.value })} className="input-field" />
              <textarea placeholder="Deskripsi (opsional)" value={materiForm.deskripsi} onChange={e => setMateriForm({ ...materiForm, deskripsi: e.target.value })} className="input-field" rows={3} />
              <div className="flex gap-2">
                <select value={materiForm.tipe} onChange={e => setMateriForm({ ...materiForm, tipe: e.target.value })} className="input-field max-w-[100px]">
                  <option value="file">File</option>
                  <option value="link">Link</option>
                </select>
                {materiForm.tipe === 'file' ? (
                  <FileUpload value={materiForm.file_url} onChange={(url) => setMateriForm({ ...materiForm, file_url: url, file_nama: url.split('/').pop() || '' })} accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.png" label="Upload file" />
                ) : (
                  <input placeholder="Masukkan URL" value={materiForm.link_url} onChange={e => setMateriForm({ ...materiForm, link_url: e.target.value })} className="input-field flex-1" />
                )}
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showTugasForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowTugasForm(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl shadow-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Buat Tugas</h2>
            <form onSubmit={handleAddTugas} className="space-y-3">
              <input required placeholder="Judul Tugas" value={tugasForm.judul} onChange={e => setTugasForm({ ...tugasForm, judul: e.target.value })} className="input-field" />
              <textarea placeholder="Deskripsi (opsional)" value={tugasForm.deskripsi} onChange={e => setTugasForm({ ...tugasForm, deskripsi: e.target.value })} className="input-field" rows={3} />
              <FileUpload value={tugasForm.file_url} onChange={(url) => setTugasForm({ ...tugasForm, file_url: url, file_nama: url.split('/').pop() || '' })} accept=".pdf,.doc,.docx,.zip" label="Upload file tugas (opsional)" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--muted-foreground)' }}>Deadline</label><input type="datetime-local" value={tugasForm.deadline} onChange={e => setTugasForm({ ...tugasForm, deadline: e.target.value })} className="input-field" /></div>
                <div><label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--muted-foreground)' }}>Bobot (%)</label><input type="number" value={tugasForm.bobot} onChange={e => setTugasForm({ ...tugasForm, bobot: Number(e.target.value) || 0 })} className="input-field" min="0" max="100" /></div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Buat Tugas'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPengForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPengForm(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl shadow-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Buat Pengumuman</h2>
            <form onSubmit={handleAddPengumuman} className="space-y-3">
              <input required placeholder="Judul Pengumuman" value={pengForm.judul} onChange={e => setPengForm({ ...pengForm, judul: e.target.value })} className="input-field" />
              <textarea required placeholder="Konten pengumuman..." value={pengForm.konten} onChange={e => setPengForm({ ...pengForm, konten: e.target.value })} className="input-field" rows={5} />
              <FileUpload value={pengForm.file_url} onChange={(url) => setPengForm({ ...pengForm, file_url: url, file_nama: url.split('/').pop() || '' })} accept=".pdf,.doc,.docx,.jpg,.png" label="Upload file (opsional)" />
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Posting'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
