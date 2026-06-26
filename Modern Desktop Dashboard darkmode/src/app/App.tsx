import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  CreditCard, BarChart3, Settings, Bell, Search, ChevronDown,
  TrendingUp, TrendingDown, GraduationCap, Award, LogOut,
  ChevronRight, ArrowUpRight, MoreHorizontal, Filter, Download,
  Dot, UserCheck, BookMarked, Building2, Clock, X, Check,
  AlertTriangle, Info, CheckCircle2, XCircle, Edit, Trash2,
  Eye, Mail, Phone, MapPin, ChevronUp, ChevronsUpDown,
  ArrowLeft, ArrowRight, Plus, ShieldAlert, Zap, Activity,
  Star, Target, TrendingUp as TrendUp
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from "recharts";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type AlertType = "success" | "error" | "warning" | "info";
type SortDir = "asc" | "desc" | null;

interface Alert { id: number; type: AlertType; title: string; message: string; }
interface Mahasiswa {
  nim: string; nama: string; jurusan: string; angkatan: string; ipk: number;
  status: "Aktif" | "Cuti" | "Lulus" | "Drop Out";
  email: string; phone: string; alamat: string; sks: number; dosenWali: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const enrollmentData = [
  { sem: "20/1", mhs: 412 }, { sem: "20/2", mhs: 389 },
  { sem: "21/1", mhs: 478 }, { sem: "21/2", mhs: 521 },
  { sem: "22/1", mhs: 596 }, { sem: "22/2", mhs: 548 },
  { sem: "23/1", mhs: 634 }, { sem: "23/2", mhs: 712 },
];

const ipkTrendData = [
  { bln: "Jan", ipk: 3.21 }, { bln: "Feb", ipk: 3.18 }, { bln: "Mar", ipk: 3.35 },
  { bln: "Apr", ipk: 3.29 }, { bln: "Mei", ipk: 3.42 }, { bln: "Jun", ipk: 3.38 },
  { bln: "Jul", ipk: 3.51 }, { bln: "Agu", ipk: 3.47 },
];

const jurusanData = [
  { name: "Teknik Informatika", value: 34, color: "#4F8EFF" },
  { name: "Sistem Informasi", value: 28, color: "#8B5CF6" },
  { name: "Manajemen Bisnis", value: 22, color: "#06D6C7" },
  { name: "Teknik Elektro", value: 16, color: "#34D399" },
];

const performanceData = [
  { subject: "TI", A: 92, fullMark: 100 },
  { subject: "SI", A: 87, fullMark: 100 },
  { subject: "MB", A: 78, fullMark: 100 },
  { subject: "TE", A: 83, fullMark: 100 },
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
  { waktu: "07:30", selesai: "09:10", matkul: "Algoritma & Pemrograman", dosen: "Dr. Hendra Gunawan", ruang: "Lab A-301", tag: "TI", color: "#4F8EFF" },
  { waktu: "09:30", selesai: "11:10", matkul: "Basis Data Lanjut", dosen: "Dr. Ratna Dewi, M.Kom", ruang: "Gedung B-205", tag: "SI", color: "#8B5CF6" },
  { waktu: "13:00", selesai: "14:40", matkul: "Jaringan Komputer", dosen: "Ir. Eko Santoso, M.T.", ruang: "Lab A-102", tag: "TI", color: "#4F8EFF" },
  { waktu: "15:00", selesai: "16:40", matkul: "Manajemen Proyek TI", dosen: "Dr. Indah Kurniawati", ruang: "Gedung C-310", tag: "SI", color: "#8B5CF6" },
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

const statusStyle: Record<string, { dot: string; bg: string; text: string }> = {
  Aktif:     { dot: "#34D399", bg: "rgba(52,211,153,0.12)",  text: "#34D399" },
  Cuti:      { dot: "#F59E0B", bg: "rgba(245,158,11,0.12)",  text: "#F59E0B" },
  Lulus:     { dot: "#4F8EFF", bg: "rgba(79,142,255,0.12)",  text: "#4F8EFF" },
  "Drop Out":{ dot: "#FF4D6A", bg: "rgba(255,77,106,0.12)", text: "#FF4D6A" },
};

const alertConfig: Record<AlertType, { icon: any; border: string; bg: string; titleColor: string; iconColor: string }> = {
  success: { icon: CheckCircle2, border: "rgba(52,211,153,0.3)",  bg: "rgba(52,211,153,0.08)",  titleColor: "#34D399", iconColor: "#34D399" },
  error:   { icon: XCircle,      border: "rgba(255,77,106,0.3)",  bg: "rgba(255,77,106,0.08)",  titleColor: "#FF4D6A", iconColor: "#FF4D6A" },
  warning: { icon: AlertTriangle,border: "rgba(245,158,11,0.3)",  bg: "rgba(245,158,11,0.08)",  titleColor: "#F59E0B", iconColor: "#F59E0B" },
  info:    { icon: Info,          border: "rgba(79,142,255,0.3)",  bg: "rgba(79,142,255,0.08)",  titleColor: "#4F8EFF", iconColor: "#4F8EFF" },
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const GlassCard = ({ children, className = "", glow }: { children: React.ReactNode; className?: string; glow?: string }) => (
  <div
    className={`rounded-2xl border ${className}`}
    style={{
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
      boxShadow: glow ? `0 0 40px -10px ${glow}` : "0 4px 24px rgba(0,0,0,0.4)",
    }}
  >
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl text-xs" style={{ background: "#0F1520", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
      <p className="text-[#8899BB] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono font-semibold" style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  );
};

// ─── ALERT TOAST ─────────────────────────────────────────────────────────────

function AlertToast({ alert, onDismiss }: { alert: Alert; onDismiss: (id: number) => void }) {
  const cfg = alertConfig[alert.type];
  const Icon = cfg.icon;
  useEffect(() => {
    const t = setTimeout(() => onDismiss(alert.id), 4500);
    return () => clearTimeout(t);
  }, [alert.id, onDismiss]);
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl max-w-xs w-full"
      style={{ background: "#0F1520", border: `1px solid ${cfg.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px -5px ${cfg.iconColor}40`, animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <Icon size={15} className="mt-0.5 flex-shrink-0" style={{ color: cfg.iconColor }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: cfg.titleColor }}>{alert.title}</p>
        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "#6B7FA3" }}>{alert.message}</p>
      </div>
      <button onClick={() => onDismiss(alert.id)} className="opacity-30 hover:opacity-70 transition-opacity mt-0.5">
        <X size={12} style={{ color: "#F0F4FF" }} />
      </button>
    </div>
  );
}

function AlertBanner({ type, title, message, onDismiss }: { type: AlertType; title: string; message: string; onDismiss?: () => void }) {
  const cfg = alertConfig[type];
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: cfg.iconColor }} />
      <div className="flex-1">
        <p className="text-xs font-semibold" style={{ color: cfg.titleColor }}>{title}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#6B7FA3" }}>{message}</p>
      </div>
      {onDismiss && <button onClick={onDismiss} className="opacity-30 hover:opacity-70 transition-opacity"><X size={12} style={{ color: "#F0F4FF" }} /></button>}
    </div>
  );
}

// ─── MODAL: DETAIL MAHASISWA ──────────────────────────────────────────────────

function ModalDetailMahasiswa({ mhs, onClose, onEdit, onDelete }: { mhs: Mahasiswa; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const st = statusStyle[mhs.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(4,6,9,0.85)", backdropFilter: "blur(16px)" }} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ background: "#0A0E1A", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 60px -20px #4F8EFF40", animation: "modalIn 0.25s cubic-bezier(0.34,1.3,0.64,1)" }}>

        {/* Hero header with gradient */}
        <div className="relative px-6 pt-7 pb-12 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #4F8EFF18 0%, #8B5CF618 100%)" }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, #4F8EFF20 0%, transparent 70%)" }} />
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <X size={13} style={{ color: "#8899BB" }} />
          </button>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4F8EFF, #8B5CF6)", boxShadow: "0 8px 24px #4F8EFF40", fontFamily: "var(--font-display)" }}>
              {initials(mhs.nama)}
            </div>
            <div>
              <h2 className="font-bold text-base text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>{mhs.nama}</h2>
              <p className="text-xs mt-0.5 font-mono" style={{ color: "#6B7FA3" }}>{mhs.nim}</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full mt-2"
                style={{ background: st.bg, color: st.text, border: `1px solid ${st.dot}30` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                {mhs.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 -mt-6 mx-5 rounded-2xl overflow-hidden" style={{ background: "#10141F", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { label: "IPK", value: mhs.ipk.toFixed(2), color: mhs.ipk >= 3.5 ? "#34D399" : mhs.ipk >= 3.0 ? "#4F8EFF" : "#F59E0B" },
            { label: "SKS", value: String(mhs.sks), color: "#F0F4FF" },
            { label: "Angkatan", value: mhs.angkatan, color: "#F0F4FF" },
          ].map((s, i) => (
            <div key={s.label} className="flex flex-col items-center py-3.5" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <p className="text-lg font-bold font-mono" style={{ color: s.color, fontFamily: "var(--font-mono)" }}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#4B5A7A" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="px-5 py-5 space-y-3">
          {[
            { icon: BookOpen, label: "Program Studi", value: mhs.jurusan },
            { icon: UserCheck, label: "Dosen Wali", value: mhs.dosenWali },
            { icon: Mail, label: "Email", value: mhs.email },
            { icon: Phone, label: "Telepon", value: mhs.phone },
            { icon: MapPin, label: "Alamat", value: mhs.alamat },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(79,142,255,0.1)", border: "1px solid rgba(79,142,255,0.2)" }}>
                <row.icon size={12} style={{ color: "#4F8EFF" }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#4B5A7A" }}>{row.label}</p>
                <p className="text-xs font-medium mt-0.5 text-white">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4F8EFF, #7B6EFF)" }}>
            <Edit size={12} /> Edit Data
          </button>
          <button onClick={onDelete} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-red-500/20"
            style={{ border: "1px solid rgba(255,77,106,0.3)", color: "#FF4D6A", background: "rgba(255,77,106,0.08)" }}>
            <Trash2 size={12} /> Hapus
          </button>
          <button onClick={onClose} className="flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7FA3", background: "rgba(255,255,255,0.04)" }}>
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
    const h = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0" style={{ background: "rgba(4,6,9,0.9)", backdropFilter: "blur(16px)" }} />
      <div className="relative w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}
        style={{ background: "#0A0E1A", border: "1px solid rgba(255,77,106,0.2)", boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 40px -10px #FF4D6A30", animation: "modalIn 0.2s ease" }}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)", boxShadow: "0 0 30px -5px #FF4D6A40" }}>
            <ShieldAlert size={26} style={{ color: "#FF4D6A" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Hapus Data Mahasiswa?</h3>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "#6B7FA3" }}>
              Data <span className="text-white font-semibold">{nama}</span> akan dihapus permanen.
            </p>
          </div>
          <AlertBanner type="warning" title="Tindakan ini tidak bisa dibatalkan" message="Seluruh riwayat akademik akan ikut terhapus." />
          <div className="flex gap-2 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7FA3" }}>
              Batalkan
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #FF4D6A, #FF2D55)" }}>
              <Trash2 size={12} /> Hapus Sekarang
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
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const inputStyle = (key: string) => ({
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${errors[key] ? "rgba(255,77,106,0.5)" : "rgba(255,255,255,0.08)"}`,
    color: "#F0F4FF",
    outline: "none",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(4,6,9,0.85)", backdropFilter: "blur(16px)" }} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ background: "#0A0E1A", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)", animation: "modalIn 0.25s cubic-bezier(0.34,1.3,0.64,1)" }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Tambah Mahasiswa Baru</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "#4B5A7A" }}>Isi data dengan lengkap dan benar</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <X size={13} style={{ color: "#6B7FA3" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <AlertBanner type="info" title="Informasi" message="NIM digunakan sebagai identitas unik dan tidak dapat diubah setelah disimpan." />
          {[
            { key: "nim", label: "NIM", placeholder: "Contoh: 2310001" },
            { key: "nama", label: "Nama Lengkap", placeholder: "Nama sesuai KTP" },
            { key: "email", label: "Email Kampus", placeholder: "nim@student.uni.ac.id" },
            { key: "phone", label: "Nomor Telepon", placeholder: "08xxxxxxxxxx" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#4B5A7A" }}>{f.label}</label>
              <input
                value={(form as any)[f.key]}
                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: "" })); }}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl transition-all placeholder:opacity-30"
                style={inputStyle(f.key)}
                onFocus={e => e.currentTarget.style.border = "1px solid rgba(79,142,255,0.5)"}
                onBlur={e => e.currentTarget.style.border = `1px solid ${errors[f.key] ? "rgba(255,77,106,0.5)" : "rgba(255,255,255,0.08)"}`}
              />
              {errors[f.key] && <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "#FF4D6A" }}><XCircle size={10} />{errors[f.key]}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "jurusan", label: "Program Studi", options: ["Teknik Informatika", "Sistem Informasi", "Manajemen Bisnis", "Teknik Elektro"] },
              { key: "angkatan", label: "Angkatan", options: ["2023", "2022", "2021", "2020"] },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#4B5A7A" }}>{f.label}</label>
                <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl transition-all"
                  style={{ ...inputStyle(""), appearance: "none" }}>
                  {f.options.map(o => <option key={o} style={{ background: "#0A0E1A" }}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
          <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4F8EFF, #7B6EFF)" }}>
            <Check size={13} /> Simpan Data
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7FA3" }}>
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
  const [showBanner, setShowBanner] = useState(true);
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : d === "desc" ? null : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown size={10} style={{ color: "rgba(107,127,163,0.4)" }} />;
    if (sortDir === "asc") return <ChevronUp size={10} style={{ color: "#4F8EFF" }} />;
    if (sortDir === "desc") return <ChevronDown size={10} style={{ color: "#4F8EFF" }} />;
    return <ChevronsUpDown size={10} style={{ color: "rgba(107,127,163,0.4)" }} />;
  };

  const toggleSelect = (nim: string) => setSelected(s => { const n = new Set(s); n.has(nim) ? n.delete(nim) : n.add(nim); return n; });
  const toggleAll = () => setSelected(s => s.size === paged.length ? new Set() : new Set(paged.map(m => m.nim)));

  const handleDelete = (mhs: Mahasiswa) => {
    setData(d => d.filter(m => m.nim !== mhs.nim));
    setDeleteMhs(null); setDetailMhs(null);
    pushAlert({ type: "success", title: "Data Dihapus", message: `${mhs.nama} berhasil dihapus dari sistem.` });
  };

  const handleSave = (form: Partial<Mahasiswa>) => {
    if (data.find(m => m.nim === form.nim)) {
      pushAlert({ type: "error", title: "NIM Duplikat", message: `NIM ${form.nim} sudah terdaftar.` });
      return;
    }
    setData(d => [form as Mahasiswa, ...d]);
    setShowTambah(false);
    pushAlert({ type: "success", title: "Mahasiswa Ditambahkan", message: `${form.nama} berhasil didaftarkan.` });
  };

  const handleBulkDelete = () => {
    const count = selected.size;
    setData(d => d.filter(m => !selected.has(m.nim)));
    setSelected(new Set());
    pushAlert({ type: "warning", title: "Bulk Delete", message: `${count} data mahasiswa berhasil dihapus.` });
  };

  const jurusanList = ["Semua", ...Array.from(new Set(MAHASISWA_DATA.map(m => m.jurusan)))];

  const selectStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#F0F4FF",
    appearance: "none" as const,
  };

  return (
    <>
      <div className="space-y-4">
        {showBanner && (
          <AlertBanner type="info" title="Mode Kelola Data Mahasiswa"
            message="Pilih beberapa baris untuk aksi massal. Klik ikon mata untuk melihat detail, atau ikon hapus untuk menghapus data."
            onDismiss={() => setShowBanner(false)} />
        )}

        {/* Toolbar */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4B5A7A" }} />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Cari nama atau NIM..."
                  className="pl-8 pr-3 py-2 text-xs rounded-xl w-52 transition-all placeholder:opacity-30"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F4FF" }} />
              </div>
              {[
                { value: filterStatus, set: (v: string) => { setFilterStatus(v); setPage(1); }, options: ["Semua", "Aktif", "Cuti", "Lulus", "Drop Out"] },
                { value: filterJurusan, set: (v: string) => { setFilterJurusan(v); setPage(1); }, options: jurusanList },
              ].map((s, i) => (
                <select key={i} value={s.value} onChange={e => s.set(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl" style={selectStyle}>
                  {s.options.map(o => <option key={o} style={{ background: "#0A0E1A" }}>{o}</option>)}
                </select>
              ))}
              <span className="text-xs font-mono" style={{ color: "#4B5A7A" }}>{filtered.length} data</span>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all"
                  style={{ background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)", color: "#FF4D6A" }}>
                  <Trash2 size={12} /> Hapus ({selected.size})
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6B7FA3" }}>
                <Download size={12} /> Export
              </button>
              <button onClick={() => setShowTambah(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-xl transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #4F8EFF, #7B6EFF)" }}>
                <Plus size={12} /> Tambah
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                  <th className="w-10 px-4 py-3.5">
                    <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll}
                      className="rounded w-3.5 h-3.5 accent-blue-500" />
                  </th>
                  {([
                    { key: "nim", label: "NIM" }, { key: "nama", label: "Nama" }, { key: "jurusan", label: "Program Studi" },
                    { key: "angkatan", label: "Angkatan" }, { key: "ipk", label: "IPK" }, { key: "sks", label: "SKS" }, { key: "status", label: "Status" },
                  ] as { key: SortKey; label: string }[]).map(col => (
                    <th key={col.key} className="px-4 py-3.5 text-left">
                      <button onClick={() => handleSort(col.key)} className="flex items-center gap-1.5 transition-colors hover:text-white"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: "#4B5A7A", textTransform: "uppercase" }}>
                        {col.label} <SortIcon col={col.key} />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 w-16" />
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16">
                    <Search size={28} className="mx-auto mb-3 opacity-20" style={{ color: "#6B7FA3" }} />
                    <p className="text-xs" style={{ color: "#4B5A7A" }}>Tidak ada data ditemukan</p>
                  </td></tr>
                ) : paged.map((m, idx) => {
                  const st = statusStyle[m.status];
                  const isSelected = selected.has(m.nim);
                  return (
                    <tr key={m.nim}
                      className="group transition-all"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isSelected ? "rgba(79,142,255,0.06)" : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "rgba(79,142,255,0.06)" : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"; }}>
                      <td className="px-4 py-3.5">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(m.nim)} className="rounded w-3.5 h-3.5 accent-blue-500" />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-mono" style={{ color: "#4B5A7A", fontFamily: "var(--font-mono)" }}>{m.nim}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #4F8EFF30, #8B5CF630)", border: "1px solid rgba(79,142,255,0.2)", color: "#4F8EFF" }}>
                            {initials(m.nama)}
                          </div>
                          <span className="text-xs font-medium" style={{ color: "#E2E8F0" }}>{m.nama}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-xs" style={{ color: "#6B7FA3" }}>{m.jurusan}</span></td>
                      <td className="px-4 py-3.5 text-center"><span className="text-xs font-mono" style={{ color: "#8899BB", fontFamily: "var(--font-mono)" }}>{m.angkatan}</span></td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-xs font-mono font-bold" style={{ fontFamily: "var(--font-mono)", color: m.ipk >= 3.5 ? "#34D399" : m.ipk >= 3.0 ? "#4F8EFF" : m.ipk > 0 ? "#F59E0B" : "#4B5A7A" }}>
                          {m.ipk > 0 ? m.ipk.toFixed(2) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center"><span className="text-xs font-mono" style={{ color: "#6B7FA3", fontFamily: "var(--font-mono)" }}>{m.sks > 0 ? m.sks : "—"}</span></td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: st.bg, color: st.text, border: `1px solid ${st.dot}30` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setDetailMhs(m)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-blue-500/20"
                            style={{ border: "1px solid transparent" }} onMouseEnter={e => e.currentTarget.style.border = "1px solid rgba(79,142,255,0.3)"} onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}>
                            <Eye size={12} style={{ color: "#4F8EFF" }} />
                          </button>
                          <button onClick={() => setDeleteMhs(m)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                            style={{ border: "1px solid transparent" }} onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(255,77,106,0.3)"; e.currentTarget.style.background = "rgba(255,77,106,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.background = ""; }}>
                            <Trash2 size={12} style={{ color: "#FF4D6A" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-xs font-mono" style={{ color: "#4B5A7A", fontFamily: "var(--font-mono)" }}>
              {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-20"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7FA3" }}>
                <ArrowLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-all"
                  style={p === page ? { background: "linear-gradient(135deg, #4F8EFF, #7B6EFF)", color: "#fff" } : { border: "1px solid rgba(255,255,255,0.08)", color: "#4B5A7A" }}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-20"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7FA3" }}>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {detailMhs && <ModalDetailMahasiswa mhs={detailMhs} onClose={() => setDetailMhs(null)} onEdit={() => { pushAlert({ type: "info", title: "Edit Mode", message: "Fitur edit sedang dikembangkan." }); setDetailMhs(null); }} onDelete={() => { setDeleteMhs(detailMhs); setDetailMhs(null); }} />}
      {deleteMhs && <ModalKonfirmasi nama={deleteMhs.nama} onCancel={() => setDeleteMhs(null)} onConfirm={() => handleDelete(deleteMhs)} />}
      {showTambah && <ModalTambahMahasiswa onClose={() => setShowTambah(false)} onSave={handleSave} />}
    </>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-20"
      style={{ background: "var(--sidebar)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #4F8EFF, #8B5CF6)", boxShadow: "0 4px 12px #4F8EFF50" }}>
            <BookMarked size={14} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>SIAKAD</p>
            <p className="text-[9px] tracking-widest font-semibold uppercase" style={{ color: "#2A3A5C" }}>Uni Nusantara</p>
          </div>
        </div>
      </div>

      {/* Semester badge */}
      <div className="mx-4 mb-4 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: "rgba(79,142,255,0.1)", border: "1px solid rgba(79,142,255,0.15)" }}>
        <Zap size={11} style={{ color: "#4F8EFF" }} />
        <span className="text-[10px] font-semibold" style={{ color: "#4F8EFF" }}>Sem. Ganjil 2023/2024</span>
      </div>

      <p className="px-5 text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "#1E2D4A" }}>Navigasi</p>

      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => setActive(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 group relative"
              style={isActive ? {
                background: "linear-gradient(135deg, rgba(79,142,255,0.2), rgba(139,92,246,0.15))",
                border: "1px solid rgba(79,142,255,0.25)",
                color: "#F0F4FF",
              } : {
                color: "#3D5070",
                border: "1px solid transparent",
              }}>
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #4F8EFF, #8B5CF6)" }} />}
              <Icon size={15} style={{ color: isActive ? "#4F8EFF" : "#2A3A5C", transition: "color 0.15s" }} />
              <span className="text-xs font-medium">{label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#4F8EFF", boxShadow: "0 0 6px #4F8EFF" }} />}
            </button>
          );
        })}

        <div className="my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
        <p className="px-3 text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "#1E2D4A" }}>Sistem</p>
        <button onClick={() => setActive("settings")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
          style={{ color: "#3D5070", border: "1px solid transparent" }}>
          <Settings size={15} style={{ color: "#2A3A5C" }} />
          <span className="text-xs font-medium">Pengaturan</span>
        </button>
      </nav>

      {/* User */}
      <div className="m-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #4F8EFF, #8B5CF6)" }}>AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Admin Akademik</p>
            <p className="text-[9px] truncate" style={{ color: "#2A3A5C" }}>admin@uninusantara.ac.id</p>
          </div>
          <button className="opacity-30 hover:opacity-70 transition-opacity"><LogOut size={13} style={{ color: "#8899BB" }} /></button>
        </div>
      </div>
    </aside>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, change, changeType, gradient, glow }: {
  icon: any; label: string; value: string; change: string; changeType: "up" | "down"; gradient: string; glow: string;
}) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all hover:-translate-y-0.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", boxShadow: `0 4px 24px rgba(0,0,0,0.4)`, transition: "all 0.2s ease" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 40px -15px ${glow}`; e.currentTarget.style.borderColor = `${glow}30`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 transition-opacity group-hover:opacity-20" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: gradient, boxShadow: `0 4px 16px ${glow}50` }}>
            <Icon size={16} className="text-white" />
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-1 rounded-full"
            style={{ background: changeType === "up" ? "rgba(52,211,153,0.12)" : "rgba(255,77,106,0.12)", color: changeType === "up" ? "#34D399" : "#FF4D6A" }}>
            {changeType === "up" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{change}
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
        <p className="text-[11px] mt-1" style={{ color: "#4B5A7A" }}>{label}</p>
      </div>
    </div>
  );
}

function DashboardPage({ pushAlert }: { pushAlert: (a: Omit<Alert, "id">) => void }) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Mahasiswa Aktif" value="4.287" change="+8.2%" changeType="up" gradient="linear-gradient(135deg,#4F8EFF,#2563EB)" glow="#4F8EFF" />
        <StatCard icon={UserCheck} label="Dosen Aktif" value="312" change="+3.1%" changeType="up" gradient="linear-gradient(135deg,#8B5CF6,#6D28D9)" glow="#8B5CF6" />
        <StatCard icon={BookOpen} label="Mata Kuliah" value="186" change="+12" changeType="up" gradient="linear-gradient(135deg,#06D6C7,#0891B2)" glow="#06D6C7" />
        <StatCard icon={Award} label="IPK Rata-rata" value="3.47" change="-0.04" changeType="down" gradient="linear-gradient(135deg,#F59E0B,#D97706)" glow="#F59E0B" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Tren Pendaftaran</h2>
              <p className="text-[11px] mt-0.5" style={{ color: "#4B5A7A" }}>Jumlah mahasiswa per semester</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6B7FA3" }}>
              <Filter size={11} /> Filter
            </button>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={enrollmentData} barSize={26} barGap={4}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F8EFF" />
                  <stop offset="100%" stopColor="#4F8EFF" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="sem" tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#4B5A7A" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "#4B5A7A" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,142,255,0.06)" }} />
              <Bar dataKey="mhs" name="Mahasiswa" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Distribusi Jurusan</h2>
          <p className="text-[11px] mb-4" style={{ color: "#4B5A7A" }}>Per program studi</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={jurusanData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {jurusanData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: "#0A0E1A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {jurusanData.map(j => (
              <div key={j.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: j.color, boxShadow: `0 0 6px ${j.color}` }} />
                  <span className="text-[11px] truncate max-w-[120px]" style={{ color: "#6B7FA3" }}>{j.name}</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>{j.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* IPK Trend + Jadwal */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Tren IPK</h2>
              <p className="text-[11px] mt-0.5" style={{ color: "#4B5A7A" }}>Rata-rata IPK 2023</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "#34D399" }}>
              <TrendingUp size={9} />+0.13
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={ipkTrendData}>
              <defs>
                <linearGradient id="ipkGradMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="bln" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#4B5A7A" }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.0, 3.6]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#4B5A7A" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ipk" name="IPK" stroke="#8B5CF6" strokeWidth={2} fill="url(#ipkGradMain)" dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Jadwal */}
        <GlassCard className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Jadwal Hari Ini</h2>
              <p className="text-[11px] mt-0.5" style={{ color: "#4B5A7A" }}>Kamis, 26 Desember 2024 · {jadwalHariIni.length} sesi</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80" style={{ color: "#4F8EFF" }}>
              Lihat semua <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="space-y-2.5">
            {jadwalHariIni.map((j, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl transition-all cursor-default"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `${j.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: j.color, boxShadow: `0 0 8px ${j.color}80` }} />
                <div className="w-[68px] text-right flex-shrink-0">
                  <p className="text-xs font-mono font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>{j.waktu}</p>
                  <p className="text-[10px]" style={{ color: "#3D5070" }}>{j.selesai}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{j.matkul}</p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: "#4B5A7A" }}>{j.dosen}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "#3D5070" }}><Building2 size={9} />{j.ruang}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${j.color}18`, color: j.color }}>{j.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Table preview + Activity */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Mahasiswa Terkini</h2>
            <button className="flex items-center gap-1 text-xs font-medium" style={{ color: "#4F8EFF" }}>
              Lihat semua <ChevronRight size={11} />
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                {["NIM", "Nama", "Jurusan", "IPK", "Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2A3A5C" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAHASISWA_DATA.slice(0, 5).map((m, idx) => {
                const st = statusStyle[m.status];
                return (
                  <tr key={m.nim} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td className="px-5 py-3"><span className="text-[11px] font-mono" style={{ color: "#3D5070", fontFamily: "var(--font-mono)" }}>{m.nim}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #4F8EFF30, #8B5CF620)", color: "#4F8EFF" }}>{initials(m.nama)}</div>
                        <span className="text-xs" style={{ color: "#C8D6FF" }}>{m.nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="text-[11px]" style={{ color: "#4B5A7A" }}>{m.jurusan}</span></td>
                    <td className="px-5 py-3"><span className="text-xs font-mono font-bold" style={{ fontFamily: "var(--font-mono)", color: m.ipk >= 3.5 ? "#34D399" : "#4F8EFF" }}>{m.ipk.toFixed(2)}</span></td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.text }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: st.dot }} />{m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>

        {/* Activity & Quick Actions */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5 flex-1">
            <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Aktivitas Terkini</h2>
            <div className="space-y-3">
              {[
                { text: "KRS Semester Genap dibuka", time: "2 jam lalu", dot: "#4F8EFF" },
                { text: "UTS dijadwalkan 15 Jan", time: "5 jam lalu", dot: "#8B5CF6" },
                { text: "Workshop AI — 30 Des", time: "1 hari lalu", dot: "#06D6C7" },
                { text: "Beasiswa Bidikmisi Periode II", time: "2 hari lalu", dot: "#34D399" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: a.dot, boxShadow: `0 0 6px ${a.dot}` }} />
                  <div>
                    <p className="text-[11px] leading-snug" style={{ color: "#8899BB" }}>{a.text}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#2A3A5C" }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#2A3A5C" }}>Aksi Cepat</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ClipboardList, label: "Input Nilai", color: "#4F8EFF" },
                { icon: Calendar, label: "Buat Jadwal", color: "#8B5CF6" },
                { icon: Users, label: "Tambah MHS", color: "#06D6C7" },
                { icon: BarChart3, label: "Laporan", color: "#34D399" },
              ].map(({ icon: Icon, label, color }) => (
                <button key={label} onClick={() => pushAlert({ type: "info", title: label, message: "Fitur sedang dikembangkan." })}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all group"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight" style={{ color: "#4B5A7A" }}>{label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
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

  const dismissAlert = useCallback((id: number) => setAlerts(prev => prev.filter(a => a.id !== id)), []);

  const pageTitle: Record<string, string> = {
    dashboard: "Dashboard", mahasiswa: "Data Mahasiswa", dosen: "Data Dosen",
    matkul: "Mata Kuliah", jadwal: "Jadwal", nilai: "Nilai & KRS",
    pembayaran: "Pembayaran", laporan: "Laporan", settings: "Pengaturan",
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "var(--font-sans)" }}>
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(24px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        select option { background: #0A0E1A; color: #F0F4FF; }
      `}</style>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(79,142,255,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(6,214,199,0.04) 0%, transparent 70%)" }} />
      </div>

      <Sidebar active={activeNav} setActive={setActiveNav} />

      <main className="ml-[220px] flex-1 flex flex-col min-h-screen relative z-10">
        {/* Topbar */}
        <header className="sticky top-0 z-10" style={{ background: "rgba(7,9,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between px-8 h-[60px]">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{pageTitle[activeNav]}</h1>
                <p className="text-[10px]" style={{ color: "#2A3A5C" }}>{dateStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#2A3A5C" }} />
                <input placeholder="Cari mahasiswa, matkul..."
                  className="pl-8 pr-4 py-2 text-xs rounded-xl w-56 transition-all placeholder:opacity-30"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#F0F4FF" }}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(79,142,255,0.4)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
              </div>
              <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                onClick={() => pushAlert({ type: "info", title: "Notifikasi", message: "Anda memiliki 3 notifikasi baru." })}>
                <Bell size={14} style={{ color: "#6B7FA3" }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#FF4D6A", boxShadow: "0 0 6px #FF4D6A" }} />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399", boxShadow: "0 0 6px #34D399" }} />
                <span className="text-[11px] font-medium" style={{ color: "#6B7FA3" }}>Ganjil 2023/2024</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-7">
          {activeNav === "dashboard" && <DashboardPage pushAlert={pushAlert} />}
          {activeNav === "mahasiswa" && <MahasiswaTable pushAlert={pushAlert} />}
          {!["dashboard", "mahasiswa"].includes(activeNav) && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(79,142,255,0.08)", border: "1px solid rgba(79,142,255,0.15)" }}>
                {(() => { const item = navItems.find(n => n.id === activeNav); return item ? <item.icon size={22} style={{ color: "#4F8EFF" }} /> : null; })()}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{pageTitle[activeNav]}</p>
                <p className="text-xs mt-1" style={{ color: "#4B5A7A" }}>Halaman ini sedang dalam pengembangan</p>
              </div>
              <button onClick={() => pushAlert({ type: "info", title: "Coming Soon", message: `${pageTitle[activeNav]} akan segera hadir.` })}
                className="px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all hover:opacity-90 mt-1"
                style={{ background: "linear-gradient(135deg, #4F8EFF, #7B6EFF)" }}>
                Beritahu Saya
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Alert Stack */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {alerts.map(a => <AlertToast key={a.id} alert={a} onDismiss={dismissAlert} />)}
      </div>
    </div>
  );
}
