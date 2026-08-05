/**
 * Envelope encryption for secrets at rest.
 *
 * Server key halves and finished private keys are stored as AES-256-GCM
 * ciphertext under a single master key held in the environment. The record id
 * is bound in as additional authenticated data, so a ciphertext cannot be
 * moved from one row to another.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { requiredEnv } from './config';

const IV_BYTES = 12;
const TAG_BYTES = 16;

function keyFromEnv(name: string, byteLength: number): Buffer {
  const hex = requiredEnv(name).trim().replace(/^0x/i, '');
  if (hex.length !== byteLength * 2 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`${name} must be ${byteLength} bytes of hex`);
  }
  return Buffer.from(hex, 'hex');
}

function masterKey(): Buffer {
  return keyFromEnv('MARKET_MASTER_KEY', 32);
}

export function sessionSecret(): Buffer {
  return keyFromEnv('MARKET_SESSION_SECRET', 32);
}

export function encryptSecret(plaintext: Uint8Array, aad: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', masterKey(), iv);
  cipher.setAAD(Buffer.from(aad, 'utf8'));
  const body = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]);
  return Buffer.concat([iv, body, cipher.getAuthTag()]).toString('base64');
}

export function decryptSecret(payload: string, aad: string): Uint8Array {
  const raw = Buffer.from(payload, 'base64');
  if (raw.length <= IV_BYTES + TAG_BYTES) {
    throw new Error('Ciphertext is too short');
  }
  const iv = raw.subarray(0, IV_BYTES);
  const tag = raw.subarray(raw.length - TAG_BYTES);
  const body = raw.subarray(IV_BYTES, raw.length - TAG_BYTES);
  const decipher = createDecipheriv('aes-256-gcm', masterKey(), iv);
  decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(tag);
  return new Uint8Array(Buffer.concat([decipher.update(body), decipher.final()]));
}

export function hmac(secret: Buffer, message: string): Buffer {
  return createHmac('sha256', secret).update(message).digest();
}

export function constantTimeEquals(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function randomToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('base64url');
}
