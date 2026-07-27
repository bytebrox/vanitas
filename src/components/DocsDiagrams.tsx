'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';

/** Shared figure frame for docs SVGs */
export function DocFigure({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-6 border-y border-ink/15 py-5 not-italic">
      <div className="overflow-x-auto">{children}</div>
      <figcaption className="mt-4 text-micro uppercase tracking-[0.16em] text-muted text-center">
        {caption}
      </figcaption>
    </figure>
  );
}

const PIPE_STEPS = [
  {
    id: 'rng',
    label: 'RNG',
    title: 'Secure random',
    detail: 'crypto.getRandomValues draws a fresh private key — full entropy, every attempt.',
  },
  {
    id: 'derive',
    label: 'Derive',
    title: 'Public key',
    detail: 'Ed25519 or secp256k1 turns the secret into a public key on the chain\'s curve.',
  },
  {
    id: 'encode',
    label: 'Encode',
    title: 'Address',
    detail: 'Base58, hex, bech32, Base64url — whatever that forge’s network expects.',
  },
  {
    id: 'match',
    label: 'Match',
    title: 'Pattern check',
    detail: 'Compare prefix / suffix (and mode rules). Miss → loop. Hit → stop the pool.',
  },
  {
    id: 'done',
    label: 'Done',
    title: 'Reveal',
    detail: 'UI shows address + key. Optional proof, export, sound — keys never leave the device.',
  },
] as const;

/** Interactive search-loop diagram for How it works → Pipeline */
export function DocSearchLoop() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % PIPE_STEPS.length);
    }, 2200);
    return () => window.clearInterval(t);
  }, [paused]);

  const step = PIPE_STEPS[active];
  const w = 520;
  const h = 168;
  const cy = 58;
  const gap = w / (PIPE_STEPS.length + 0.4);
  const xs = PIPE_STEPS.map((_, i) => gap * (i + 0.7));

  return (
    <DocFigure caption="Fig. — Search loop · click a stage">
      <div
        className="select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xl mx-auto h-auto block" role="img">
          <title>Vanitas search loop</title>
          {/* return arc */}
          <path
            d={`M ${xs[4]} ${cy + 28} C ${xs[4] + 36} ${cy + 72}, ${xs[0] - 36} ${cy + 72}, ${xs[0]} ${cy + 28}`}
            fill="none"
            stroke="#2C2A27"
            strokeOpacity="0.18"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={(xs[0] + xs[4]) / 2}
            y={cy + 88}
            textAnchor="middle"
            fill="#6B6560"
            style={{ fontSize: 9, letterSpacing: '0.14em' }}
          >
            MISS → AGAIN
          </text>

          {xs.slice(0, -1).map((x, i) => (
            <line
              key={`l-${i}`}
              x1={x + 22}
              y1={cy}
              x2={xs[i + 1] - 22}
              y2={cy}
              stroke="#2C2A27"
              strokeOpacity={active > i ? 0.45 : 0.15}
              strokeWidth="1.5"
              style={{ transition: 'stroke-opacity 0.4s' }}
            />
          ))}

          {PIPE_STEPS.map((s, i) => {
            const on = i === active;
            const x = xs[i];
            return (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => {
                  setActive(i);
                  setPaused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(i);
                    setPaused(true);
                  }
                }}
              >
                <circle
                  cx={x}
                  cy={cy}
                  r={on ? 18 : 15}
                  fill={on ? '#8B7355' : '#F5F0E8'}
                  stroke={on ? '#8B7355' : '#2C2A27'}
                  strokeOpacity={on ? 1 : 0.35}
                  strokeWidth="1.75"
                  style={{ transition: 'r 0.35s ease, fill 0.35s ease' }}
                />
                <text
                  x={x}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={on ? '#F5F0E8' : '#2C2A27'}
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text
                  x={x}
                  y={cy + 36}
                  textAnchor="middle"
                  fill={on ? '#2C2A27' : '#6B6560'}
                  style={{ fontSize: 10, letterSpacing: '0.08em', fontWeight: on ? 600 : 400 }}
                >
                  {s.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-2 text-center px-2 min-h-[4.5rem]">
          <p className="font-display text-lg font-semibold text-ink normal-case tracking-tight">
            {step.title}
          </p>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto leading-relaxed">{step.detail}</p>
        </div>
      </div>
    </DocFigure>
  );
}

const ALPHABETS = [
  { id: 'hex', label: 'Hex', size: 16, note: 'EVM · Aptos · Sui' },
  { id: 'bech', label: 'Bech32', size: 32, note: 'BTC SegWit · Cardano' },
  { id: 'b58', label: 'Base58', size: 58, note: 'Solana · Tron · Legacy' },
] as const;

/** Alphabet × length difficulty explorer */
export function DocDifficultyScale() {
  const [len, setLen] = useState(4);
  const [alpha, setAlpha] = useState(0);
  const a = ALPHABETS[alpha];
  const attempts = Math.pow(a.size, len);
  const log = Math.min(1, Math.log10(Math.max(1, attempts)) / 15);
  const bars = 16;
  const filled = Math.round(log * bars);

  const formatAttempts = (n: number) => {
    if (n < 1e6) return `~${n.toLocaleString('en-US')}`;
    if (n < 1e9) return `~${(n / 1e6).toFixed(1)}M`;
    if (n < 1e12) return `~${(n / 1e9).toFixed(1)}B`;
    if (n < 1e15) return `~${(n / 1e12).toFixed(1)}T`;
    return 'beyond extreme';
  };

  return (
    <DocFigure caption="Fig. — Difficulty explorer · drag length · pick alphabet">
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex flex-wrap justify-center gap-2">
          {ALPHABETS.map((opt, i) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAlpha(i)}
              className={`px-3 py-1.5 text-micro uppercase tracking-[0.14em] border transition-colors ${
                i === alpha
                  ? 'border-ink bg-ink text-paper'
                  : 'border-ink/25 text-muted hover:border-ink hover:text-ink'
              }`}
            >
              {opt.label}
              <span className="ml-1.5 opacity-60">{opt.size}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="flex justify-between text-micro uppercase tracking-[0.14em] text-muted mb-2">
            <span>Pattern length</span>
            <span className="font-mono text-ink">{len} chars</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={len}
            onChange={(e) => setLen(Number(e.target.value))}
            className="w-full accent-[#8B7355]"
            aria-label="Pattern length"
          />
        </div>

        <div className="flex items-end justify-center gap-1 h-24" aria-hidden>
          {Array.from({ length: bars }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 sm:w-3 origin-bottom transition-all duration-300 ${
                i < filled ? 'bg-accent' : 'bg-ink/[0.08]'
              }`}
              style={{ height: `${18 + i * 4.2}px`, transitionDelay: `${i * 12}ms` }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="font-display text-2xl font-semibold text-ink normal-case tracking-tight">
            {formatAttempts(attempts)}
          </p>
          <p className="text-sm text-muted mt-1">
            expected attempts · {a.note} · {a.size}
            <sup>n</sup>
          </p>
        </div>
      </div>
    </DocFigure>
  );
}

/** Worker pool: main thread + parallel grinders */
export function DocWorkerPool() {
  const uid = useId().replace(/:/g, '');
  const [n, setN] = useState(4);
  const workers = Array.from({ length: n }, (_, i) => i);

  return (
    <DocFigure caption="Fig. — Worker pool · adjust threads">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between text-micro uppercase tracking-[0.14em] text-muted mb-3">
          <span>Parallel workers</span>
          <span className="font-mono text-ink">{n}</span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="w-full accent-[#8B7355] mb-6"
          aria-label="Worker count"
        />

        <svg viewBox="0 0 480 210" className="w-full h-auto block" role="img">
          <title>Web Worker pool</title>
          <defs>
            <linearGradient id={`wp-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B7355" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8B7355" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect
            x="150"
            y="12"
            width="180"
            height="44"
            rx="2"
            fill="#F5F0E8"
            stroke="#2C2A27"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <text
            x="240"
            y="30"
            textAnchor="middle"
            fill="#2C2A27"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em' }}
          >
            MAIN THREAD
          </text>
          <text
            x="240"
            y="46"
            textAnchor="middle"
            fill="#6B6560"
            style={{ fontSize: 9 }}
          >
            UI · progress · stop
          </text>

          {workers.map((i) => {
            const spread = Math.min(420, 48 + n * 48);
            const x = 240 - spread / 2 + (spread / Math.max(n - 1, 1)) * i;
            const wx = n === 1 ? 240 : x;
            return (
              <g key={i}>
                <line
                  x1={240}
                  y1={56}
                  x2={wx}
                  y2={118}
                  stroke="#2C2A27"
                  strokeOpacity="0.2"
                  strokeWidth="1.25"
                />
                <rect
                  x={wx - 36}
                  y={118}
                  width="72"
                  height="40"
                  rx="2"
                  fill={`url(#wp-${uid})`}
                  stroke="#8B7355"
                  strokeWidth="1.5"
                >
                  <animate
                    attributeName="opacity"
                    values="0.7;1;0.7"
                    dur={`${1.1 + (i % 3) * 0.25}s`}
                    repeatCount="indefinite"
                  />
                </rect>
                <text
                  x={wx}
                  y={136}
                  textAnchor="middle"
                  fill="#2C2A27"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  W{i + 1}
                </text>
                <text
                  x={wx}
                  y={150}
                  textAnchor="middle"
                  fill="#6B6560"
                  style={{ fontSize: 8, letterSpacing: '0.06em' }}
                >
                  GRIND
                </text>
              </g>
            );
          })}

          <text
            x="240"
            y="192"
            textAnchor="middle"
            fill="#6B6560"
            style={{ fontSize: 9, letterSpacing: '0.12em' }}
          >
            FIRST HIT → TERMINATE POOL
          </text>
        </svg>
      </div>
    </DocFigure>
  );
}

const TRUST_ZONES = [
  {
    id: 'browser',
    label: 'Your browser',
    tone: 'safe' as const,
    lines: ['Main thread UI', 'Web Workers (keys in RAM)', 'sessionStorage: address only'],
  },
  {
    id: 'wire',
    label: 'Network',
    tone: 'muted' as const,
    lines: ['Static assets once', 'No key traffic while mining', 'Airplane mode OK'],
  },
  {
    id: 'origin',
    label: 'Origin host',
    tone: 'warn' as const,
    lines: ['Serves HTML / JS / workers', 'Cannot read Worker memory', 'Integrity still matters'],
  },
] as const;

/** Trust boundary for Security → Architecture */
export function DocTrustBoundary() {
  const [active, setActive] = useState(0);
  const z = TRUST_ZONES[active];

  return (
    <DocFigure caption="Fig. — Trust boundary · tap a zone">
      <div className="max-w-xl mx-auto">
        <svg viewBox="0 0 480 150" className="w-full h-auto block mb-4" role="img">
          <title>Where keys live</title>
          {TRUST_ZONES.map((zone, i) => {
            const x = 24 + i * 152;
            const on = i === active;
            const fill =
              zone.tone === 'safe' ? (on ? '#8B7355' : '#F5F0E8') : '#F5F0E8';
            const stroke =
              zone.tone === 'safe'
                ? '#8B7355'
                : zone.tone === 'warn'
                  ? '#2C2A27'
                  : '#2C2A27';
            return (
              <g
                key={zone.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
              >
                <rect
                  x={x}
                  y={28}
                  width="128"
                  height="88"
                  rx="2"
                  fill={fill}
                  stroke={stroke}
                  strokeOpacity={on ? 1 : 0.28}
                  strokeWidth={on ? 2 : 1.25}
                  style={{ transition: 'stroke-opacity 0.3s' }}
                />
                <text
                  x={x + 64}
                  y={58}
                  textAnchor="middle"
                  fill={on && zone.tone === 'safe' ? '#F5F0E8' : '#2C2A27'}
                  style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}
                >
                  {zone.label.toUpperCase()}
                </text>
                <text
                  x={x + 64}
                  y={78}
                  textAnchor="middle"
                  fill={on && zone.tone === 'safe' ? '#F5F0E8' : '#6B6560'}
                  style={{ fontSize: 9 }}
                >
                  {i === 0 ? 'KEYS LIVE HERE' : i === 1 ? 'NO KEYS ON WIRE' : 'FILES ONLY'}
                </text>
                {i < 2 ? (
                  <path
                    d={`M ${x + 132} 72 L ${x + 148} 72`}
                    stroke="#2C2A27"
                    strokeOpacity="0.25"
                    strokeWidth="1.5"
                    markerEnd="none"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        <ul className="space-y-2 text-sm text-muted max-w-sm mx-auto">
          {z.lines.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-accent shrink-0">—</span>
              <span className={active === 0 ? 'text-ink' : ''}>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </DocFigure>
  );
}

/** What a proof shares vs what stays private */
export function DocProofSplit() {
  return (
    <DocFigure caption="Fig. — Proof of find · shareable vs private">
      <div className="grid sm:grid-cols-2 gap-0 border border-ink/15 max-w-xl mx-auto">
        <div className="p-5 border-b sm:border-b-0 sm:border-r border-ink/15 bg-accent/10">
          <p className="text-micro uppercase tracking-[0.16em] text-accent mb-3">In the proof</p>
          <ul className="space-y-2 text-sm text-ink">
            <li>Public address</li>
            <li>Prefix / suffix pattern</li>
            <li>Chain · mode · timestamp</li>
          </ul>
        </div>
        <div className="p-5">
          <p className="text-micro uppercase tracking-[0.16em] text-muted mb-3">Never in the link</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Private key / seed</li>
            <li>Worker memory dumps</li>
            <li>Clipboard or exports</li>
          </ul>
        </div>
      </div>
      <svg viewBox="0 0 320 56" className="w-full max-w-xs mx-auto mt-5 h-auto block" aria-hidden>
        <rect x="20" y="18" width="110" height="22" rx="2" fill="#8B7355" opacity="0.85" />
        <text x="75" y="33" textAnchor="middle" fill="#F5F0E8" style={{ fontSize: 9, letterSpacing: '0.1em' }}>
          ADDRESS
        </text>
        <rect x="140" y="18" width="70" height="22" rx="2" fill="#2C2A27" opacity="0.2" />
        <text x="175" y="33" textAnchor="middle" fill="#2C2A27" style={{ fontSize: 9, letterSpacing: '0.1em' }}>
          PATTERN
        </text>
        <rect
          x="220"
          y="18"
          width="80"
          height="22"
          rx="2"
          fill="none"
          stroke="#2C2A27"
          strokeOpacity="0.35"
          strokeDasharray="3 3"
        />
        <text x="260" y="33" textAnchor="middle" fill="#6B6560" style={{ fontSize: 9, letterSpacing: '0.08em' }}>
          KEY ✕
        </text>
      </svg>
    </DocFigure>
  );
}

/** Compact vanity anatomy for FAQ */
export function DocVanityAnatomy() {
  const [show, setShow] = useState(true);

  return (
    <DocFigure caption="Fig. — Same key math · filtered public encoding">
      <button
        type="button"
        className="w-full max-w-xl mx-auto block text-left"
        onClick={() => setShow((s) => !s)}
        aria-pressed={show}
      >
        <svg viewBox="0 0 480 120" className="w-full h-auto block" role="img">
          <title>Vanity address anatomy</title>
          <rect
            x="16"
            y="28"
            width="140"
            height="64"
            rx="2"
            fill="#F5F0E8"
            stroke="#2C2A27"
            strokeOpacity="0.35"
          />
          <text x="86" y="52" textAnchor="middle" fill="#6B6560" style={{ fontSize: 9, letterSpacing: '0.12em' }}>
            PRIVATE KEY
          </text>
          <text x="86" y="72" textAnchor="middle" fill="#2C2A27" style={{ fontSize: 11, fontWeight: 600 }}>
            full entropy
          </text>

          <path
            d="M 160 60 L 200 60"
            stroke="#2C2A27"
            strokeOpacity="0.3"
            strokeWidth="1.5"
          />
          <polygon points="198,56 208,60 198,64" fill="#2C2A27" opacity="0.35" />

          <rect
            x="210"
            y="28"
            width="110"
            height="64"
            rx="2"
            fill="#F5F0E8"
            stroke="#2C2A27"
            strokeOpacity="0.35"
          />
          <text x="265" y="52" textAnchor="middle" fill="#6B6560" style={{ fontSize: 9, letterSpacing: '0.12em' }}>
            DERIVE
          </text>
          <text x="265" y="72" textAnchor="middle" fill="#2C2A27" style={{ fontSize: 11, fontWeight: 600 }}>
            public key
          </text>

          <polygon points="324,56 334,60 324,64" fill="#2C2A27" opacity="0.35" />

          <rect
            x="338"
            y="28"
            width="126"
            height="64"
            rx="2"
            fill={show ? '#8B7355' : '#F5F0E8'}
            stroke="#8B7355"
            strokeWidth="1.5"
            style={{ transition: 'fill 0.35s' }}
          />
          <text
            x="401"
            y="52"
            textAnchor="middle"
            fill={show ? '#F5F0E8' : '#6B6560'}
            style={{ fontSize: 9, letterSpacing: '0.12em' }}
          >
            ADDRESS
          </text>
          <text
            x="401"
            y="72"
            textAnchor="middle"
            fill={show ? '#F5F0E8' : '#2C2A27'}
            style={{ fontSize: 12, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {show ? 'VANI…' : '••••…'}
          </text>
        </svg>
        <p className="text-center text-sm text-muted mt-1">
          Tap to {show ? 'hide' : 'show'} the vanity filter — the private key never changes.
        </p>
      </button>
    </DocFigure>
  );
}
