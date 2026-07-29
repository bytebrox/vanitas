/**
 * ETH vanity Web Worker
 *
 * Modes:
 * - wallet: grind secp256k1 keys until EOA matches
 * - contract: grind until CREATE(deployer, nonce=0) matches
 * - create2-salt: fixed deployer + initCodeHash; grind salt
 * - create2-deployer: fixed salt + initCodeHash; grind deployer key
 */

import { getPublicKey, utils, etc } from '@noble/secp256k1';
import { yieldToEventLoop } from './yield';
import { keccak_256 } from '@noble/hashes/sha3.js';

type EthMode = 'wallet' | 'contract' | 'create2-salt' | 'create2-deployer';

interface EthGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  mode: EthMode;
  create2Salt?: string;
  create2InitCodeHash?: string;
  create2DeployerKey?: string;
}

interface GeneratedEthResult {
  mode: EthMode;
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  deployerAddress?: string;
  create2Salt?: string;
  create2InitCodeHash?: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: EthGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedEthResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

function strip0x(hex: string): string {
  return (hex || '').replace(/^0x/i, '').toLowerCase();
}

function parseHex32(hex: string, label: string): Uint8Array {
  const clean = strip0x(hex);
  if (!/^[0-9a-f]{64}$/.test(clean)) {
    throw new Error(`${label} must be 32 bytes hex`);
  }
  return etc.hexToBytes(clean);
}

function toAddress(pubUncompressed: Uint8Array): string {
  const hash = keccak_256(pubUncompressed.slice(1));
  return '0x' + etc.bytesToHex(hash.slice(-20));
}

function contractAddressAtNonce0(from20: Uint8Array): string {
  const rlp = new Uint8Array(23);
  rlp[0] = 0xd6;
  rlp[1] = 0x94;
  rlp.set(from20, 2);
  rlp[22] = 0x80;
  return '0x' + etc.bytesToHex(keccak_256(rlp).slice(-20));
}

/** CREATE2: keccak256(0xff ‖ deployer ‖ salt ‖ initCodeHash)[12:] */
function create2Address(
  deployer20: Uint8Array,
  salt32: Uint8Array,
  initCodeHash32: Uint8Array
): string {
  const buf = new Uint8Array(1 + 20 + 32 + 32);
  buf[0] = 0xff;
  buf.set(deployer20, 1);
  buf.set(salt32, 21);
  buf.set(initCodeHash32, 53);
  return '0x' + etc.bytesToHex(keccak_256(buf).slice(-20));
}

function matchesHexBody(address: string, prefix: string, suffix: string): boolean {
  if (!prefix && !suffix) return true;
  const body = address.slice(2).toLowerCase();
  const p = prefix.toLowerCase();
  const s = suffix.toLowerCase();
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}

let isRunning = false;
let workerId = 0;

async function generateEthVanity(config: EthGeneratorConfig): Promise<void> {
  const prefix = strip0x(config.prefix || '');
  const suffix = strip0x(config.suffix || '');
  const mode = config.mode || 'wallet';
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 64;

  let fixedInitHash: Uint8Array | null = null;
  let fixedSalt: Uint8Array | null = null;
  let fixedDeployer20: Uint8Array | null = null;
  let fixedDeployerKeyHex = '';
  let fixedDeployerAddress = '';

  if (mode === 'create2-salt' || mode === 'create2-deployer') {
    fixedInitHash = parseHex32(config.create2InitCodeHash || '', 'initCodeHash');
  }
  if (mode === 'create2-deployer') {
    fixedSalt = parseHex32(config.create2Salt || '', 'salt');
  }
  if (mode === 'create2-salt') {
    const keyHex = strip0x(config.create2DeployerKey || '');
    if (!/^[0-9a-f]{64}$/.test(keyHex)) {
      throw new Error('create2DeployerKey must be 32 bytes hex');
    }
    const secret = etc.hexToBytes(keyHex);
    const pub = getPublicKey(secret, false);
    fixedDeployerAddress = toAddress(pub);
    fixedDeployer20 = etc.hexToBytes(fixedDeployerAddress.slice(2));
    fixedDeployerKeyHex = '0x' + keyHex;
  }

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      attempts++;

      let targetAddress = '';
      let privateKey = '';
      let privateKeyBytes = new Uint8Array(0);
      let deployerAddress: string | undefined;
      let resultSalt: string | undefined;
      let resultInitHash: string | undefined;

      if (mode === 'create2-salt' && fixedDeployer20 && fixedInitHash) {
        const salt = utils.randomSecretKey();
        targetAddress = create2Address(fixedDeployer20, salt, fixedInitHash);
        privateKey = fixedDeployerKeyHex;
        privateKeyBytes = etc.hexToBytes(strip0x(fixedDeployerKeyHex));
        deployerAddress = fixedDeployerAddress;
        resultSalt = '0x' + etc.bytesToHex(salt);
        resultInitHash = '0x' + etc.bytesToHex(fixedInitHash);
      } else if (mode === 'create2-deployer' && fixedSalt && fixedInitHash) {
        const secret = utils.randomSecretKey();
        const pub = getPublicKey(secret, false);
        const walletAddress = toAddress(pub);
        const from20 = etc.hexToBytes(walletAddress.slice(2));
        targetAddress = create2Address(from20, fixedSalt, fixedInitHash);
        privateKey = '0x' + etc.bytesToHex(secret);
        privateKeyBytes = secret;
        deployerAddress = walletAddress;
        resultSalt = '0x' + etc.bytesToHex(fixedSalt);
        resultInitHash = '0x' + etc.bytesToHex(fixedInitHash);
      } else {
        const secret = utils.randomSecretKey();
        const pub = getPublicKey(secret, false);
        const walletAddress = toAddress(pub);
        targetAddress = walletAddress;
        privateKey = '0x' + etc.bytesToHex(secret);
        privateKeyBytes = secret;
        if (mode === 'contract') {
          const from20 = etc.hexToBytes(walletAddress.slice(2));
          targetAddress = contractAddressAtNonce0(from20);
          deployerAddress = walletAddress;
        }
      }

      if (matchesHexBody(targetAddress, prefix, suffix)) {
        const duration = performance.now() - startTime;
        const result: GeneratedEthResult = {
          mode,
          address: targetAddress,
          privateKey,
          privateKeyBytes,
          deployerAddress,
          create2Salt: resultSalt,
          create2InitCodeHash: resultInitHash,
          attempts,
          duration,
          matchedPattern: `${prefix}...${suffix}`,
        };
        self.postMessage({
          type: 'found',
          workerId,
          result,
          attempts,
          rate: attempts / (duration / 1000),
        } satisfies WorkerOutboundMessage);
        isRunning = false;
        return;
      }
    }

    const now = performance.now();
    if (now - lastProgressUpdate >= progressInterval) {
      const elapsed = now - startTime;
      self.postMessage({
        type: 'progress',
        workerId,
        attempts,
        rate: attempts / (elapsed / 1000),
      } satisfies WorkerOutboundMessage);
      lastProgressUpdate = now;
    }

    await yieldToEventLoop();
  }

  self.postMessage({
    type: 'stopped',
    workerId,
    attempts,
  } satisfies WorkerOutboundMessage);
}

self.onmessage = async (event: MessageEvent<WorkerInboundMessage>) => {
  const { type, config, workerId: id } = event.data;
  switch (type) {
    case 'start':
      if (config && id !== undefined) {
        workerId = id;
        try {
          await generateEthVanity(config);
        } catch (err) {
          self.postMessage({
            type: 'error',
            workerId,
            error: err instanceof Error ? err.message : 'Unknown worker error',
          } satisfies WorkerOutboundMessage);
        }
      }
      break;
    case 'stop':
      isRunning = false;
      break;
  }
};

self.postMessage({ type: 'ready', workerId: 0 } satisfies WorkerOutboundMessage);
