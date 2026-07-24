/**
 * Cryptographic utilities for Vanitas
 * 
 * This module provides Ed25519 keypair generation compatible with Solana.
 * All operations happen client-side using secure random number generation.
 */

// Base58 alphabet used by Solana
export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Encode bytes to Base58 string
 */
export function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  
  // Count leading zeros
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) {
    zeros++;
  }
  
  // Allocate enough space in big-endian base58 representation
  const size = Math.ceil(bytes.length * 138 / 100) + 1;
  const b58 = new Uint8Array(size);
  
  // Process the bytes
  let length = 0;
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    let j = 0;
    
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 256 * b58[k];
      b58[k] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    
    length = j;
  }
  
  // Skip leading zeros in base58 result
  let i = size - length;
  while (i < size && b58[i] === 0) {
    i++;
  }
  
  // Translate to Base58 characters
  let result = '1'.repeat(zeros);
  for (; i < size; i++) {
    result += BASE58_ALPHABET[b58[i]];
  }
  
  return result;
}

/**
 * Decode Base58 string to bytes
 */
export function base58Decode(str: string): Uint8Array {
  if (str.length === 0) return new Uint8Array(0);
  
  // Count leading '1's (zeros in Base58)
  let zeros = 0;
  while (zeros < str.length && str[zeros] === '1') {
    zeros++;
  }
  
  // Allocate enough space
  const size = Math.ceil(str.length * 733 / 1000) + 1;
  const bytes = new Uint8Array(size);
  
  // Process the string
  let length = 0;
  for (let i = zeros; i < str.length; i++) {
    const charIndex = BASE58_ALPHABET.indexOf(str[i]);
    if (charIndex === -1) {
      throw new Error(`Invalid Base58 character: ${str[i]}`);
    }
    
    let carry = charIndex;
    let j = 0;
    
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 58 * bytes[k];
      bytes[k] = carry % 256;
      carry = Math.floor(carry / 256);
    }
    
    length = j;
  }
  
  // Skip leading zeros in result
  let i = size - length;
  while (i < size && bytes[i] === 0) {
    i++;
  }
  
  // Prepend leading zeros
  const result = new Uint8Array(zeros + (size - i));
  result.fill(0, 0, zeros);
  result.set(bytes.slice(i), zeros);
  
  return result;
}

/**
 * Convert byte array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to byte array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
