# Vanitas

[![Version: 1.9.0](https://img.shields.io/badge/Version-1.9.0-8B7355.svg)](https://vanitas.fun)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Live Audit](https://img.shields.io/badge/Live_Audit-vanitas.fun%2Faudit-8B7355.svg)](https://vanitas.fun/audit)

**Forge vanity addresses for Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, and XRP, entirely in your browser.**

Create personalized wallet (and related) addresses that start or end with patterns you choose. All cryptographic work runs locally; private keys never leave your device.

Website: [vanitas.fun](https://vanitas.fun)

### Terminal CLI

```bash
npx vanitas
```

Same forges, wizard or flags. See [cli/README.md](cli/README.md).

## Forges

| | Forge | Use Case | URL |
|---|-------|----------|-----|
| <img src="public/chains/solana.svg" width="20" height="20" alt="Solana" /> | **Solana** | Wallet + token mint (Base58 Ed25519) | `/sol` |
| <img src="public/chains/ethereum.svg" width="20" height="20" alt="Ethereum" /> | **EVM** | Wallet, CREATE nonce 0, CREATE2 salt / deployer | `/evm` |
| <img src="public/chains/bitcoin.svg" width="20" height="20" alt="Bitcoin" /> | **Bitcoin** | Legacy `1…`, SegWit `bc1q…`, Taproot `bc1p…` (WIF) | `/btc` |
| <img src="public/chains/tron.svg" width="20" height="20" alt="Tron" /> | **Tron** | Wallet + CREATE nonce 0 (`T…` Base58Check) | `/tron` |
| <img src="public/chains/aptos.svg" width="20" height="20" alt="Aptos" /> | **Aptos** | Hex account addresses (Ed25519) | `/aptos` |
| <img src="public/chains/sui.svg" width="20" height="20" alt="Sui" /> | **Sui** | Hex account addresses (Ed25519) | `/sui` |
| <img src="public/chains/ton.svg" width="20" height="20" alt="TON" /> | **TON** | Wallet v4R2 (`UQ…` / `EQ…`) | `/ton` |
| <img src="public/chains/cardano.svg" width="20" height="20" alt="Cardano" /> | **Cardano** | Enterprise `addr1…` (CIP-19 type 6) | `/cardano` |
| <img src="public/chains/xrp.svg" width="20" height="20" alt="XRP" /> | **XRP** | Classic XRPL `r…` (secp256k1) | `/xrp` |

Legacy `/token` redirects to `/sol?mode=mint`. `/eth` redirects to `/evm`.

## Proof of find

After a find, **Share proof** builds a public link to `/proof` with address + pattern only (never the private key). Anyone can open it and verify the match client-side.

## What is a Vanity Address?

A vanity address contains a recognizable pattern instead of looking fully random, for example `VANI…` on Solana, `0xcafe…` on EVM, or a memorable Bitcoin / Tron prefix. Useful for public wallets, donations, and branding.

## Features

- **100% Client-Side** – Generation runs in Web Workers on your device
- **Multi-Chain** – Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, XRP
- **Native Web Crypto** – Fast Ed25519 path for Solana where supported
- **Multi-Core** – Uses available CPU cores for parallel search
- **Deploy Modes** – Solana mint, EVM/Tron CREATE, EVM CREATE2 (salt or deployer)
- **Proof of Find** – Shareable match verification without private keys
- **Recent Finds** – Session history of addresses only (no private keys stored)
- **Pattern Templates** – Quick-start prefixes per forge
- **Key Security Check** – Entropy / CSPRNG / chi-square probes after a find
- **Difficulty Estimates** – Time estimates based on pattern and alphabet
- **Sound Notification** – Optional alert when an address is found
- **Export** – Download keys (format depends on forge: Solana CLI JSON, WIF, hex, …)
- **Works Offline** – No network required after the page loads
- **Mobile Optimized** – Responsive UI with touch-friendly controls

## Security

Vanitas is designed with one principle: **your private keys should never leave your device**.

1. **No Server Communication** – Generation makes zero network requests
2. **Open Source** – Auditable codebase
3. **Live Audit** – [vanitas.fun/audit](https://vanitas.fun/audit) for in-browser checks
4. **Offline Capable** – Works without internet after initial load

## Disclaimer

This tool is provided as-is. Always verify generated keys work correctly before using them for significant transactions. The authors are not responsible for any loss of funds.

*Not affiliated with Solana, Ethereum, Bitcoin, Tron, Aptos, Sui, TON, Cardano, XRP Ledger, or any related foundation or project.*

## License

MIT
