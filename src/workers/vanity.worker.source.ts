/**
 * Vanitas Web Worker - High Performance Edition
 * 
 * This file is compiled with esbuild to public/vanity-worker.js
 * 
 * SECURITY: This worker runs entirely in the browser.
 * - No network requests are made
 * - All cryptographic operations happen locally
 * - Private keys never leave this worker except through postMessage
 * 
 * PERFORMANCE: Uses native Web Crypto API (Ed25519) when available,
 * falls back to watsign WASM for older browsers.
 */

import { keyPairFromSeed } from 'watsign';
import { yieldToEventLoop } from './yield';
import { normalizePatterns, formatMatchedPattern } from '../lib/patterns';

// Check if native Ed25519 is supported
let useNativeCrypto = false;

async function checkNativeSupport(): Promise<boolean> {
  try {
    const testKey = await crypto.subtle.generateKey(
      { name: 'Ed25519' },
      true,
      ['sign', 'verify']
    );
    return testKey !== null;
  } catch {
    return false;
  }
}

/**
 * Awaited before the first candidate so a run never starts on the slow WASM
 * path while the native probe is still in flight.
 */
const nativeReady: Promise<void> = checkNativeSupport()
  .then((supported) => {
    useNativeCrypto = supported;
  })
  .catch(() => {
    useNativeCrypto = false;
  });

/**
 * Generate keypair using native Web Crypto API
 */
async function generateNativeKeypair(): Promise<{ publicKey: Uint8Array; secretKey: Uint8Array }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify']
  );
  
  // Export public key as raw bytes (32 bytes)
  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKey = new Uint8Array(publicKeyBuffer);
  
  // Export private key as JWK to get the raw bytes
  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  
  // JWK 'd' contains the 32-byte seed, we need to combine seed + publicKey for 64-byte secretKey
  const seedBytes = base64UrlDecode(privateJwk.d!);
  
  // Create 64-byte secret key (seed + publicKey) - Solana format
  const secretKey = new Uint8Array(64);
  secretKey.set(seedBytes, 0);
  secretKey.set(publicKey, 32);
  
  return { publicKey, secretKey };
}

/**
 * Decode base64url to Uint8Array
 */
function base64UrlDecode(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Type definitions
interface GeneratorConfig {
  prefix: string;
  suffix: string;
  patterns?: { prefix: string; suffix: string }[];
  caseSensitive: boolean;
  threads: number;
}

interface GeneratedKeypair {
  publicKey: string;
  privateKey: string;
  secretKey: Uint8Array;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: GeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedKeypair;
  attempts?: number;
  rate?: number;
  error?: string;
}

// Base58 alphabet used by Solana
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Encode bytes to Base58 string
 */
function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  
  const size = Math.ceil(bytes.length * 138 / 100) + 1;
  const b58 = new Uint8Array(size);
  
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
  
  let i = size - length;
  while (i < size && b58[i] === 0) i++;
  
  let result = '1'.repeat(zeros);
  for (; i < size; i++) result += BASE58_ALPHABET[b58[i]];
  
  return result;
}

/**
 * Check if public key matches the pattern
 */
function matchesPattern(
  publicKey: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): boolean {
  if (!prefix && !suffix) return true;
  
  const keyToCheck = caseSensitive ? publicKey : publicKey.toLowerCase();
  const prefixToCheck = caseSensitive ? prefix : prefix.toLowerCase();
  const suffixToCheck = caseSensitive ? suffix : suffix.toLowerCase();
  
  return (!prefix || keyToCheck.startsWith(prefixToCheck)) && 
         (!suffix || keyToCheck.endsWith(suffixToCheck));
}

// Worker state
let isRunning = false;
let workerId = 0;

/**
 * Main generation loop using watsign WASM
 */
async function generateVanityAddress(config: GeneratorConfig): Promise<void> {
  const { caseSensitive } = config;
  const patterns = normalizePatterns(config);
  await nativeReady;
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  
  isRunning = true;
  
  // Process in batches for better performance
  const batchSize = 100;
  
  while (isRunning) {
    // Process a batch of keys
    for (let i = 0; i < batchSize && isRunning; i++) {
      let publicKey: Uint8Array;
      let secretKey: Uint8Array;
      
      if (useNativeCrypto) {
        // Use native Web Crypto API (fastest!)
        const keypair = await generateNativeKeypair();
        publicKey = keypair.publicKey;
        secretKey = keypair.secretKey;
      } else {
        // Fall back to WASM
        const seed = crypto.getRandomValues(new Uint8Array(32));
        const keypair = await keyPairFromSeed(seed);
        publicKey = keypair.publicKey;
        secretKey = keypair.secretKey;
      }
      
      const publicKeyBase58 = base58Encode(publicKey);
      attempts++;
      
      let matchedTarget: { prefix: string; suffix: string } | null = null;
      for (const target of patterns.length > 0 ? patterns : [{ prefix: '', suffix: '' }]) {
        if (matchesPattern(publicKeyBase58, target.prefix, target.suffix, caseSensitive)) {
          matchedTarget = target;
          break;
        }
      }
      if (matchedTarget) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const privateKeyBase58 = base58Encode(secretKey);
        
        const result: GeneratedKeypair = {
          publicKey: publicKeyBase58,
          privateKey: privateKeyBase58,
          secretKey: new Uint8Array(secretKey),
          attempts,
          duration,
          matchedPattern: formatMatchedPattern(matchedTarget),
        };
        
        const message: WorkerOutboundMessage = {
          type: 'found',
          workerId,
          result,
          attempts,
          rate: attempts / (duration / 1000),
        };
        
        self.postMessage(message);
        isRunning = false;
        return;
      }
    }
    
    // Send progress update if needed
    const now = performance.now();
    if (now - lastProgressUpdate >= progressInterval) {
      const elapsed = now - startTime;
      const rate = attempts / (elapsed / 1000);
      
      const message: WorkerOutboundMessage = {
        type: 'progress',
        workerId,
        attempts,
        rate,
      };
      
      self.postMessage(message);
      lastProgressUpdate = now;
    }
    
    // Yield to allow message processing
    await yieldToEventLoop();
  }
  
  const message: WorkerOutboundMessage = {
    type: 'stopped',
    workerId,
    attempts,
  };
  
  self.postMessage(message);
}

/**
 * Handle messages from main thread
 */
self.onmessage = async (event: MessageEvent<WorkerInboundMessage>) => {
  const { type, config, workerId: id } = event.data;
  
  switch (type) {
    case 'start':
      if (config && id !== undefined) {
        workerId = id;
        await generateVanityAddress(config);
      }
      break;
    case 'stop':
      isRunning = false;
      break;
    default:
      console.error('Unknown message type:', type);
  }
};

// Signal that worker is ready
self.postMessage({ type: 'ready', workerId: 0 });
