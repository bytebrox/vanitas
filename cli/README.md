# Vanitas CLI

Forge vanity addresses in your terminal. Same idea as [vanitas.fun](https://vanitas.fun): keys stay on your machine.

## Quick start

```bash
npx vanitas
```

Follow the prompts (chain → pattern → threads). When a match is found, a JSON file is written in the current folder.

## Examples

```bash
npx vanitas sol --prefix Ace
npx vanitas evm --prefix cafe --threads 8
npx vanitas btc --mode taproot --prefix qabc
npx vanitas ton --mode non-bounceable --prefix UQ
npx vanitas cardano --prefix cafe --out ./my-ada.json
npx vanitas xrp --prefix Ace
```

## Chains

| Chain   | Notes                          |
|---------|--------------------------------|
| sol     | Base58 wallet                  |
| evm     | Hex `0x` wallet                |
| btc     | legacy / segwit / taproot      |
| tron    | `T…` Base58                    |
| aptos   | Hex                            |
| sui     | Hex                            |
| ton     | Wallet v4R2 UQ / EQ            |
| cardano | Enterprise `addr1…`            |
| xrp     | Classic `r…`                   |

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
