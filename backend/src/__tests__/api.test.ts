import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { query } from '../config/database.js';

let vendorToken: string;
let campusToken: string;
let prodiId: string;
const tenantSlug = 'contoh';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    const [v, c] = await Promise.all([
      request(app).post('/api/v1/auth/vendor/login').send({ email: 'admin@aone-project.com', password: 'admin123' }),
      request(app).post('/api/v1/auth/campus/login').send({ email: 'admin@contoh.ac.id', password: 'admin123', tenantSlug }),
    ]);
    vendorToken = v.body.data.accessToken;
    campusToken = c.body.data.accessToken;
    const { rows } = await query('SELECT id FROM tenant_contoh.program_studi LIMIT 1');
    prodiId = rows[0]?.id || (globalThis as any).__PRODI_ID__;
  });

  it('GET /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ─── AUTH ───
  describe('Auth', () => {
    it('GET /api/v1/auth/me', async () => {
      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@contoh.ac.id');
    });

    it('POST /api/v1/auth/refresh', async () => {
      const login = await request(app).post('/api/v1/auth/campus/login').send({ email: 'admin@contoh.ac.id', password: 'admin123', tenantSlug });
      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: login.body.data.refreshToken });
      expect(res.status).toBe(200);
    });

    it('POST /api/v1/auth/logout', async () => {
      const login = await request(app).post('/api/v1/auth/campus/login').send({ email: 'admin@contoh.ac.id', password: 'admin123', tenantSlug });
      const res = await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${login.body.data.accessToken}`).send({ refreshToken: login.body.data.refreshToken });
      expect(res.status).toBe(200);
    });
  });

  // ─── VENDOR ───
  describe('Vendor', () => {
    it('GET /api/v1/vendor/tenants', async () => {
      const res = await request(app).get('/api/v1/vendor/tenants').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
    it('GET /api/v1/vendor/tenants/:id', async () => {
      const list = await request(app).get('/api/v1/vendor/tenants').set('Authorization', `Bearer ${vendorToken}`);
      const id = list.body.data[0]?.id;
      if (id) {
        const res = await request(app).get(`/api/v1/vendor/tenants/${id}`).set('Authorization', `Bearer ${vendorToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.stats).toBeDefined();
      }
    });
    it('GET /api/v1/vendor/dashboard/stats', async () => {
      const res = await request(app).get('/api/v1/vendor/dashboard/stats').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/vendor/dashboard/campus-stats', async () => {
      const res = await request(app).get('/api/v1/vendor/dashboard/campus-stats').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/vendor/tickets', async () => {
      const res = await request(app).get('/api/v1/vendor/tickets').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
    });
    it('POST /api/v1/vendor/tickets', async () => {
      const res = await request(app).post('/api/v1/vendor/tickets').set('Authorization', `Bearer ${vendorToken}`).send({ title: 'Test ticket', priority: 'Sedang', category: 'Umum' });
      expect(res.status).toBe(201);
    });
    it('GET /api/v1/vendor/settings', async () => {
      const res = await request(app).get('/api/v1/vendor/settings').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/vendor/firewall/stats', async () => {
      const res = await request(app).get('/api/v1/vendor/firewall/stats').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/vendor/cctv', async () => {
      const res = await request(app).get('/api/v1/vendor/cctv').set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ─── AKADEMIK ───
  describe('Akademik', () => {
    it('GET /api/v1/akademik/mahasiswa', async () => {
      const res = await request(app).get('/api/v1/akademik/mahasiswa').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/akademik/dosen', async () => {
      const res = await request(app).get('/api/v1/akademik/dosen').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/akademik/mata-kuliah', async () => {
      const res = await request(app).get('/api/v1/akademik/mata-kuliah').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/akademik/jadwal', async () => {
      const res = await request(app).get('/api/v1/akademik/jadwal').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/akademik/krs', async () => {
      const res = await request(app).get('/api/v1/akademik/krs').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/akademik/absensi', async () => {
      const res = await request(app).get('/api/v1/akademik/absensi').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/akademik/nilai', async () => {
      const res = await request(app).get('/api/v1/akademik/nilai').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
  });

  // ─── KEUANGAN ───
  describe('Keuangan', () => {
    it('GET /api/v1/keuangan/tagihan', async () => {
      const res = await request(app).get('/api/v1/keuangan/tagihan').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/keuangan/pembayaran', async () => {
      const res = await request(app).get('/api/v1/keuangan/pembayaran').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
  });

  // ─── CMS ───
  describe('CMS', () => {
    it('GET /api/v1/cms/public', async () => {
      const res = await request(app).get('/api/v1/cms/public').set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/cms', async () => {
      const res = await request(app).get('/api/v1/cms').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
  });

  // ─── PPDB ───
  describe('PPDB', () => {
    it('POST /api/v1/ppdb/register', async () => {
      const res = await request(app).post('/api/v1/ppdb/register').set('X-Tenant-Slug', tenantSlug).send({ nama: 'Test', email: `test${Date.now()}@test.com`, password: 'test123', no_hp: '08123456789', program_studi_id: prodiId });
      expect(res.status).toBe(201);
      expect(res.body.data.nomor_daftar).toBeDefined();
    });
    it('GET /api/v1/ppdb', async () => {
      const res = await request(app).get('/api/v1/ppdb').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
  });

  // ─── OJS ───
  describe('OJS', () => {
    it('GET /api/v1/ojs/status', async () => {
      const res = await request(app).get('/api/v1/ojs/status').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/ojs', async () => {
      const res = await request(app).get('/api/v1/ojs').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
  });

  // ─── PDDIKTI ───
  describe('PDDIKTI', () => {
    it('GET /api/v1/pddikti/stats', async () => {
      const res = await request(app).get('/api/v1/pddikti/stats').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/pddikti/validate', async () => {
      const res = await request(app).get('/api/v1/pddikti/validate').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
  });

  // ─── ALUMNI ───
  describe('Alumni', () => {
    it('GET /api/v1/alumni/stats', async () => {
      const res = await request(app).get('/api/v1/alumni/stats').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/alumni', async () => {
      const res = await request(app).get('/api/v1/alumni').set('Authorization', `Bearer ${campusToken}`).set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(200);
    });
  });

  // ─── AUTH GUARDS ───
  describe('Auth Guards', () => {
    it('401 tanpa token', async () => {
      const res = await request(app).get('/api/v1/akademik/mahasiswa').set('X-Tenant-Slug', tenantSlug);
      expect(res.status).toBe(401);
    });
    it('400 tanpa tenant', async () => {
      const res = await request(app).get('/api/v1/akademik/mahasiswa').set('Authorization', `Bearer ${campusToken}`);
      expect(res.status).toBe(400);
    });
  });
});
