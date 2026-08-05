/**
 * Vanitas CLI — interactive vanity forge
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { cpus } from 'os';
import { CHAIN_META, type CliChain, type MineConfig, type MineHit } from './chains';
import { mineParallel } from './pool';

function parseArgs(argv: string[]) {
  const out: {
    chain?: string;
    mode?: string;
    prefix?: string;
    suffix?: string;
    patterns: { prefix: string; suffix: string }[];
    threads?: number;
    out?: string;
    yes?: boolean;
    help?: boolean;
    create2Salt?: string;
    create2InitCodeHash?: string;
    create2DeployerKey?: string;
  } = { patterns: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') out.help = true;
    else if (a === '-y' || a === '--yes') out.yes = true;
    else if (a === '--prefix') out.prefix = argv[++i];
    else if (a === '--suffix') out.suffix = argv[++i];
    else if (a === '--pattern') {
      const raw = argv[++i] || '';
      const colon = raw.indexOf(':');
      if (colon === -1) out.patterns.push({ prefix: raw, suffix: '' });
      else out.patterns.push({ prefix: raw.slice(0, colon), suffix: raw.slice(colon + 1) });
    } else if (a === '--mode') out.mode = argv[++i];
    else if (a === '--threads') out.threads = Number(argv[++i]);
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--salt') out.create2Salt = argv[++i];
    else if (a === '--init-code-hash') out.create2InitCodeHash = argv[++i];
    else if (a === '--deployer-key') out.create2DeployerKey = argv[++i];
    else if (!a.startsWith('-') && !out.chain) out.chain = a;
  }
  return out;
}

function printHelp() {
  console.log(`
${pc.bold('vanitas')} ${pc.dim('cli')} · vanity forge

${pc.bold('Usage')}
  npx vanitas                 Interactive wizard (recommended)
  npx vanitas sol --prefix Ace
  npx vanitas sol --prefix Ace --pattern Bee --pattern Cat:zz
  npx vanitas sol --mode mint --prefix Ace
  npx vanitas evm --mode contract --prefix cafe
  npx vanitas evm --mode create2-salt --prefix cafe --deployer-key 0x… --init-code-hash 0x…
  npx vanitas evm --mode create2-deployer --prefix cafe --salt 0x… --init-code-hash 0x…
  npx vanitas tron --mode contract --prefix RON
  npx vanitas ton --mode non-bounceable --prefix UQ --threads 8

${pc.bold('Chains')}
  sol  evm  btc  tron  aptos  sui  ton  cardano  xrp

${pc.bold('Options')}
  --prefix <str>           Address prefix
  --suffix <str>           Address suffix
  --pattern <prefix[:suffix]>  Extra OR target (repeatable); e.g. Ace or Ace:zz
  --mode <str>             Chain mode (see below)
  --threads <n>            Worker threads (default: CPU cores - 1)
  --out <file>             Write JSON result to file
  --salt <hex>             CREATE2 fixed salt (create2-deployer)
  --init-code-hash <hex>   CREATE2 keccak(init code)
  --deployer-key <hex>     CREATE2 fixed deployer key (create2-salt)
  -y, --yes                Skip confirm
  -h, --help               Show help

${pc.bold('Modes')}
  sol:   wallet | mint
  evm:   wallet | contract | create2-salt | create2-deployer
  btc:   legacy | segwit | taproot
  tron:  wallet | contract
  ton:   non-bounceable | bounceable

${pc.dim('Keys never leave this machine. vanitas.fun')}
`);
}

function defaultThreads(): number {
  return Math.max(1, (cpus()?.length || 4) - 1);
}

function formatRate(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M/s`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k/s`;
  return `${Math.round(n)}/s`;
}

function saveHit(hit: MineHit, outPath?: string): string {
  const file =
    outPath ||
    join(
      process.cwd(),
      `vanitas-${hit.chain}-${hit.address.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}.json`
    );
  const payload = {
    chain: hit.chain,
    mode: hit.mode,
    address: hit.address,
    privateKey: hit.privateKey,
    ...hit.extra,
    attempts: hit.attempts,
    durationMs: hit.durationMs,
    generatedAt: new Date().toISOString(),
    tool: 'vanitas-cli',
    warning: 'Never share the private key. Generated locally.',
  };
  writeFileSync(file, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
  return file;
}

async function promptHex32(message: string, initial?: string): Promise<string> {
  const v = await p.text({
    message,
    initialValue: initial || '',
    placeholder: '0x… (64 hex chars)',
    validate: (raw) => {
      const clean = (raw || '').replace(/^0x/i, '');
      if (!/^[0-9a-fA-F]{64}$/.test(clean)) return 'Need 32-byte hex (64 chars, optional 0x)';
    },
  });
  if (p.isCancel(v)) {
    p.cancel('Stopped.');
    process.exit(0);
  }
  return String(v);
}

type WizardResult = MineConfig & { threads: number; out?: string };

async function wizard(partial: ReturnType<typeof parseArgs>): Promise<WizardResult> {
  p.intro(`${pc.bgYellow(pc.black(' vanitas '))} ${pc.dim('local vanity forge')}`);

  const chain = (partial.chain ||
    (await p.select({
      message: 'Which chain?',
      options: CHAIN_META.map((c) => ({
        value: c.id,
        label: c.label,
        hint: c.hint,
      })),
    }))) as CliChain | symbol;

  if (p.isCancel(chain)) {
    p.cancel('Stopped.');
    process.exit(0);
  }

  const meta = CHAIN_META.find((c) => c.id === chain)!;
  let mode = partial.mode || meta.modes[0].id;
  if (!partial.mode && meta.modes.length > 1) {
    const picked = await p.select({
      message: 'Mode',
      options: meta.modes.map((m) => ({ value: m.id, label: m.label })),
    });
    if (p.isCancel(picked)) {
      p.cancel('Stopped.');
      process.exit(0);
    }
    mode = picked as string;
  }

  let create2Salt = partial.create2Salt;
  let create2InitCodeHash = partial.create2InitCodeHash;
  let create2DeployerKey = partial.create2DeployerKey;

  if (chain === 'evm' && (mode === 'create2-salt' || mode === 'create2-deployer')) {
    if (!create2InitCodeHash) {
      create2InitCodeHash = await promptHex32('CREATE2 init code hash (keccak256 of init code)');
    }
    if (mode === 'create2-deployer' && !create2Salt) {
      create2Salt = await promptHex32('Fixed CREATE2 salt');
    }
    if (mode === 'create2-salt' && !create2DeployerKey) {
      create2DeployerKey = await promptHex32('Fixed deployer private key');
    }
  }

  let prefix = partial.prefix ?? '';
  let suffix = partial.suffix ?? '';
  if (partial.prefix == null) {
    const pref = await p.text({
      message: 'Prefix (leave empty for none)',
      placeholder: chain === 'evm' || chain === 'aptos' || chain === 'sui' ? 'cafe' : 'Ace',
    });
    if (p.isCancel(pref)) {
      p.cancel('Stopped.');
      process.exit(0);
    }
    prefix = String(pref || '');
  }
  if (partial.suffix == null) {
    const suf = await p.text({
      message: 'Suffix (optional)',
      placeholder: '',
    });
    if (p.isCancel(suf)) {
      p.cancel('Stopped.');
      process.exit(0);
    }
    suffix = String(suf || '');
  }

  if (!prefix && !suffix) {
    p.log.error('Need at least a prefix or suffix.');
    process.exit(1);
  }

  const caseSensitive =
    chain === 'sol' || chain === 'btc' || chain === 'tron'
      ? false
      : chain === 'ton'
        ? true
        : false;

  let threads = partial.threads ?? defaultThreads();
  if (partial.threads == null) {
    const t = await p.text({
      message: 'Threads',
      initialValue: String(defaultThreads()),
      validate: (v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 1 || n > 64) return 'Enter 1–64';
      },
    });
    if (p.isCancel(t)) {
      p.cancel('Stopped.');
      process.exit(0);
    }
    threads = Number(t);
  }

  return {
    chain,
    mode,
    prefix,
    suffix,
    caseSensitive,
    threads,
    out: partial.out,
    create2Salt,
    create2InitCodeHash,
    create2DeployerKey,
  };
}

function validateCreate2Flags(cfg: MineConfig) {
  if (cfg.chain !== 'evm') return;
  if (cfg.mode === 'create2-salt') {
    if (!cfg.create2InitCodeHash) throw new Error('--init-code-hash required for create2-salt');
    if (!cfg.create2DeployerKey) throw new Error('--deployer-key required for create2-salt');
  }
  if (cfg.mode === 'create2-deployer') {
    if (!cfg.create2InitCodeHash) throw new Error('--init-code-hash required for create2-deployer');
    if (!cfg.create2Salt) throw new Error('--salt required for create2-deployer');
  }
}


function buildPatterns(args: ReturnType<typeof parseArgs>): { prefix: string; suffix: string }[] {
  const list: { prefix: string; suffix: string }[] = [];
  if (args.prefix || args.suffix) {
    list.push({ prefix: args.prefix || '', suffix: args.suffix || '' });
  }
  for (const t of args.patterns) {
    if (t.prefix || t.suffix) list.push(t);
  }
  return list;
}

function describePatterns(
  prefix: string,
  suffix: string,
  patterns?: { prefix: string; suffix: string }[]
): string {
  const n =
    patterns && patterns.length > 0
      ? patterns.length
      : prefix || suffix
        ? 1
        : 0;
  if (n > 1) return `OR ${n} patterns`;
  return `${prefix || '·'}…${suffix || '·'}`;
}

async function run() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return;
  }

  // Optional seed entry: BIP39 grind lives on the web for now
  if (args.chain === 'seed' || argv[0] === 'seed') {
    console.log(`
Seed Forge (BIP39 index grind for Sol/EVM) is available at:
  https://vanitas.fun/seed

CLI seed mining is not in this package yet.
`);
    process.exit(0);
  }

  const patterns = buildPatterns(args);
  const fullyFlagged = Boolean(args.chain && (args.prefix || args.suffix || args.patterns.length));
  const cfg: WizardResult = fullyFlagged
    ? {
        chain: args.chain as CliChain,
        mode:
          args.mode ||
          CHAIN_META.find((c) => c.id === args.chain)?.modes[0].id ||
          'wallet',
        prefix: args.prefix || '',
        suffix: args.suffix || '',
        patterns,
        caseSensitive: args.chain === 'ton',
        threads: args.threads ?? defaultThreads(),
        out: args.out,
        create2Salt: args.create2Salt,
        create2InitCodeHash: args.create2InitCodeHash,
        create2DeployerKey: args.create2DeployerKey,
      }
    : await wizard(args);

  if (!CHAIN_META.some((c) => c.id === cfg.chain)) {
    console.error(`Unknown chain: ${cfg.chain}`);
    process.exit(1);
  }

  try {
    validateCreate2Flags(cfg);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  if (!args.yes && !fullyFlagged) {
    const patternLabel = describePatterns(cfg.prefix, cfg.suffix, cfg.patterns);
    const ok = await p.confirm({
      message: `Mine ${cfg.chain}/${cfg.mode}  pattern ${pc.cyan(patternLabel)}  · ${cfg.threads} threads?`,
    });
    if (p.isCancel(ok) || !ok) {
      p.cancel('Stopped.');
      process.exit(0);
    }
  } else if (fullyFlagged) {
    p.intro(`${pc.bgYellow(pc.black(' vanitas '))}`);
    p.log.info(
      `${cfg.chain}/${cfg.mode} · ${describePatterns(cfg.prefix, cfg.suffix, cfg.patterns)} · ${cfg.threads} threads`
    );
  }

  const spin = p.spinner();
  spin.start('Forging…');

  try {
    const hit = await mineParallel(
      {
        chain: cfg.chain,
        mode: cfg.mode,
        prefix: cfg.prefix,
        suffix: cfg.suffix,
        patterns: cfg.patterns,
        caseSensitive: cfg.caseSensitive,
        create2Salt: cfg.create2Salt,
        create2InitCodeHash: cfg.create2InitCodeHash,
        create2DeployerKey: cfg.create2DeployerKey,
      },
      cfg.threads,
      (prog) => {
        spin.message(
          `Forging… ${pc.dim(prog.attempts.toLocaleString() + ' attempts')} · ${formatRate(prog.rate)}`
        );
      }
    );

    spin.stop('Found');

    p.note(
      [
        `${pc.bold('Address')}  ${hit.address}`,
        hit.extra?.deployerAddress
          ? `${pc.bold('Deployer')} ${hit.extra.deployerAddress}`
          : '',
        hit.extra?.create2Salt ? `${pc.bold('Salt')}     ${hit.extra.create2Salt.slice(0, 18)}…` : '',
        `${pc.bold('Key')}      ${hit.privateKey.slice(0, 18)}…`,
        hit.extra?.wif ? `${pc.bold('WIF')}      ${hit.extra.wif.slice(0, 18)}…` : '',
        `${pc.bold('Stats')}    ${hit.attempts.toLocaleString()} attempts · ${(hit.durationMs / 1000).toFixed(1)}s`,
      ]
        .filter(Boolean)
        .join('\n'),
      'Keep this secret'
    );

    const file = saveHit(hit, cfg.out);
    p.log.success(`Saved ${pc.underline(file)}`);
    p.log.warn('Never share the private key. Nothing was uploaded.');
    p.outro(`Done · ${pc.dim('vanitas.fun')}`);
  } catch (err) {
    spin.stop('Failed');
    p.log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

run();
