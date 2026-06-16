-- Surat Keterangan Aktif Kuliah (update existing with template)
UPDATE {schema}.surat_kategori SET template = 'Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama Lengkap    : {{nama_mahasiswa}}
NIM             : {{nim}}
Program Studi   : {{prodi}}
Semester        : {{semester}}
Tahun Akademik  : {{tahun_akademik}}

Adalah benar mahasiswa aktif pada Program Studi {{prodi}} di {{nama_pt}}.

Surat keterangan ini diberikan untuk keperluan {{keperluan}}.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.'
WHERE kode = 'SKCK' AND template IS NULL;

-- Surat Keterangan Lulus (update existing)
UPDATE {schema}.surat_kategori SET template = 'Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama Lengkap    : {{nama_mahasiswa}}
NIM             : {{nim}}
Program Studi   : {{prodi}}
Jenjang         : {{jenjang}}

Telah dinyatakan LULUS pada tanggal {{tanggal_lulus}} dengan predikat {{predikat}}.

Surat keterangan lulus ini diberikan untuk keperluan {{keperluan}}.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.'
WHERE kode = 'SKP' AND template IS NULL;

-- Surat Permohonan (update existing)
UPDATE {schema}.surat_kategori SET template = 'Dengan hormat,

Sehubungan dengan {{keperluan}}, bersama ini kami mengajukan permohonan {{perihal}}.

Sebagai bahan pertimbangan, kami lampirkan dokumen pendukung yang diperlukan.

Demikian permohonan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.'
WHERE kode = 'SP' AND template IS NULL;

-- Surat Undangan (update existing)
UPDATE {schema}.surat_kategori SET template = 'Dengan hormat,

Sehubungan dengan {{perihal}}, kami mengundang Saudara untuk hadir pada:

Hari/Tanggal : {{tanggal_kegiatan}}
Waktu        : {{waktu}}
Tempat       : {{tempat}}
Acara        : {{acara}}

Demikian undangan ini disampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.'
WHERE kode = 'SU' AND template IS NULL;

-- Surat Tugas (update existing)
UPDATE {schema}.surat_kategori SET template = 'Dengan ini memberikan tugas kepada:

Nama       : {{nama_pegawai}}
NIP/NIK    : {{nip}}
Jabatan    : {{jabatan}}

Untuk melaksanakan tugas sebagai {{perihal}} pada:

Hari/Tanggal : {{tanggal_kegiatan}}
Tempat       : {{tempat}}

Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.'
WHERE kode = 'ST' AND template IS NULL;

-- Surat Izin (update existing)
UPDATE {schema}.surat_kategori SET template = 'Dengan ini memberikan izin kepada:

Nama       : {{nama_mahasiswa}}
NIM        : {{nim}}
Program Studi : {{prodi}}

Untuk melaksanakan {{perihal}} pada:

Hari/Tanggal : {{tanggal_kegiatan}}
Waktu        : {{waktu}}
Tempat       : {{tempat}}

Demikian surat izin ini diberikan untuk dipergunakan sebagaimana mestinya.'
WHERE kode = 'SI' AND template IS NULL;

-- Surat Disposisi (update existing)
UPDATE {schema}.surat_kategori SET template = 'Diteruskan kepada:

Jabatan : {{tujuan}}
Isi Disposisi : {{catatan}}

Harap ditindaklanjuti dengan penuh tanggung jawab.'
WHERE kode = 'SD' AND template IS NULL;

-- INSERT missing categories
INSERT INTO {schema}.surat_kategori (kode, nama, deskripsi, template) VALUES
('SK', 'Surat Keputusan',
 'Surat Keputusan pengangkatan, pemberhentian, penetapan',
 'KEPUTUSAN {{nama_pt}}

NOMOR : {{nomor_surat}}

TENTANG

{{perihal}}

Dengan memperhatikan:
{{pertimbangan}}

MEMUTUSKAN:

Menetapkan:
PERTAMA : {{isi_keputusan}}
KEDUA   : Keputusan ini mulai berlaku pada tanggal ditetapkan
KETIGA  : Apabila terdapat kekeliruan dalam keputusan ini akan diadakan perbaikan sebagaimana mestinya.'
),
('SE', 'Surat Edaran',
 'Surat edaran resmi internal',
 'SURAT EDARAN

NOMOR : {{nomor_surat}}

TENTANG

{{perihal}}

Dengan ini menyampaikan kepada seluruh {{tujuan}} untuk memperhatikan hal-hal sebagai berikut:

{{isi_edaran}}

Demikian surat edaran ini disampaikan untuk dilaksanakan dengan penuh tanggung jawab.'
),
('SPPD', 'Surat Perintah Perjalanan Dinas',
 'Surat perintah perjalanan dinas (SPPD)',
 'SURAT PERINTAH PERJALANAN DINAS

NOMOR : {{nomor_surat}}

Dengan ini memerintahkan kepada:

Nama       : {{nama_pegawai}}
NIP/NIK    : {{nip}}
Jabatan    : {{jabatan}}

Untuk melaksanakan perjalanan dinas dalam rangka {{perihal}} dengan ketentuan:

Tempat Tujuan      : {{tempat}}
Lama Perjalanan    : {{lama_perjalanan}}
Tanggal Berangkat  : {{tanggal_berangkat}}
Tanggal Kembali    : {{tanggal_kembali}}
Pembebanan Anggaran: {{pembebanan}}

Demikian surat perintah perjalanan dinas ini dibuat untuk dilaksanakan sebagaimana mestinya.'
),
('SPK', 'Surat Perjanjian/Kontrak',
 'Surat perjanjian kerja sama/MoU',
 'SURAT PERJANJIAN KERJA SAMA

NOMOR : {{nomor_surat}}

Pada hari ini {{hari}}, tanggal {{tanggal}} bulan {{bulan}} tahun {{tahun}}, yang bertanda tangan di bawah ini:

I. {{nama_pihak1}} : {{jabatan_pihak1}}, selanjutnya disebut PIHAK PERTAMA.
II. {{nama_pihak2}} : {{jabatan_pihak2}}, selanjutnya disebut PIHAK KEDUA.

Kedua belah pihak sepakat untuk mengadakan perjanjian kerja sama dalam hal {{perihal}} dengan ketentuan sebagai berikut:

Pasal 1
{{isi_perjanjian}}

Pasal 2
Perjanjian ini berlaku sejak tanggal ditandatangani.

Demikian surat perjanjian ini dibuat dalam rangkap dua, masing-masing berkekuatan hukum yang sama.'
),
('SKET', 'Surat Keterangan',
 'Surat keterangan umum (PKL, penelitian, dll)',
 'SURAT KETERANGAN

NOMOR : {{nomor_surat}}

Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama       : {{nama_mahasiswa}}
NIM        : {{nim}}
Program Studi : {{prodi}}
Semester   : {{semester}}

Bahwa yang bersangkutan benar-benar {{keterangan}}.

Surat keterangan ini diberikan untuk keperluan {{keperluan}}.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.'
),
('SPG', 'Surat Pengantar',
 'Surat pengantar dokumen/penelitian',
 'SURAT PENGANTAR

NOMOR : {{nomor_surat}}

Dengan ini mengantarkan:

1. {{lampiran1}}
2. {{lampiran2}}
3. {{lampiran3}}

Untuk disampaikan kepada {{tujuan}} dalam rangka {{perihal}}.

Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.'
),
('SR', 'Surat Rekomendasi',
 'Surat rekomendasi beasiswa/lanjut studi',
 'SURAT REKOMENDASI

NOMOR : {{nomor_surat}}

Yang bertanda tangan di bawah ini, menerangkan dengan sesungguhnya bahwa:

Nama              : {{nama_mahasiswa}}
NIM               : {{nim}}
Program Studi     : {{prodi}}
IPK               : {{ipk}}

Adalah mahasiswa yang berkelakuan baik, aktif dalam kegiatan akademik, dan kami rekomendasikan untuk {{keperluan}}.

Demikian surat rekomendasi ini dibuat untuk dapat dipergunakan sebagaimana mestinya.'
),
('BA', 'Berita Acara',
 'Berita acara serah terima, rapat, ujian',
 'BERITA ACARA

NOMOR : {{nomor_surat}}

Pada hari ini {{hari}}, tanggal {{tanggal}} bulan {{bulan}} tahun {{tahun}}, telah dilaksanakan {{perihal}} yang bertempat di {{tempat}} pada pukul {{waktu}}.

Hadir dalam acara tersebut:
1. {{pihak1}} - {{jabatan1}}
2. {{pihak2}} - {{jabatan2}}
3. {{pihak3}} - {{jabatan3}}

Hasil/Tujuan acara:
{{hasil_acara}}

Demikian berita acara ini dibuat untuk dijadikan bukti dan dipergunakan sebagaimana mestinya.'
),
('ND', 'Nota Dinas',
 'Nota dinas internal antar unit',
 'NOTA DINAS

Kepada       : {{tujuan}}
Dari         : {{pengirim}}
Perihal      : {{perihal}}
Tanggal      : {{tanggal}}
Nomor        : {{nomor_surat}}

{{isi_nota}}

Demikian nota dinas ini disampaikan untuk menjadi perhatian dan ditindaklanjuti.'
),
('SKU', 'Surat Kuasa',
 'Surat pemberian kuasa',
 'SURAT KUASA

NOMOR : {{nomor_surat}}

Yang bertanda tangan di bawah ini:

Nama       : {{nama_pemberi}}
NIP/NIK    : {{nik_pemberi}}
Jabatan    : {{jabatan_pemberi}}

Memberikan kuasa kepada:

Nama       : {{nama_penerima}}
NIP/NIK    : {{nik_penerima}}
Jabatan    : {{jabatan_penerima}}

Untuk {{perihal}}.

Demikian surat kuasa ini dibuat untuk dipergunakan sebagaimana mestinya.'
),
('SPY', 'Surat Pernyataan',
 'Surat pernyataan diri/lembaga',
 'SURAT PERNYATAAN

NOMOR : {{nomor_surat}}

Yang bertanda tangan di bawah ini:

Nama       : {{nama}}
NIM/NIP    : {{nik}}
Jabatan    : {{jabatan}}

Dengan ini menyatakan dengan sesungguhnya bahwa:

{{isi_pernyataan}}

Demikian surat pernyataan ini dibuat dengan sebenar-benarnya dan untuk dipergunakan sebagaimana mestinya.'
),
('SPA', 'Surat Panggilan',
 'Surat panggilan orang tua/rapat',
 'SURAT PANGGILAN

NOMOR : {{nomor_surat}}

Dengan hormat,

Sehubungan dengan {{perihal}}, kami memanggil Saudara untuk hadir pada:

Hari/Tanggal : {{tanggal_kegiatan}}
Waktu        : {{waktu}}
Tempat       : {{tempat}}
Acara        : {{acara}}

Dimohon kehadiran tepat waktu. Demikian surat panggilan ini disampaikan atas perhatiannya diucapkan terima kasih.'
)
ON CONFLICT (kode) DO UPDATE SET
  template = EXCLUDED.template,
  deskripsi = EXCLUDED.deskripsi;
