import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  CreditCard, BarChart3, Settings, Bell, Search, ChevronDown,
  TrendingUp, TrendingDown, GraduationCap, Award, LogOut,
  ChevronRight, ArrowUpRight, MoreHorizontal, Filter, Download,
  Dot, UserCheck, BookMarked, Building2, Clock, X, Check,
  AlertTriangle, Info, CheckCircle2, XCircle, Edit, Trash2,
  Eye, Mail, Phone, MapPin, ChevronUp, ChevronsUpDown,
  ArrowLeft, ArrowRight, Plus, ShieldAlert
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type AlertType = "success" | "error" | "warning" | "info";
type SortDir = "asc" | "desc" | null;

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
}

interface Mahasiswa {
  nim: string;
  nama: string;
  jurusan: string;
  angkatan: string;
  ipk: number;
  status: "Aktif" | "Cuti" | "Lulus" | "Drop Out";
  email: string;
  phone: string;
  alamat: string;
  sks: number;
  dosenWali: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const enrollmentData = [
  { sem: "2020/1", mhs: 412 }, { sem: "2020/2", mhs: 389 },
  { sem: "2021/1", mhs: 478 }, { sem: "2021/2", mhs: 521 },
  { sem: "2022/1", mhs: 596 }, { sem: "2022/2", mhs: 548 },
  { sem: "2023/1", mhs: 634 }, { sem: "2023/2", mhs: 712 },
];

const ipkTrendData = [
  { bln: "Jan", ipk: 3.21 }, { bln: "Feb", ipk: 3.18 }, { bln: "Mar", ipk: 3.35 },
  { bln: "Apr", ipk: 3.29 }, { bln: "Mei", ipk: 3.42 }, { bln: "Jun", ipk: 3.38 },
  { bln: "Jul", ipk: 3.51 }, { bln: "Agu", ipk: 3.47 },
];

const jurusanData = [
  { name: "Teknik Informatika", value: 34, color: "#2563EB" },
  { name: "Sistem Informasi", value: 28, color: "#6366F1" },
  { name: "Manajemen Bisnis", value: 22, color: "#0EA5E9" },
  { name: "Teknik Elektro", value: 16, color: "#10B981" },
];

const MAHASISWA_DATA: Mahasiswa[] = [
  { nim: "2310001", nama: "Rizky Aditya Pratama", jurusan: "Teknik Informatika", angkatan: "2023", ipk: 3.82, status: "Aktif", email: "rizky.aditya@student.uni.ac.id", phone: "081234567890", alamat: "Jl. Sudirman No. 12, Jakarta Selatan", sks: 18, dosenWali: "Dr. Hendra Gunawan" },
  { nim: "2310042", nama: "Nadira Salsabila", jurusan: "Sistem Informasi", angkatan: "2023", ipk: 3.74, status: "Aktif", email: "nadira.salsa@student.uni.ac.id", phone: "082345678901", alamat: "Jl. Gatot Subroto No. 45, Jakarta Pusat", sks: 20, dosenWali: "Dr. Ratna Dewi, M.Kom" },
  { nim: "2310087", nama: "Farhan Maulana", jurusan: "Manajemen Bisnis", angkatan: "2023", ipk: 3.61, status: "Aktif", email: "farhan.maulana@student.uni.ac.id", phone: "083456789012", alamat: "Jl. Thamrin No. 8, Jakarta Utara", sks: 18, dosenWali: "Dr. Indah Kurniawati" },
  { nim: "2310105", nama: "Aulia Rahmawati", jurusan: "Teknik Elektro", angkatan: "2023", ipk: 3.55, status: "Aktif", email: "aulia.rahma@student.uni.ac.id", phone: "084567890123", alamat: "Jl. Kuningan No. 33, Jakarta Selatan", sks: 16, dosenWali: "Ir. Eko Santoso, M.T." },
  { nim: "2210234", nama: "Dimas Prasetyo", jurusan: "Teknik Informatika", angkatan: "2022", ipk: 3.48, status: "Aktif", email: "dimas.prasetyo@student.uni.ac.id", phone: "085678901234", alamat: "Jl. Rasuna Said No. 17, Jakarta Selatan", sks: 22, dosenWali: "Dr. Hendra Gunawan" },
  { nim: "2210398", nama: "Siti Nurhaliza", jurusan: "Sistem Informasi", angkatan: "2022", ipk: 3.39, status: "Cuti", email: "siti.nurhaliza@student.uni.ac.id", phone: "086789012345", alamat: "Jl. Casablanca No. 5, Jakarta Timur", sks: 0, dosenWali: "Dr. Ratna Dewi, M.Kom" },
  { nim: "2210521", nama: "Bagas Wicaksono", jurusan: "Manajemen Bisnis", angkatan: "2022", ipk: 3.22, status: "Aktif", email: "bagas.wicak@student.uni.ac.id", phone: "087890123456", alamat: "Jl. M.H. Thamrin No. 29, Jakarta Pusat", sks: 20, dosenWali: "Dr. Indah Kurniawati" },
  { nim: "2110044", nama: "Anisa Putri Dewanti", jurusan: "Teknik Informatika", angkatan: "2021", ipk: 3.91, status: "Aktif", email: "anisa.putri@student.uni.ac.id", phone: "088901234567", alamat: "Jl. Pluit Raya No. 11, Jakarta Utara", sks: 24, dosenWali: "Dr. Hendra Gunawan" },
  { nim: "2110189", nama: "Budi Santoso", jurusan: "Teknik Elektro", angkatan: "2021", ipk: 2.87, status: "Aktif", email: "budi.santoso@student.uni.ac.id", phone: "089012345678", alamat: "Jl. Pramuka No. 67, Jakarta Timur", sks: 18, dosenWali: "Ir. Eko Santoso, M.T." },
  { nim: "2010302", nama: "Citra Larasati", jurusan: "Sistem Informasi", angkatan: "2020", ipk: 3.65, status: "Lulus", email: "citra.lara@student.uni.ac.id", phone: "081123456789", alamat: "Jl. Kebayoran Baru No. 22, Jakarta Selatan", sks: 0, dosenWali: "Dr. Ratna Dewi, M.Kom" },
  { nim: "2010445", nama: "Dani Irawan", jurusan: "Manajemen Bisnis", angkatan: "2020", ipk: 2.45, status: "Drop Out", email: "dani.irawan@student.uni.ac.id", phone: "082234567890", alamat: "Jl. Cipete Raya No. 3, Jakarta Selatan", sks: 0, dosenWali: "Dr. Indah Kurniawati" },
  { nim: "2110377", nama: "Erlan Nugraha", jurusan: "Teknik Informatika", angkatan: "2021", ipk: 3.33, status: "Aktif", email: "erlan.nugraha@student.uni.ac.id", phone: "083345678901", alamat: "Jl. Kemang Raya No. 88, Jakarta Selatan", sks: 20, dosenWali: "Dr. Hendra Gunawan" },
];

const jadwalHariIni = [
  { waktu: "07:30", selesai: "09:10", matkul: "Algoritma & Pemrograman", dosen: "Dr. Hendra Gunawan", ruang: "Lab A-301", jurusan: "TI" },
  { waktu: "09:30", selesai: "11:10", matkul: "Basis Data Lanjut", dosen: "Dr. Ratna Dewi, M.Kom", ruang: "Gedung B-205", jurusan: "SI" },
  { waktu: "13:00", selesai: "14:40", matkul: "Jaringan Komputer", dosen: "Ir. Eko Santoso, M.T.", ruang: "Lab A-102", jurusan: "TI" },
  { waktu: "15:00", selesai: "16:40", matkul: "Manajemen Proyek TI", dosen: "Dr. Indah Kurniawati", ruang: "Gedung C-310", jurusan: "SI" },
];

const pengumuman = [
  { judul: "Pendaftaran KRS Semester Genap 2023/2024", waktu: "2 jam lalu", penting: true },
  { judul: "Jadwal UTS Semester Ganjil telah diumumkan", waktu: "5 jam lalu", penting: true },
  { judul: "Workshop AI & Machine Learning — Sabtu, 30 Des", waktu: "1 hari lalu", penting: false },
  { judul: "Pengumuman Beasiswa Bidikmisi Periode II", waktu: "2 hari lalu", penting: false },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Mahasiswa", id: "mahasiswa" },
  { icon: GraduationCap, label: "Dosen", id: "dosen" },
  { icon: BookOpen, label: "Mata Kuliah", id: "matkul" },
  { icon: Calendar, label: "Jadwal", id: "jadwal" },
  { icon: ClipboardList, label: "Nilai & KRS", id: "nilai" },
  { icon: CreditCard, label: "Pembayaran", id: "pembayaran" },
  { icon: BarChart3, label: "Laporan", id: "laporan" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusStyle: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cuti: "bg-amber-50 text-amber-700 border-amber-200",
  Lulus: "bg-blue-50 text-blue-700 border-blue-200",
  "Drop Out": "bg-red-50 text-red-600 border-red-200",
};

const alertConfig: Record<AlertType, { icon: any; bg: string; border: string; title: string; iconColor: string }> = {
  success: { icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-800", iconColor: "text-emerald-500" },
  error:   { icon: XCircle,      bg: "bg-red-50",     border: "border-red-200",     title: "text-red-800",     iconColor: "text-red-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50",  border: "border-amber-200",   title: "text-amber-800",   iconColor: "text-amber-500" },
  info:    { icon: Info,          bg: "bg-blue-50",    border: "border-blue-200",    title: "text-blue-800",    iconColor: "text-blue-500" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-mono font-semibold">{p.value}</span></p>
      ))}
    </div>
  );
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── ALERT TOAST ─────────────────────────────────────────────────────────────

function AlertToast({ alert, onDismiss }: { alert: Alert; onDismiss: (id: number) => void }) {
  const cfg = alertConfig[alert.type];
  const Icon = cfg.icon;
  useEffect(() => {
    const t = setTimeout(() => onDismiss(alert.id), 4000);
    return () => clearTimeout(t);
  }, [alert.id, onDismiss]);
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg max-w-sm w-full ${cfg.bg} ${cfg.border} animate-in slide-in-from-right-4`}
      style={{ animation: "slideInRight 0.25s ease" }}>
      <Icon size={16} className={`mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${cfg.title}`}>{alert.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{alert.message}</p>
      </div>
      <button onClick={() => onDismiss(alert.id)} className="opacity-40 hover:opacity-80 transition-opacity flex-shrink-0">
        <X size={13} />
      </button>
    </div>
  );
}

// ─── INLINE ALERT BANNER ─────────────────────────────────────────────────────

function AlertBanner({ type, title, message, onDismiss }: { type: AlertType; title: string; message: string; onDismiss?: () => void }) {
  const cfg = alertConfig[type];
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
      <Icon size={15} className={`mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
      <div className="flex-1">
        <p className={`text-xs font-semibold ${cfg.title}`}>{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-40 hover:opacity-80 transition-opacity">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ─── MODAL: DETAIL MAHASISWA ──────────────────────────────────────────────────

function ModalDetailMahasiswa({ mhs, onClose, onEdit, onDelete }: {
  mhs: Mahasiswa; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: "modalIn 0.2s ease" }}
      >
        {/* Header */}
        <div className="relative bg-primary px-6 pt-6 pb-10">
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={14} className="text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {initials(mhs.nama)}
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight" style={{ fontFamily: "var(--font-display)" }}>{mhs.nama}</h2>
              <p className="text-white/70 text-xs mt-0.5 font-mono">{mhs.nim}</p>
              <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 border ${statusStyle[mhs.status]}`}>
                <Dot size={12} className="-ml-1" />{mhs.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 -mt-5 mx-5 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {[
            { label: "IPK", value: mhs.ipk.toFixed(2), color: mhs.ipk >= 3.5 ? "text-emerald-600" : mhs.ipk >= 3.0 ? "text-primary" : "text-amber-600" },
            { label: "SKS", value: mhs.sks.toString(), color: "text-foreground" },
            { label: "Angkatan", value: mhs.angkatan, color: "text-foreground" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center py-3 border-r border-border last:border-r-0">
              <p className={`text-lg font-bold font-mono ${s.color}`} style={{ fontFamily: "var(--font-mono)" }}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info rows */}
        <div className="px-5 py-4 space-y-3 mt-1">
          {[
            { icon: BookOpen, label: "Program Studi", value: mhs.jurusan },
            { icon: UserCheck, label: "Dosen Wali", value: mhs.dosenWali },
            { icon: Mail, label: "Email", value: mhs.email },
            { icon: Phone, label: "Telepon", value: mhs.phone },
            { icon: MapPin, label: "Alamat", value: mhs.alamat },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <row.icon size={12} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{row.label}</p>
                <p className="text-xs text-foreground font-medium mt-0.5 truncate">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2 border-t border-border pt-4">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Edit size={13} /> Edit Data
          </button>
          <button onClick={onDelete} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 bg-red-50 text-xs font-semibold hover:bg-red-100 transition-colors">
            <Trash2 size={13} /> Hapus
          </button>
          <button onClick={onClose} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground text-xs font-semibold hover:bg-secondary transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: KONFIRMASI HAPUS ──────────────────────────────────────────────────

function ModalKonfirmasi({ nama, onConfirm, onCancel }: { nama: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border p-6"
        onClick={e => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s ease" }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <ShieldAlert size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Hapus Data Mahasiswa?</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Data <span className="font-semibold text-foreground">{nama}</span> akan dihapus permanen dan tidak dapat dikembalikan.
            </p>
          </div>
          <AlertBanner type="warning" title="Perhatian" message="Seluruh riwayat akademik mahasiswa ini juga akan terhapus." />
          <div className="flex gap-2 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors">
              Batalkan
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5">
              <Trash2 size={12} /> Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: TAMBAH MAHASISWA ──────────────────────────────────────────────────

function ModalTambahMahasiswa({ onClose, onSave }: { onClose: () => void; onSave: (data: Partial<Mahasiswa>) => void }) {
  const [form, setForm] = useState({ nim: "", nama: "", jurusan: "Teknik Informatika", angkatan: "2023", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nim.trim()) e.nim = "NIM wajib diisi";
    if (!form.nama.trim()) e.nama = "Nama wajib diisi";
    if (!form.email.includes("@")) e.email = "Format email tidak valid";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, ipk: 0, status: "Aktif", sks: 0, alamat: "-", dosenWali: "-" });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden"
        onClick={e => e.stopPropagation()} style={{ animation: "modalIn 0.2s ease" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Tambah Mahasiswa Baru</h2>
            <p className="text-xs text-muted-foreground">Isi data mahasiswa dengan lengkap dan benar</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <X size={13} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <AlertBanner type="info" title="Informasi" message="NIM akan digunakan sebagai identitas unik mahasiswa dan tidak dapat diubah." />
          {[
            { key: "nim", label: "NIM", placeholder: "Contoh: 2310001", type: "text" },
            { key: "nama", label: "Nama Lengkap", placeholder: "Nama sesuai KTP", type: "text" },
            { key: "email", label: "Email Kampus", placeholder: "nim@student.uni.ac.id", type: "email" },
            { key: "phone", label: "Nomor Telepon", placeholder: "08xxxxxxxxxx", type: "tel" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-foreground mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: "" })); }}
                placeholder={f.placeholder}
                className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-all bg-background placeholder:text-muted-foreground ${
                  errors[f.key] ? "border-red-300 focus:ring-red-200" : "border-border focus:ring-primary/20 focus:border-primary"
                }`}
              />
              {errors[f.key] && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><XCircle size={10} />{errors[f.key]}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Program Studi</label>
              <select value={form.jurusan} onChange={e => setForm(p => ({ ...p, jurusan: e.target.value }))}
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background transition-all">
                {["Teknik Informatika", "Sistem Informasi", "Manajemen Bisnis", "Teknik Elektro"].map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Angkatan</label>
              <select value={form.angkatan} onChange={e => setForm(p => ({ ...p, angkatan: e.target.value }))}
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background transition-all">
                {["2023", "2022", "2021", "2020"].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-2 border-t border-border pt-4">
          <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Check size={13} /> Simpan Data
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TABLE PAGE ───────────────────────────────────────────────────────────────

type SortKey = keyof Pick<Mahasiswa, "nim" | "nama" | "jurusan" | "angkatan" | "ipk" | "sks" | "status">;

function MahasiswaTable({ pushAlert }: { pushAlert: (a: Omit<Alert, "id">) => void }) {
  const [data, setData] = useState(MAHASISWA_DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterJurusan, setFilterJurusan] = useState("Semua");
  const [sortKey, setSortKey] = useState<SortKey>("nim");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailMhs, setDetailMhs] = useState<Mahasiswa | null>(null);
  const [deleteMhs, setDeleteMhs] = useState<Mahasiswa | null>(null);
  const [showTambah, setShowTambah] = useState(false);
  const [showBannerInfo, setShowBannerInfo] = useState(true);
  const PER_PAGE = 6;

  const filtered = data
    .filter(m => filterStatus === "Semua" || m.status === filterStatus)
    .filter(m => filterJurusan === "Semua" || m.jurusan === filterJurusan)
    .filter(m => !search || m.nama.toLowerCase().includes(search.toLowerCase()) || m.nim.includes(search))
    .sort((a, b) => {
      if (!sortDir) return 0;
      const av = a[sortKey]; const bv = b[sortKey];
      const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : d === "desc" ? null : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown size={11} className="text-muted-foreground/40" />;
    if (sortDir === "asc") return <ChevronUp size={11} className="text-primary" />;
    if (sortDir === "desc") return <ChevronDown size={11} className="text-primary" />;
    return <ChevronsUpDown size={11} className="text-muted-foreground/40" />;
  };

  const toggleSelect = (nim: string) => setSelected(s => { const n = new Set(s); n.has(nim) ? n.delete(nim) : n.add(nim); return n; });
  const toggleAll = () => setSelected(s => s.size === paged.length ? new Set() : new Set(paged.map(m => m.nim)));

  const handleDelete = (mhs: Mahasiswa) => {
    setData(d => d.filter(m => m.nim !== mhs.nim));
    setDeleteMhs(null);
    setDetailMhs(null);
    pushAlert({ type: "success", title: "Data Dihapus", message: `Data mahasiswa ${mhs.nama} berhasil dihapus.` });
  };

  const handleSave = (form: Partial<Mahasiswa>) => {
    if (data.find(m => m.nim === form.nim)) {
      pushAlert({ type: "error", title: "NIM Sudah Ada", message: `NIM ${form.nim} sudah terdaftar di sistem.` });
      return;
    }
    setData(d => [form as Mahasiswa, ...d]);
    setShowTambah(false);
    pushAlert({ type: "success", title: "Mahasiswa Ditambahkan", message: `${form.nama} berhasil didaftarkan sebagai mahasiswa baru.` });
  };

  const handleBulkDelete = () => {
    setData(d => d.filter(m => !selected.has(m.nim)));
    const count = selected.size;
    setSelected(new Set());
    pushAlert({ type: "warning", title: "Data Dihapus", message: `${count} data mahasiswa berhasil dihapus.` });
  };

  const jurusanList = ["Semua", ...Array.from(new Set(MAHASISWA_DATA.map(m => m.jurusan)))];

  return (
    <>
      <div className="space-y-4">
        {/* Inline banners */}
        <div className="space-y-2">
          {showBannerInfo && (
            <AlertBanner type="info" title="Mode Kelola Data"
              message="Anda dapat memilih beberapa baris sekaligus untuk aksi massal seperti hapus atau ekspor data."
              onDismiss={() => setShowBannerInfo(false)} />
          )}
        </div>

        {/* Toolbar */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Cari nama atau NIM..."
                  className="pl-8 pr-3 py-2 text-xs bg-background border border-border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground" />
              </div>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className="px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {["Semua", "Aktif", "Cuti", "Lulus", "Drop Out"].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterJurusan} onChange={e => { setFilterJurusan(e.target.value); setPage(1); }}
                className="px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {jurusanList.map(j => <option key={j}>{j}</option>)}
              </select>
              <span className="text-xs text-muted-foreground font-mono">{filtered.length} data</span>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={12} /> Hapus ({selected.size})
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground bg-secondary border border-border rounded-lg hover:text-foreground transition-colors">
                <Download size={12} /> Export
              </button>
              <button onClick={() => setShowTambah(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                <Plus size={12} /> Tambah
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={selected.size === paged.length && paged.length > 0}
                      onChange={toggleAll}
                      className="rounded border-border w-3.5 h-3.5 accent-primary" />
                  </th>
                  {([
                    { key: "nim", label: "NIM" },
                    { key: "nama", label: "Nama" },
                    { key: "jurusan", label: "Program Studi" },
                    { key: "angkatan", label: "Angkatan" },
                    { key: "ipk", label: "IPK" },
                    { key: "sks", label: "SKS" },
                    { key: "status", label: "Status" },
                  ] as { key: SortKey; label: string }[]).map(col => (
                    <th key={col.key} className="px-4 py-3 text-left">
                      <button onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}>
                        {col.label} <SortIcon col={col.key} />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-xs text-muted-foreground">
                    <Search size={24} className="mx-auto mb-2 opacity-30" />
                    Tidak ada data ditemukan
                  </td></tr>
                ) : paged.map(m => (
                  <tr key={m.nim} className={`hover:bg-secondary/40 transition-colors group ${selected.has(m.nim) ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(m.nim)} onChange={() => toggleSelect(m.nim)}
                        className="rounded border-border w-3.5 h-3.5 accent-primary" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-mono text-muted-foreground">{m.nim}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                          {initials(m.nama)}
                        </div>
                        <span className="text-xs font-medium text-foreground">{m.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{m.jurusan}</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-xs font-mono text-foreground">{m.angkatan}</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-mono font-bold ${m.ipk >= 3.5 ? "text-emerald-600" : m.ipk >= 3.0 ? "text-primary" : m.ipk > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {m.ipk > 0 ? m.ipk.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono text-muted-foreground">{m.sks > 0 ? m.sks : "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[m.status]}`}>
                        <Dot size={12} className="-ml-1" />{m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailMhs(m)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
                          <Eye size={13} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeleteMhs(m)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={13} className="text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} data
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ArrowLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-colors ${p === page ? "bg-primary text-white" : "border border-border text-muted-foreground hover:bg-secondary"}`}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {detailMhs && (
        <ModalDetailMahasiswa mhs={detailMhs} onClose={() => setDetailMhs(null)}
          onEdit={() => { pushAlert({ type: "info", title: "Mode Edit", message: "Fitur edit sedang dalam pengembangan." }); setDetailMhs(null); }}
          onDelete={() => { setDeleteMhs(detailMhs); setDetailMhs(null); }} />
      )}
      {deleteMhs && (
        <ModalKonfirmasi nama={deleteMhs.nama} onCancel={() => setDeleteMhs(null)} onConfirm={() => handleDelete(deleteMhs)} />
      )}
      {showTambah && (
        <ModalTambahMahasiswa onClose={() => setShowTambah(false)} onSave={handleSave} />
      )}
    </>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, change, changeType, color }: {
  icon: any; label: string; value: string; change: string; changeType: "up" | "down"; color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${changeType === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
          {changeType === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{change}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col z-20"
      style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}>
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <BookMarked size={15} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>SIAKAD</p>
            <p className="text-[10px]" style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}>UNI NUSANTARA</p>
          </div>
        </div>
      </div>
      <p className="px-6 text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>Menu Utama</p>
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150 group ${isActive ? "bg-primary text-white font-medium" : "hover:bg-sidebar-accent"}`}
              style={!isActive ? { color: "var(--sidebar-foreground)" } : {}}>
              <Icon size={16} className={isActive ? "text-white" : "opacity-60 group-hover:opacity-100"} />
              <span>{label}</span>
              {isActive && <ChevronRight size={12} className="ml-auto" />}
            </button>
          );
        })}
        <div className="my-3 border-t" style={{ borderColor: "var(--sidebar-border)" }} />
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>Sistem</p>
        <button onClick={() => setActive("settings")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150 hover:bg-sidebar-accent"
          style={{ color: "var(--sidebar-foreground)" }}>
          <Settings size={16} className="opacity-60" /><span>Pengaturan</span>
        </button>
      </nav>
      <div className="mx-3 mb-4 p-3 rounded-xl" style={{ background: "var(--sidebar-accent)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Admin Akademik</p>
            <p className="text-[10px] truncate" style={{ color: "var(--sidebar-foreground)", opacity: 0.6 }}>admin@uninusantara.ac.id</p>
          </div>
          <button className="opacity-40 hover:opacity-80 transition-opacity"><LogOut size={14} style={{ color: "var(--sidebar-foreground)" }} /></button>
        </div>
      </div>
    </aside>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Mahasiswa Aktif" value="4.287" change="+8.2%" changeType="up" color="bg-primary" />
        <StatCard icon={UserCheck} label="Total Dosen Aktif" value="312" change="+3.1%" changeType="up" color="bg-indigo-500" />
        <StatCard icon={BookOpen} label="Mata Kuliah Aktif" value="186" change="+12" changeType="up" color="bg-sky-500" />
        <StatCard icon={Award} label="IPK Rata-rata" value="3.47" change="-0.04" changeType="down" color="bg-violet-500" />
      </section>

      <section className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Tren Pendaftaran Mahasiswa</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Jumlah mahasiswa per semester akademik</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg hover:text-foreground transition-colors">
              <Filter size={12} /> Filter
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enrollmentData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="sem" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
              <Bar dataKey="mhs" name="Mahasiswa" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Distribusi Jurusan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Persentase per program studi</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={jurusanData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {jurusanData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {jurusanData.map(j => (
              <div key={j.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: j.color }}></span>
                  <span className="text-xs text-muted-foreground truncate max-w-[130px]">{j.name}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-foreground">{j.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Tren IPK</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Rata-rata IPK 2023</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={10} /> +0.13
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={ipkTrendData}>
              <defs>
                <linearGradient id="ipkGradDash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="bln" tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.0, 3.6]} tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ipk" name="IPK" stroke="#6366F1" strokeWidth={2} fill="url(#ipkGradDash)" dot={{ r: 3, fill: "#6366F1" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Jadwal Perkuliahan Hari Ini</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Kamis, 26 Desember 2024</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
              Lihat Semua <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {jadwalHariIni.map((j, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary hover:bg-muted transition-colors">
                <div className="flex-shrink-0 text-right w-[72px]">
                  <p className="text-xs font-mono font-semibold text-foreground">{j.waktu}</p>
                  <p className="text-[10px] text-muted-foreground">{j.selesai}</p>
                </div>
                <div className="w-px h-8 bg-border flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{j.matkul}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{j.dosen}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Building2 size={10} />{j.ruang}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Data Mahasiswa Terkini</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">Lihat semua <ChevronRight size={12} /></button>
          </div>
          <table className="w-full">
            <thead><tr className="bg-muted/50">
              {["NIM", "Nama", "Jurusan", "IPK", "Status"].map(h => (
                <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {MAHASISWA_DATA.slice(0, 6).map(m => (
                <tr key={m.nim} className="hover:bg-secondary/60 transition-colors">
                  <td className="px-5 py-3"><span className="text-xs font-mono text-muted-foreground">{m.nim}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">{initials(m.nama)}</div>
                      <span className="text-xs font-medium text-foreground">{m.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="text-xs text-muted-foreground">{m.jurusan}</span></td>
                  <td className="px-5 py-3"><span className={`text-xs font-mono font-semibold ${m.ipk >= 3.5 ? "text-emerald-600" : "text-primary"}`}>{m.ipk.toFixed(2)}</span></td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[m.status]}`}>
                      <Dot size={12} className="-ml-1" />{m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Pengumuman</h2>
          </div>
          <div className="divide-y divide-border">
            {pengumuman.map((p, i) => (
              <div key={i} className="px-5 py-3.5 hover:bg-secondary/50 transition-colors cursor-pointer group">
                <div className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${p.penting ? "bg-red-500" : "bg-muted-foreground/40"}`} />
                  <div>
                    <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors">{p.judul}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Clock size={9} /> {p.waktu}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Aksi Cepat</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ClipboardList, label: "Input Nilai", color: "text-blue-600 bg-blue-50" },
                { icon: Calendar, label: "Buat Jadwal", color: "text-indigo-600 bg-indigo-50" },
                { icon: Users, label: "Tambah MHS", color: "text-sky-600 bg-sky-50" },
                { icon: BarChart3, label: "Cetak Laporan", color: "text-violet-600 bg-violet-50" },
              ].map(({ icon: Icon, label, color }) => (
                <button key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={14} /></div>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertId, setAlertId] = useState(0);

  const pushAlert = useCallback((a: Omit<Alert, "id">) => {
    setAlertId(n => {
      const id = n + 1;
      setAlerts(prev => [...prev.slice(-3), { ...a, id }]);
      return id;
    });
  }, []);

  const dismissAlert = useCallback((id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const pageTitle: Record<string, string> = {
    dashboard: "Dashboard",
    mahasiswa: "Data Mahasiswa",
    dosen: "Data Dosen",
    matkul: "Mata Kuliah",
    jadwal: "Jadwal",
    nilai: "Nilai & KRS",
    pembayaran: "Pembayaran",
    laporan: "Laporan",
    settings: "Pengaturan",
  };

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Keyframes */}
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <Sidebar active={activeNav} setActive={setActiveNav} />

      <main className="ml-[240px] flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-8 h-16">
            <div>
              <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {pageTitle[activeNav] || "Dashboard"}
              </h1>
              <p className="text-xs text-muted-foreground">{dateStr}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Cari mahasiswa, matkul..."
                  className="pl-8 pr-4 py-2 text-xs bg-card border border-border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground" />
              </div>
              <button className="relative w-9 h-9 bg-card border border-border rounded-lg flex items-center justify-center hover:border-primary/30 transition-colors">
                <Bell size={15} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => pushAlert({ type: "info", title: "Semester Aktif", message: "Semester Ganjil 2023/2024 sedang berjalan." })}
                className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium hover:border-primary/30 transition-colors">
                <span className="text-foreground">Sem. Ganjil 2023/2024</span>
                <ChevronDown size={12} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          {activeNav === "dashboard" && <DashboardPage />}
          {activeNav === "mahasiswa" && <MahasiswaTable pushAlert={pushAlert} />}
          {!["dashboard", "mahasiswa"].includes(activeNav) && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                {(() => { const item = navItems.find(n => n.id === activeNav); return item ? <item.icon size={22} className="text-muted-foreground" /> : null; })()}
              </div>
              <p className="text-sm font-semibold text-foreground">{pageTitle[activeNav]}</p>
              <p className="text-xs text-muted-foreground">Halaman ini sedang dalam pengembangan</p>
              <button onClick={() => pushAlert({ type: "warning", title: "Fitur Belum Tersedia", message: `Halaman ${pageTitle[activeNav]} sedang dalam pengembangan.` })}
                className="mt-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Notifikasi Saya
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Alert Toast Stack */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {alerts.map(a => <AlertToast key={a.id} alert={a} onDismiss={dismissAlert} />)}
      </div>
    </div>
  );
}
