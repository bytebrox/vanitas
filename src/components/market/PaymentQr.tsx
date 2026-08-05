'use client';

import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/**
 * Renders an EIP-681 payment URI as an inline SVG.
 *
 * Drawing the modules directly keeps this free of canvas work and of any
 * runtime image fetch, which matters under a `default-src 'self'` policy.
 */
export function PaymentQr({ value, size = 168 }: { value: string; size?: number }) {
  const path = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();

    const count = qr.getModuleCount();
    const segments: string[] = [];
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) segments.push(`M${col} ${row}h1v1h-1z`);
      }
    }
    return { d: segments.join(''), count };
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${path.count} ${path.count}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-hidden="true"
      className="border border-ink/20 bg-white p-2"
    >
      <path d={path.d} fill="#000" />
    </svg>
  );
}
