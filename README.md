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

## Marketplace (optional, off by default)

- `/market` is a board for ready-made EVM addresses on Robinhood Chain. It is the one part of Vanitas that runs against a server, and it stays hidden unless `NEXT_PUBLIC_MARKET_ENABLED=true` is set at build time. Nothing about the free forges changes when it is on.
- The board pages server side and can be filtered by any run of hex characters, matched anywhere in the address. Both are query parameters on `/api/market/listings` (`offset`, `limit`, `q`), so nothing accumulates in the browser as the inventory grows.
- Sellers still grind in their own browser, but under a **split key**: the server keeps a secret scalar `s` and hands out only the point `S = s·G`, the worker searches for a scalar `b` such that `address(b·G + S)` matches, and the final key is `b + s`. Neither side alone can spend from a listing while it is being forged. Once the listing exists the platform does hold the combined key, encrypted, until a buyer has paid — that difference is stated on every market page.
- Buyers pay the exact price to a one-time deposit address derived from a BIP32 seed. There is no smart contract and no approval to sign; a settlement cron watches balances, releases the key, and forwards the payment from the deposit address straight to the seller. Money that no sale will use, an underpayment or a transfer that landed after the window closed, is returned to the buyer by the same pass.
- The delivered key stays available in the buyer's account instead of being deleted after a grace period, and can be copied or downloaded as a text file. That is a deliberate trade: it survives a lost tab, at the cost of the platform keeping a copy, which is why buyers are told to move anything valuable onto a key only they have ever seen.
- **There is no commission and no listing fee.** Because there is also no margin to pay network fees out of, every transfer funds itself: the payout pins its own `maxFeePerGas`, measures the gas the actual recipient needs, reserves exactly `gas × maxFeePerGas` from the amount being moved, and sends the rest. The reserve is therefore a hard upper bound, the transfer cannot run out of gas, and the platform never pays anything out of its own pocket. No hot wallet has to be funded.
- Two scripts rehearse all of this against the testnet with real transfers. `node scripts/market-e2e.mjs` walks a sale from grinding to payout and verifies the delivered key really controls the advertised address; `node scripts/market-e2e-refund.mjs` underpays on purpose and checks the money comes home. Both print the address to top up when the funding account is empty.
- Deployment needs Neon Postgres, an RPC endpoint, and the secrets listed in [.env.example](.env.example); `node scripts/market-secrets.mjs` generates the three random ones plus the cron token. The Vercel Neon integration provides `DATABASE_URL` and `DATABASE_URL_UNPOOLED` under exactly those names, so only the `MARKET_*` values and `CRON_SECRET` have to be added by hand. Apply the schema once with `npm run db:migrate`. All browser RPC traffic goes through `/api/market/rpc` so the `connect-src 'self'` policy stays as it is. Minute-resolution crons require a Vercel Pro plan; on Hobby the "I have paid" button carries the load.
- Nothing in the schema records which chain a row belongs to, so switching `MARKET_CHAIN` between testnet and mainnet does not separate the data. Clear the marketplace tables and issue fresh secrets before pointing a rehearsed deployment at real money.

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

The optional marketplace is the documented exception: it needs an account, a server, and custody of the finished key between listing and sale. It is opt-in, clearly marked in the UI, and covered separately in the [Terms](https://vanitas.fun/terms) and [Privacy](https://vanitas.fun/privacy) pages.

## Disclaimer

This tool is provided as-is. Always verify generated keys work correctly before using them for significant transactions. The authors are not responsible for any loss of funds.

*Not affiliated with Solana, Ethereum, Bitcoin, Tron, Aptos, Sui, TON, Cardano, XRP Ledger, or any related foundation or project.*

## License

MIT