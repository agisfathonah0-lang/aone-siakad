-- 033_fix_document_verification_surat_id.sql — Ubah surat_id dari UUID ke VARCHAR
ALTER TABLE {schema}.document_verification ALTER COLUMN surat_id TYPE VARCHAR(255);
