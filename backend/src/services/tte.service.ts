import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const DEFAULT_KEY_LABEL = 'Default RSA Key';

function schema(req: any): string {
  return req.tenant?.schemaName || 'public';
}

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

export async function ensureUserKeys(req: any): Promise<{ id: string; publicKey: string }> {
  const s = schema(req);
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Belum login');

  const { rows } = await query(
    `SELECT id, public_key FROM "${s}".tte_keys WHERE user_id = $1 AND is_active = true LIMIT 1`,
    [userId]
  );
  if (rows.length > 0) return rows[0];

  const { publicKey, privateKey } = generateKeyPair();
  const keyId = uuid();
  await query(
    `INSERT INTO "${s}".tte_keys (id, user_id, label, public_key, private_key_encrypted)
     VALUES ($1, $2, $3, $4, $5)`,
    [keyId, userId, DEFAULT_KEY_LABEL, publicKey, privateKey]
  );
  return { id: keyId, publicKey };
}

export function signContent(content: string, privateKey: string): string {
  const sign = crypto.createSign('SHA256');
  sign.update(content);
  sign.end();
  return sign.sign(privateKey, 'base64');
}

export function verifySignature(content: string, signature: string, publicKey: string): boolean {
  const verify = crypto.createVerify('SHA256');
  verify.update(content);
  verify.end();
  return verify.verify(publicKey, signature, 'base64');
}

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function signDocument(
  req: any,
  body: {
    document_id: string;
    document_type: string;
    content: string;
    signer_nama?: string;
    signer_jabatan?: string;
    tte_type?: string;
    metadata?: Record<string, any>;
  }
) {
  const s = schema(req);
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Belum login');

  const { document_id, document_type, content, signer_nama, signer_jabatan, tte_type, metadata } = body;
  if (!document_id || !document_type || !content) {
    throw new AppError(400, 'document_id, document_type, dan content wajib diisi');
  }

  const key = await ensureUserKeys(req);
  const hashed = hashContent(content);
  const signature = signContent(hashed, ''); // Will replace below

  // Get full key (re-fetch to get private key)
  const { rows: keys } = await query(
    `SELECT id, public_key, private_key_encrypted FROM "${s}".tte_keys WHERE id = $1 AND user_id = $2`,
    [key.id, userId]
  );
  if (keys.length === 0) throw new AppError(500, 'Key tidak ditemukan');

  const privateKey = keys[0].private_key_encrypted;
  const finalSig = signContent(hashed, privateKey);

  const sigId = uuid();
  const user = req.user;
  await query(
    `INSERT INTO "${s}".tte_signatures
     (id, document_id, document_type, signer_user_id, signer_nama, signer_jabatan, hash_sha256, signature, key_id, tte_type, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [sigId, document_id, document_type, userId, signer_nama || user.nama || '', signer_jabatan || '', hashed, finalSig, key.id, tte_type || 'tersertifikasi', metadata ? JSON.stringify(metadata) : '{}']
  );

  return {
    id: sigId,
    document_id,
    document_type,
    hash_sha256: hashed,
    signature: finalSig,
    algorithm: 'RSA-SHA256',
    tte_type: tte_type || 'tersertifikasi',
    public_key: keys[0].public_key,
    signed_at: new Date().toISOString(),
  };
}

export async function verifyDocument(
  req: any,
  body: {
    document_id: string;
    document_type: string;
    content?: string;
    signature_id?: string;
  }
) {
  const s = schema(req);
  let sigs: any[];

  if (body.signature_id) {
    const { rows } = await query(
      `SELECT ts.*, tk.public_key FROM "${s}".tte_signatures ts
       LEFT JOIN "${s}".tte_keys tk ON tk.id = ts.key_id
       WHERE ts.id = $1`, [body.signature_id]
    );
    sigs = rows;
  } else if (body.document_id && body.document_type) {
    const { rows } = await query(
      `SELECT ts.*, tk.public_key FROM "${s}".tte_signatures ts
       LEFT JOIN "${s}".tte_keys tk ON tk.id = ts.key_id
       WHERE ts.document_id = $1 AND ts.document_type = $2 AND ts.is_revoked = false
       ORDER BY ts.signed_at DESC`, [body.document_id, body.document_type]
    );
    sigs = rows;
  } else {
    throw new AppError(400, 'Mohon berikan signature_id atau (document_id + document_type)');
  }

  if (sigs.length === 0) {
    return { verified: false, message: 'Tidak ada tanda tangan ditemukan' };
  }

  const results = await Promise.all(sigs.map(async (sig: any) => {
    let valid = false;
    if (body.content) {
      const hashed = hashContent(body.content);
      const contentMatch = hashed === sig.hash_sha256;
      const sigValid = sig.public_key ? verifySignature(hashed, sig.signature, sig.public_key) : false;
      valid = contentMatch && sigValid;

      if (valid) {
        await query(
          `UPDATE "${s}".tte_signatures SET verified_count = verified_count + 1, last_verified_at = NOW() WHERE id = $1`,
          [sig.id]
        );
      }
    }

    return {
      id: sig.id,
      document_id: sig.document_id,
      document_type: sig.document_type,
      signer_nama: sig.signer_nama,
      signer_jabatan: sig.signer_jabatan,
      hash_sha256: sig.hash_sha256,
      algorithm: sig.algorithm,
      tte_type: sig.tte_type,
      signed_at: sig.signed_at,
      verified_count: sig.verified_count + (body.content ? 1 : 0),
      is_revoked: sig.is_revoked,
      revoked_at: sig.revoked_at,
      revoked_alasan: sig.revoked_alasan,
      valid,
      public_key: sig.public_key ? `${sig.public_key.substring(0, 40)}...` : null,
    };
  }));

  return {
    verified: results.every(r => r.valid),
    total_signatures: results.length,
    signatures: results,
  };
}

export async function revokeSignature(req: any, signatureId: string, alasan?: string) {
  const s = schema(req);
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Belum login');

  const { rows } = await query(
    `SELECT id FROM "${s}".tte_signatures WHERE id = $1 AND signer_user_id = $2 AND is_revoked = false`,
    [signatureId, userId]
  );
  if (rows.length === 0) throw new AppError(404, 'Tanda tangan tidak ditemukan atau sudah dicabut');

  await query(
    `UPDATE "${s}".tte_signatures SET is_revoked = true, revoked_at = NOW(), revoked_alasan = $1 WHERE id = $2`,
    [alasan || '', signatureId]
  );
  return { revoked: true, id: signatureId };
}

export async function getUserKeys(req: any) {
  const s = schema(req);
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Belum login');

  const { rows } = await query(
    `SELECT id, label, is_active, created_at FROM "${s}".tte_keys WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getSignaturesForDocument(req: any, documentId: string, documentType: string) {
  const s = schema(req);
  const { rows } = await query(
    `SELECT ts.id, ts.document_id, ts.document_type, ts.signer_nama, ts.signer_jabatan,
            ts.hash_sha256, ts.algorithm, ts.tte_type, ts.signed_at, ts.verified_count,
            ts.last_verified_at, ts.is_revoked, ts.revoked_at, ts.revoked_alasan
     FROM "${s}".tte_signatures ts
     WHERE ts.document_id = $1 AND ts.document_type = $2
     ORDER BY ts.signed_at DESC`,
    [documentId, documentType]
  );
  return rows;
}
