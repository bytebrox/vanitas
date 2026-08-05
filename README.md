# Vanitas

[Version: 1.13.0](https://vanitas.fun)
[License: MIT](https://opensource.org/licenses/MIT)
[CI](https://github.com/bytebrox/vanitas/actions/workflows/build.yml)
[OpenSSF Scorecard](https://securityscorecards.dev/viewer/?uri=github.com/bytebrox/vanitas)
[Live Audit](https://vanitas.fun/audit)

**Forge vanity addresses for Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, and XRP, entirely in your browser.**

Create personalized wallet (and related) addresses that start or end with patterns you choose. All cryptographic work runs locally; private keys never leave your device.

Website: [vanitas.fun](https://vanitas.fun)

### Token

Live on Robinhood.

Contract address:

```text
0x1bfab31ae01a030ae600da4825389a60156952c1
```



### Terminal CLI

```bash
npx vanitas
npx vanitas sol --prefix Ace --pattern Bee --threads 8
```

Same forges, wizard or flags (including multi-pattern OR). See [cli/README.md](cli/README.md).

## Forges


|     | Forge       | Use Case                                           | URL        |
| --- | ----------- | -------------------------------------------------- | ---------- |
|     | **Solana**  | Wallet + token mint (Base58 Ed25519)               | `/sol`     |
|     | **EVM**     | Wallet, CREATE nonce 0, CREATE2 salt / deployer    | `/evm`     |
|     | **Bitcoin** | Legacy `1…`, SegWit `bc1q…`, Taproot `bc1p…` (WIF) | `/btc`     |
|     | **Tron**    | Wallet + CREATE nonce 0 (`T…` Base58Check)         | `/tron`    |
|     | **Aptos**   | Hex account addresses (Ed25519)                    | `/aptos`   |
|     | **Sui**     | Hex account addresses (Ed25519)                    | `/sui`     |
|     | **TON**     | Wallet v4R2 (`UQ…` / `EQ…`)                        | `/ton`     |
|     | **Cardano** | Enterprise `addr1…` (CIP-19 type 6)                | `/cardano` |
|     | **XRP**     | Classic XRPL `r…` (secp256k1)                      | `/xrp`     |


Legacy `/token` redirects to `/sol?mode=mint`. `/eth` redirects to `/evm`.

## Tools


| Tool               | Use                                                                               | URL          |
| ------------------ | --------------------------------------------------------------------------------- | ------------ |
| **Pattern Lab**    | Difficulty / rarity before you mine, multi-pattern OR, CREATE2 modes, batch queue | `/lab`       |
| **Seed Forge**     | Vanity from a BIP-39 phrase (Solana, EVM, Bitcoin, Tron)                          | `/seed`      |
| **CREATE2 helper** | initCodeHash from bytecode, salt preview, deep-link to EVM forge                  | `/create2`   |
| **Lookalike**      | Alphabet / case traps before you grind                                            | `/lookalike` |




## Proof of find

After a find, **Share proof** builds a public link to `/proof` with address + pattern only (never the private key). Anyone can open it and verify the match client-side.

## Marketplace

[vanitas.fun/market](https://vanitas.fun/market) is where finished addresses change hands. A good pattern costs time: six fixed characters on EVM is roughly 16 million tries, and every further character multiplies that by sixteen. Not everyone wants to leave a laptop running for it. The board lets whoever already spent that time pass the result on.

Everything is priced in ETH on Robinhood Chain. Connect any browser wallet to take part.

**Buying.** Search the board for the characters you want, anywhere in the address, and open a listing. You get a one-time deposit address and pay the exact price to it. There is no contract to approve and no token allowance to sign. The moment the payment lands the private key is released: copy it, or download it as a text file. It also stays in your account, so a closed tab is not a lost key. Import it into any wallet that accepts a raw EVM key.

Pay too little, or too late, and the money comes back to you on its own. Nothing is kept.

**Selling.** Grind an address on the market forge and name your own price. The search runs on your own machine, the same as the free forges. Once it sells, the money goes straight from the buyer to the payout address you set.

**No commission and no listing fee.** The only thing taken out is the network fee for the single transfer that pays you.

**Worth knowing before you buy.** This is the one corner of Vanitas that involves a server. While an address is being ground the key exists in two halves, one in the seller's browser and one on ours, so a seller can never walk away with a copy of what they sold you. But from the moment a listing goes up until a buyer pays, the finished key does sit with us, encrypted. A purchased address has been through our hands, and you are trusting us on that step. Every market page says so plainly.

Buy here for an address you want to show, receive on, or brand. **For a wallet meant to hold serious value, use a free forge.** There the key is made on your machine and never goes anywhere.

What is a Vanity Address?

A vanity address contains a recognizable pattern instead of looking fully random, for example `VANI…` on Solana, `0xcafe…` on EVM, or a memorable Bitcoin / Tron prefix. Useful for public wallets, donations, and branding.

## Features

- **100% Client-Side** – Generation runs in Web Workers on your device
- **Multi-Chain** – Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, XRP
- **Multi-Pattern OR** – Match any of several prefix/suffix targets in one run
- **Seed Forge** – Recoverable vanity from a BIP-39 phrase (Sol, EVM, BTC, Tron)
- **Pattern Lab** – Difficulty matrix, CREATE2 modes, batch queue before mining
- **Native Web Crypto** – Fast Ed25519 path for Solana where supported
- **Multi-Core** – Uses available CPU cores for parallel search
- **Deploy Modes** – Solana mint, EVM/Tron CREATE, EVM CREATE2 (salt or deployer)
- **Proof of Find** – Shareable match verification without private keys
- **Marketplace** – Buy or sell finished EVM addresses in ETH on Robinhood Chain
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

That covers every forge and every tool. The [marketplace](#marketplace) is the one documented exception, because a sale cannot work without an account, a server, and custody of the key between listing and payment. It is marked as such wherever it appears, and the details are in the [Terms](https://vanitas.fun/terms) and [Privacy](https://vanitas.fun/privacy) pages.

## Disclaimer

This tool is provided as-is. Always verify generated keys work correctly before using them for significant transactions. The authors are not responsible for any loss of funds.

*Not affiliated with Solana, Ethereum, Bitcoin, Tron, Aptos, Sui, TON, Cardano, XRP Ledger, or any related foundation or project.*

## License

MIT