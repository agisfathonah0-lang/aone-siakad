import { query } from '../config/database.js';

const { rows } = await query('SELECT id, slug, schema_name, name, created_at FROM public.tenants ORDER BY created_at');
console.log(JSON.stringify(rows, null, 2));
