import { query } from '../config/database.js';

export async function createNotification(
  schema: string,
  userId: string,
  judul: string,
  pesan: string,
  tipe: string = 'info',
  link?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO ${schema}.notifikasi (user_id, judul, pesan, tipe, link) VALUES ($1, $2, $3, $4, $5)`,
      [userId, judul, pesan, tipe, link || null]
    );
  } catch (err) {
    console.error('[Notifikasi] Failed to create:', err);
  }
}
