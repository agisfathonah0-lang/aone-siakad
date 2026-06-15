import { pool, query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { runTenantMigrations } from './tenant-migrate.js';

async function seed(): Promise<void> {
  console.log('[SEED] Starting...');

  // ─── Vendor super admin ───
  const vendorPassword = await bcrypt.hash('admin123', 12);
  await query(
    `INSERT INTO public.vendor_users (id, email, password_hash, nama, role)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
    [uuid(), 'admin@aone-project.com', vendorPassword, 'Super Admin', 'super_admin']
  );
  console.log('[SEED] ✅ Vendor admin created (admin@aone-project.com / admin123)');

  // ─── Contoh tenant (development seed) ───
  const tenantId = uuid();
  const slug = 'contoh';
  const schemaName = 'tenant_contoh';

  const { rows: existing } = await query('SELECT id FROM public.tenants WHERE slug = $1', [slug]);
  if (existing.length === 0) {
    await query(
      `INSERT INTO public.tenants (id, slug, schema_name, name, nama_pt, singkatan, paket)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tenantId, slug, schemaName, 'Contoh Universitas', 'Contoh Universitas AONE', 'CONTOH', 'pro']
    );
    console.log('[SEED] ✅ Tenant created');

    await runTenantMigrations(schemaName);

    // Seed tenant admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    await query(
      `INSERT INTO "${schemaName}".users (id, email, password_hash, role, nama)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      [uuid(), 'admin@contoh.ac.id', adminPassword, 'admin', 'Admin Universitas']
    );

    // Seed prodi
    const prodiId = uuid();
    await query(
      `INSERT INTO "${schemaName}".program_studi (id, kode, nama, jenjang, fakultas)
       VALUES ($1, $2, $3, $4, $5)`,
      [prodiId, 'IF', 'Informatika', 'S1', 'Ilmu Komputer']
    );

    // Seed dosen
    const dosenUserId = uuid();
    const dosenPassword = await bcrypt.hash('dosen123', 12);
    await query(
      `INSERT INTO "${schemaName}".users (id, email, password_hash, role, nama, nidn)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [dosenUserId, 'dosen@contoh.ac.id', dosenPassword, 'dosen', 'Dr. Budi Santoso', '1234567890']
    );
    await query(
      `INSERT INTO "${schemaName}".dosen (id, user_id, nidn, nama, program_studi_id, is_dosen_wali)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuid(), dosenUserId, '1234567890', 'Dr. Budi Santoso', prodiId, true]
    );

    // Seed mahasiswa
    const mhsUserId = uuid();
    const mhsPassword = await bcrypt.hash('mhs123', 12);
    await query(
      `INSERT INTO "${schemaName}".users (id, email, password_hash, role, nama, nim)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mhsUserId, 'mahasiswa@contoh.ac.id', mhsPassword, 'mahasiswa', 'Andi Pratama', '20241001']
    );
    await query(
      `INSERT INTO "${schemaName}".mahasiswa (id, user_id, nim, nama, program_studi_id, angkatan, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuid(), mhsUserId, '20241001', 'Andi Pratama', prodiId, 2024, 2]
    );

    // Seed MK
    const mkId = uuid();
    await query(
      `INSERT INTO "${schemaName}".mata_kuliah (id, kode, nama, sks, semester, program_studi_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mkId, 'IF101', 'Algoritma Pemrograman', 4, 1, prodiId]
    );

    console.log('[SEED] ✅ Tenant data seeded');
    console.log('[SEED]    Admin: admin@contoh.ac.id / admin123');
    console.log('[SEED]    Dosen: dosen@contoh.ac.id / dosen123');
    console.log('[SEED]    Mhs:   mahasiswa@contoh.ac.id / mhs123');
  } else {
    console.log('[SEED] ⏭️  Tenant already exists, skipping');
  }

  console.log('[SEED] Done');
  await pool.end();
}

seed().catch((err) => {
  console.error('[SEED] Fatal:', err);
  process.exit(1);
});
