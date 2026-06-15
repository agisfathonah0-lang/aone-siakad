import { Router } from 'express';
import { getDb } from '../database.js';

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const cameras = db.prepare('SELECT * FROM cctv_cameras ORDER BY created_at DESC').all();
  res.json(cameras);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, location, rtsp_url } = req.body;
  if (!name || !location) {
    res.status(400).json({ error: 'Nama dan lokasi kamera wajib diisi.' });
    return;
  }
  const id = 'CAM-' + Date.now().toString(36).toUpperCase();
  const created_at = new Date().toISOString();
  db.prepare('INSERT INTO cctv_cameras (id, name, location, rtsp_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, location, rtsp_url || '', 'Aktif', created_at);
  res.status(201).json({ id, name, location, rtsp_url: rtsp_url || '', status: 'Aktif', created_at });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, location, rtsp_url, status } = req.body;
  let camera = db.prepare('SELECT * FROM cctv_cameras WHERE id = ?').get(req.params.id);
  if (!camera) {
    // Upsert: create if not exists
    const created_at = new Date().toISOString();
    db.prepare('INSERT INTO cctv_cameras (id, name, location, rtsp_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.params.id, name || req.params.id, location || 'Lokasi tidak diketahui', rtsp_url || '', status || 'Aktif', created_at);
    res.json({ id: req.params.id, name: name || req.params.id, location: location || 'Lokasi tidak diketahui', rtsp_url: rtsp_url || '', status: status || 'Aktif', created_at });
    return;
  }
  db.prepare('UPDATE cctv_cameras SET name = ?, location = ?, rtsp_url = ?, status = ? WHERE id = ?')
    .run(name || camera.name, location || camera.location, rtsp_url !== undefined ? rtsp_url : camera.rtsp_url, status || camera.status, req.params.id);
  res.json({ message: 'Kamera diperbarui.' });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const camera = db.prepare('SELECT * FROM cctv_cameras WHERE id = ?').get(req.params.id);
  if (!camera) {
    res.status(404).json({ error: 'Kamera tidak ditemukan.' });
    return;
  }
  db.prepare('DELETE FROM cctv_cameras WHERE id = ?').run(req.params.id);
  res.json({ message: 'Kamera dihapus.' });
});

// Broadcast: upload frame from laptop camera
router.post('/:id/frame', (req, res) => {
  const db = getDb();
  const { image } = req.body;
  const camera = db.prepare('SELECT * FROM cctv_cameras WHERE id = ?').get(req.params.id);
  if (!camera) {
    res.status(404).json({ error: 'Kamera tidak ditemukan.' });
    return;
  }
  if (!image || typeof image !== 'string') {
    res.status(400).json({ error: 'Data image (base64) wajib dikirim.' });
    return;
  }
  const snapshot_at = new Date().toISOString();
  db.prepare('UPDATE cctv_cameras SET snapshot = ?, snapshot_at = ?, is_broadcasting = 1 WHERE id = ?')
    .run(image, snapshot_at, req.params.id);
  res.json({ message: 'Frame diterima.', snapshot_at });
});

// Broadcast: get latest frame
router.get('/:id/frame', (req, res) => {
  const db = getDb();
  const camera = db.prepare('SELECT snapshot, snapshot_at FROM cctv_cameras WHERE id = ?').get(req.params.id);
  if (!camera) {
    res.status(404).json({ error: 'Kamera tidak ditemukan.' });
    return;
  }
  if (!camera.snapshot) {
    res.status(404).json({ error: 'Belum ada frame.' });
    return;
  }
  const base64 = camera.snapshot.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(base64, 'base64');
  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(buf);
});

// Stop broadcast
router.post('/:id/stop-broadcast', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE cctv_cameras SET is_broadcasting = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Broadcast dihentikan.' });
});

export default router;
