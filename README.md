# Vanitas

[![Version: 1.1.2](https://img.shields.io/badge/Version-1.1.2-8B7355.svg)](https://vanitas.fun)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Live Audit](https://img.shields.io/badge/Live_Audit-vanitas.fun%2Faudit-8B7355.svg)](https://vanitas.fun/audit)

**Forge vanity addresses for Solana, EVM, Bitcoin, and Tron — entirely in your browser.**

Create personalized wallet (and related) addresses that start or end with patterns you choose. All cryptographic work runs locally — private keys never leave your device.

Website: [vanitas.fun](https://vanitas.fun)

## Forges

| Forge | Use Case | URL |
|-------|----------|-----|
| **Solana** | Wallet + token mint (Base58 Ed25519) | `/sol` |
| **EVM** | Wallet + contract CREATE nonce 0 (`0x` hex) | `/evm` |
| **Bitcoin** | Legacy `1…` + SegWit `bc1q…` (WIF export) | `/btc` |
| **Tron** | Base58Check `T…` addresses | `/tron` |

Legacy `/token` redirects to `/sol?mode=mint`. `/eth` redirects to `/evm`.

## What is a Vanity Address?

A vanity address contains a recognizable pattern instead of looking fully random — for example `VANI…` on Solana, `0xcafe…` on EVM, or a memorable Bitcoin / Tron prefix. Useful for public wallets, donations, and branding.

## Features

- **100% Client-Side** – Generation runs in Web Workers on your device
- **Multi-Chain** – Solana, EVM (Ethereum, BNB, Base, …), Bitcoin, Tron
- **Native Web Crypto** – Fast Ed25519 path for Solana where supported
- **Multi-Core** – Uses available CPU cores for parallel search
- **Token Mint & Contract Modes** – Solana mint + EVM CREATE (nonce 0)
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

*Not affiliated with Solana, Ethereum, Bitcoin, Tron, or any related foundation or project.*

## License

MIT
