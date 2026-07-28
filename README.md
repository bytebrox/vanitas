# Vanitas

[Version: 1.9.1](https://vanitas.fun)
[License: MIT](https://opensource.org/licenses/MIT)
[Live Audit](https://vanitas.fun/audit)

**Forge vanity addresses for Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, and XRP, entirely in your browser.**

Create personalized wallet (and related) addresses that start or end with patterns you choose. All cryptographic work runs locally; private keys never leave your device.

Website: [vanitas.fun](https://vanitas.fun)

### Terminal CLI

```bash
npx vanitas
```

Same forges, wizard or flags. See [cli/README.md](cli/README.md).

## Forges


|     | Forge         | Use Case                                           | URL        |
| --- | ------------- | -------------------------------------------------- | ---------- |
|     | **Solana**    | Wallet + token mint (Base58 Ed25519)               | `/sol`     |
|     | **EVM**       | Wallet, CREATE nonce 0, CREATE2 salt / deployer    | `/evm`     |
|     | **Bitcoin**   | Legacy `1…`, SegWit `bc1q…`, Taproot `bc1p…` (WIF) | `/btc`     |
|     | **Tron**      | Wallet + CREATE nonce 0 (`T…` Base58Check)         | `/tron`    |
|     | **Aptos**     | Hex account addresses (Ed25519)                    | `/aptos`   |
|     | **Sui**       | Hex account addresses (Ed25519)                    | `/sui`     |
|     | **TON**       | *Wallet v4R2 (*`UQ…` */* `EQ…`*)*                  | `/ton`     |
|     | ***Cardano*** | *Enterprise* `addr1…` (CIP-19 type 6)              | `/cardano` |
|     | **XRP**       | Classic XRPL `r…` (secp256k1)                      | `/xrp`     |


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