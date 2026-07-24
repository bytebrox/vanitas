# Vanitas

[![Version: 0.9.5](https://img.shields.io/badge/Version-0.9.5-8B7355.svg)](https://vanitas.fun)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Live Audit](https://img.shields.io/badge/Live_Audit-vanitas.fun%2Faudit-8B7355.svg)](https://vanitas.fun/audit)

**Generate custom Solana addresses – entirely in your browser.**

Create personalized Solana wallet addresses and token mint addresses that start or end with specific characters (like `SOL...` or `...MOON`). All cryptographic operations happen locally on your device – your private keys never leave your browser.

Website: [vanitas.fun](https://vanitas.fun)

## Two Generators

| Generator | Use Case | URL |
|-----------|----------|-----|
| **Wallet Address** | Personal wallets, donations, branding | `/` |
| **Token Mint Address** | Token launches on any Solana launchpad | `/token` |

## What is a Vanity Address?

A vanity address is a cryptocurrency wallet address that contains a recognizable pattern. Instead of a random address like `4tVbKSR8gniF2Lq7aEzHbMD8WCAdPJBn6G9oPYzXmJcR`, you can generate one like:

- `VANI...` (starts with your pattern)
- `...TAS` (ends with your pattern)

This makes addresses more memorable and personal – perfect for public wallets, donations, or branding.

## Features

- **100% Client-Side** – All computation happens in your browser
- **125x Faster** – Native Web Crypto API outperforms all JavaScript/WASM implementations
- **Multi-Core Processing** – Uses all available CPU cores (~100,000 keys/second)
- **Token Mint Generator** – Create vanity addresses for token launches on any Solana launchpad
- **Domain Suggestions** – Get matching .sol, .solana, .bonk, .poor domain suggestions after generating
- **Key Security Check** – Verify cryptographic quality with real-time entropy analysis
- **Smart Difficulty Estimation** – Accurate time estimates including first-character rarity
- **Sound Notification** – Optional audio alert when address is found
- **Instant Export** – Download keys as TXT or JSON (Solana CLI compatible)
- **Works Offline** – No internet required after page loads
- **Mobile Optimized** – Fully responsive design with touch-friendly controls

## Security

Vanitas is designed with a single principle: **your private keys should never leave your device**.

1. **No Server Communication** – The generation process makes zero network requests
2. **Open Source** – The codebase is auditable
3. **Live Audit** – Visit [vanitas.fun/audit](https://vanitas.fun/audit) for automated browser checks
4. **Offline Capable** – Works without internet after initial load

## Disclaimer

This tool is provided as-is. Always verify generated keys work correctly before using them for significant transactions. The authors are not responsible for any loss of funds.

*Not affiliated with the Solana Foundation.*

## License

MIT
