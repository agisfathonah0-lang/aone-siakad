-- 031_tenant_surat_template_file.sql
ALTER TABLE {schema}.surat_kategori ADD COLUMN IF NOT EXISTS template_file_url TEXT;
