import crypto from 'node:crypto';
const key = process.env.FIELD_ENCRYPTION_KEY ? Buffer.from(process.env.FIELD_ENCRYPTION_KEY, 'hex') : null;
export function encrypt(value) {
  if (!value) return null;
  if (!key || key.length !== 32) throw new Error('FIELD_ENCRYPTION_KEY must be a 32-byte hex key before saving financial details');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
}
export function mask(value) { return value ? `••••${value.slice(-4)}` : null; }
