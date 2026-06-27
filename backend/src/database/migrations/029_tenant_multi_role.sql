-- 029_tenant_multi_role.sql
-- Adds multi-role support: roles array + humas role
ALTER TABLE {schema}.users ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';
UPDATE {schema}.users SET roles = ARRAY[role] WHERE roles IS NULL OR roles = '{}';
