import { query } from '../config/database.js';
import { sendToUser } from './websocket.js';

export async function createNotification(
  schema: string,
  userId: string,
  judul: string,
  pesan: string,
  tipe: string = 'info',
  link?: string
): Promise<void> {
  try {
    const { rows } = await query(
      `INSERT INTO ${schema}.notifikasi (user_id, judul, pesan, tipe, link) VALUES ($1, $2, $3, $4, $5) RETURNING id, judul, pesan, tipe, link, is_read, created_at`,
      [userId, judul, pesan, tipe, link || null]
    );
    sendToUser(userId, 'new_notification', rows[0]);
  } catch (err) {
    console.error('[Notifikasi] Failed to create:', err);
  }
}
