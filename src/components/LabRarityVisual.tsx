'use client';

import { useId, useMemo } from 'react';
import type { LabAnalysis } from '@/lib/pattern-lab';

/** Map difficulty → 0..1 on a log scale (1 → 1e15) */
export function rarityPosition(difficulty: number): number {
  if (!Number.isFinite(difficulty) || difficulty <= 1) return 0;
  const log = Math.log10(difficulty);
  return Math.min(1, Math.max(0, log / 15));
}

/**
 * Position on the UPPER semicircle.
 * t=0 left, t=0.5 top, t=1 right.
 * Math angle π→0; SVG y = cy - sin(a)*r.
 */
function pointOnArc(cx: number, cy: number, r: number, t: number) {
  const a = Math.PI * (1 - t);
  return { x: cx + Math.cos(a) * r, y: cy - Math.sin(a) * r };
}

/**
 * Upper semicircle as two 90° arcs (avoids SVG 180° ambiguity).
 * In SVG (y-down), sweep-flag 1 = clockwise = left → top → right.
 */
function upperSemiPath(cx: number, cy: number, r: number): string {
  const left = `${cx - r} ${cy}`;
  const top = `${cx} ${cy - r}`;
  const right = `${cx + r} ${cy}`;
  return `M ${left} A ${r} ${r} 0 0 1 ${top} A ${r} ${r} 0 0 1 ${right}`;
}

const TICKS = [
  { t: 0, label: 'Any' },
  { t: 0.33, label: 'Common' },
  { t: 0.66, label: 'Rare' },
  { t: 1, label: 'Impossible' },
];

interface LabRarityVisualProps {
  analysis: LabAnalysis;
}

export function LabRarityVisual({ analysis }: LabRarityVisualProps) {
  const uid = useId().replace(/:/g, '');

  const displayT =
    analysis.gauge === 'empty'
      ? 0
      : analysis.gauge === 'impossible'
        ? 1
        : rarityPosition(analysis.difficulty);

  const showMeter = analysis.gauge !== 'empty';
  const cx = 160;
  const cy = 130;
  const r = 102;
  const track = useMemo(() => upperSemiPath(cx, cy, r), []);
  const tip = pointOnArc(cx, cy, r - 10, displayT);

  const bars = useMemo(() => {
    const count = 14;
    const filled = Math.round(displayT * count);
    return Array.from({ length: count }, (_, i) => ({
      i,
      on: i < filled,
      h: 14 + i * 5.5,
    }));
  }, [displayT]);

  const rarityWord =
    analysis.gauge === 'empty'
      ? 'Set a pattern'
      : analysis.gauge === 'impossible'
        ? 'Impossible'
        : analysis.rarityLabel.split('·')[0]?.trim() || '—';

  const oneIn =
    analysis.gauge === 'ok'
      ? analysis.rarityLabel.split('·')[1]?.trim()
      : analysis.gauge === 'impossible'
        ? 'beyond extreme'
        : null;

  const midEta = analysis.timeRows[1]?.eta ?? analysis.timeRows[0]?.eta ?? '—';
  const dash = Math.max(0.15, displayT * 100);

  return (
    <div className="border-y border-ink/15 py-6 sm:py-8">
      <div className="text-center mb-5">
        <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">
          {analysis.label}
          {analysis.mode ? ` · ${analysis.mode}` : ''}
        </p>
        <p
          className={`font-display font-semibold normal-case tracking-[0.02em] transition-all duration-500 ${
            (analysis.prefix + analysis.suffix).length > 14
              ? 'text-2xl sm:text-3xl'
              : 'text-3xl sm:text-5xl'
          }`}
        >
          {analysis.prefix || analysis.suffix ? (
            <>
              <span className="text-accent">{analysis.prefix}</span>
              <span className="text-ink/20 mx-0.5">…</span>
              <span className="text-accent">{analysis.suffix}</span>
            </>
          ) : (
            <span className="text-ink/25">…</span>
          )}
        </p>
      </div>

      <div className="mx-auto w-full max-w-[340px]">
        <svg
          viewBox="0 0 320 150"
          className="w-full h-auto select-none block overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id={`lab-fill-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B7355" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8B7355" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Full upper ring */}
          <path
            d={track}
            fill="none"
            stroke="#2C2A27"
            strokeOpacity="0.12"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Filled portion — same geometry, dash along path */}
          <path
            d={track}
            fill="none"
            stroke={`url(#lab-fill-${uid})`}
            strokeWidth="14"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${dash} ${100 - dash}`}
            style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
          />

          {TICKS.map((s) => {
            const p = pointOnArc(cx, cy, r + 22, s.t);
            return (
              <text
                key={s.label}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#6B6560"
                style={{ fontSize: 7.5, letterSpacing: '0.1em' }}
              >
                {s.label.toUpperCase()}
              </text>
            );
          })}

          <line
            x1={cx}
            y1={cy}
            x2={tip.x}
            y2={tip.y}
            stroke="#2C2A27"
            strokeWidth="2.25"
            strokeLinecap="round"
            style={{ transition: 'x2 0.7s ease-out, y2 0.7s ease-out' }}
          />
          <circle cx={cx} cy={cy} r="6" fill="#2C2A27" />
          <circle cx={cx} cy={cy} r="2.5" fill="#F5F0E8" />
          <circle
            cx={tip.x}
            cy={tip.y}
            r="3.5"
            fill="#8B7355"
            style={{ transition: 'cx 0.7s ease-out, cy 0.7s ease-out' }}
          />
        </svg>
      </div>

      <div className="text-center mt-2 mb-5">
        <p className="font-display text-2xl sm:text-3xl font-semibold text-ink normal-case tracking-[0.02em]">
          {rarityWord}
        </p>
        {oneIn ? (
          <p className="font-mono text-xs text-muted mt-1.5">{oneIn}</p>
        ) : (
          <p className="text-xs text-muted mt-1.5">Prefix or suffix above</p>
        )}
      </div>

      <div
        className="flex items-end justify-center gap-[5px] sm:gap-1.5 h-[7.5rem]"
        aria-hidden
      >
        {bars.map((b) => (
          <div
            key={b.i}
            className={`w-2.5 sm:w-3 origin-bottom transition-all duration-500 ease-out ${
              b.on ? 'bg-accent' : 'bg-ink/[0.08]'
            }`}
            style={{
              height: b.h,
              opacity: showMeter ? 1 : 0.4,
              transitionDelay: `${b.i * 20}ms`,
            }}
          />
        ))}
      </div>

      {analysis.gauge === 'impossible' ? (
        <p className="text-center text-sm text-accent mt-6">
          {analysis.errors[0] || 'Beyond extreme — effectively impossible to forge.'}
        </p>
      ) : analysis.valid ? (
        <>
          <div className="mt-8 grid grid-cols-3 gap-2 border-t border-ink/15 pt-5">
            {analysis.timeRows.map((row) => (
              <div key={row.rate} className="text-center">
                <p className="font-mono text-[0.65rem] text-muted tracking-wider">
                  {row.rateLabel}
                </p>
                <p className="font-display text-lg font-semibold text-ink normal-case mt-1 leading-tight">
                  {row.eta.replace(/^~/, '')}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-micro text-muted mt-4 tracking-[0.12em] uppercase">
            ~{midEta.replace(/^~/, '')} at mid rate · {analysis.difficultyLabel}
          </p>
        </>
      ) : (
        analysis.errors[0] && (
          <p className="text-center text-sm text-accent mt-6">{analysis.errors[0]}</p>
        )
      )}
    </div>
  );
}
