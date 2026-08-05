# Vanitas CLI

Forge vanity addresses in your terminal. Same idea as [vanitas.fun](https://vanitas.fun): keys stay on your machine.

## Quick start

```bash
npx vanitas
```

Follow the prompts (chain → mode → pattern → threads). When a match is found, a JSON file is written in the current folder.

## Examples

```bash
npx vanitas sol --prefix Ace
npx vanitas sol --prefix Ace --pattern Bee --pattern Cat:zz
npx vanitas sol --mode mint --prefix Ace
npx vanitas evm --prefix cafe --threads 8
npx vanitas evm --mode contract --prefix cafe
npx vanitas evm --mode create2-salt --prefix cafe --deployer-key 0x… --init-code-hash 0x…
npx vanitas evm --mode create2-deployer --prefix cafe --salt 0x… --init-code-hash 0x…
npx vanitas tron --mode contract --prefix RON
npx vanitas btc --mode taproot --prefix qabc
npx vanitas ton --mode non-bounceable --prefix UQ
npx vanitas cardano --prefix cafe --out ./my-ada.json
npx vanitas xrp --prefix Ace
```

### Multi-pattern (OR)

Repeat `--pattern prefix[:suffix]`. One key is generated and matched against any target; the first hit wins.

```bash
npx vanitas sol --prefix Ace --pattern Bee --pattern Cat:zz --threads 8
```

### Seed Forge

BIP-39 index grinding (Solana, EVM, Bitcoin, Tron) lives on the web for now:

```bash
npx vanitas seed
```

Opens the pointer to [vanitas.fun/seed](https://vanitas.fun/seed).

## Chains

| Chain   | Modes                                      | Notes                          |
|---------|--------------------------------------------|--------------------------------|
| sol     | `wallet`, `mint`                           | Base58; mint = same keypair math |
| evm     | `wallet`, `contract`, `create2-salt`, `create2-deployer` | Hex `0x`; CREATE / CREATE2 |
| btc     | `legacy`, `segwit`, `taproot`              | Legacy / SegWit / Taproot      |
| tron    | `wallet`, `contract`                       | `T…` Base58; CREATE nonce 0    |
| aptos   | `wallet`                                   | Hex                            |
| sui     | `wallet`                                   | Hex                            |
| ton     | `non-bounceable`, `bounceable`             | Wallet v4R2 UQ / EQ            |
| cardano | `enterprise`                               | Enterprise `addr1…`            |
| xrp     | `classic`                                  | Classic `r…`                   |

### CREATE2 flags (EVM)

| Flag | Used by | Description |
|------|---------|-------------|
| `--init-code-hash <hex>` | `create2-salt`, `create2-deployer` | `keccak256` of init code |
| `--deployer-key <hex>` | `create2-salt` | Fixed deployer private key |
| `--salt <hex>` | `create2-deployer` | Fixed 32-byte salt |

## Safety

- No network calls during mining
- Output file mode `0600` when the OS supports it
- Never commit or paste private keys

## Local development

```bash
cd cli
npm install
npm run build
node dist/index.js --help
```
