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
    threads?: number;
    out?: string;
    yes?: boolean;
    help?: boolean;
  } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') out.help = true;
    else if (a === '-y' || a === '--yes') out.yes = true;
    else if (a === '--prefix') out.prefix = argv[++i];
    else if (a === '--suffix') out.suffix = argv[++i];
    else if (a === '--mode') out.mode = argv[++i];
    else if (a === '--threads') out.threads = Number(argv[++i]);
    else if (a === '--out') out.out = argv[++i];
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
  npx vanitas ton --mode non-bounceable --prefix UQ --threads 8

${pc.bold('Chains')}
  sol  evm  btc  tron  aptos  sui  ton  cardano

${pc.bold('Options')}
  --prefix <str>    Address prefix
  --suffix <str>    Address suffix
  --mode <str>      Chain-specific mode (btc: legacy|segwit|taproot · ton: non-bounceable|bounceable)
  --threads <n>     Worker threads (default: CPU cores - 1)
  --out <file>      Write JSON result to file
  -y, --yes         Skip confirm
  -h, --help        Show help

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

async function wizard(partial: ReturnType<typeof parseArgs>): Promise<MineConfig & { threads: number; out?: string }> {
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
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const fullyFlagged = Boolean(args.chain && (args.prefix || args.suffix));
  const cfg = fullyFlagged
    ? {
        chain: args.chain as CliChain,
        mode:
          args.mode ||
          CHAIN_META.find((c) => c.id === args.chain)?.modes[0].id ||
          'wallet',
        prefix: args.prefix || '',
        suffix: args.suffix || '',
        caseSensitive: args.chain === 'ton',
        threads: args.threads ?? defaultThreads(),
        out: args.out,
      }
    : await wizard(args);

  if (!CHAIN_META.some((c) => c.id === cfg.chain)) {
    console.error(`Unknown chain: ${cfg.chain}`);
    process.exit(1);
  }

  if (!args.yes && !fullyFlagged) {
    const ok = await p.confirm({
      message: `Mine ${cfg.chain}/${cfg.mode}  pattern ${pc.cyan(cfg.prefix || '·')}…${pc.cyan(cfg.suffix || '·')}  · ${cfg.threads} threads?`,
    });
    if (p.isCancel(ok) || !ok) {
      p.cancel('Stopped.');
      process.exit(0);
    }
  } else if (fullyFlagged) {
    p.intro(`${pc.bgYellow(pc.black(' vanitas '))}`);
    p.log.info(
      `${cfg.chain}/${cfg.mode} · ${cfg.prefix || '·'}…${cfg.suffix || '·'} · ${cfg.threads} threads`
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
        caseSensitive: cfg.caseSensitive,
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
