$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class PlateCutter4 {
  public static void Cut(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var rect = new Rectangle(0, 0, w, h);
      var srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      using (var dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
        var dstData = dst.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        int stride = Math.Abs(srcData.Stride);
        int bytes = stride * h;
        byte[] buf = new byte[bytes];
        Marshal.Copy(srcData.Scan0, buf, 0, bytes);
        src.UnlockBits(srcData);

        int pr = 0xF5, pg = 0xF0, pb = 0xE8;
        int ir = 0x2C, ig = 0x2A, ib = 0x27;
        int paperLum = (pr * 30 + pg * 59 + pb * 11) / 100;
        var rnd = new Random(23);
        byte[] alpha = new byte[w * h];
        byte[] strength = new byte[w * h];

        for (int y = 0; y < h; y++) {
          int row = y * stride;
          for (int x = 0; x < w; x++) {
            int i = row + x * 4;
            int b = buf[i], g = buf[i + 1], r = buf[i + 2];
            int lum = (r * 30 + g * 59 + b * 11) / 100;
            // Only darkness counts — light sky dither must disappear
            int inkAmt = paperLum - lum;
            byte a;
            if (inkAmt < 28) a = 0;
            else if (inkAmt < 70) a = (byte)Math.Min(255, (inkAmt - 28) * 6);
            else a = 255;
            alpha[y * w + x] = a;
            strength[y * w + x] = (byte)Math.Max(0, Math.Min(255, inkAmt * 2));
          }
        }

        // Stipple soft alphas into dots (engraving tooth)
        for (int y = 2; y < h - 2; y++) {
          for (int x = 2; x < w - 2; x++) {
            int idx = y * w + x;
            int a = alpha[idx];
            if (a <= 12 || a >= 248) continue;
            int n = (alpha[idx - 1] + alpha[idx + 1] + alpha[idx - w] + alpha[idx + w]) / 4;
            int a2 = (int)(a * 0.4 + n * 0.6) + rnd.Next(-42, 43);
            if (a2 < 0) a2 = 0; if (a2 > 255) a2 = 255;
            if (a2 < 120) a2 = rnd.NextDouble() < (a2 / 120.0) ? 185 : 0;
            alpha[idx] = (byte)a2;
          }
        }

        // Deckle left/top/bottom; keep right denser for viewport bleed
        int mx = (int)(w * 0.11);
        int my = (int)(h * 0.07);
        for (int y = 0; y < h; y++) {
          for (int x = 0; x < w; x++) {
            int idx = y * w + x;
            int a = alpha[idx];
            if (x < (int)(mx * 2.4)) {
              double t = x / (mx * 2.4);
              double keep = Math.Pow(Math.Max(0, t), 0.78);
              if (rnd.NextDouble() > keep) a = 0;
              else a = (int)(a * (0.2 + 0.8 * keep));
            }
            if (y < my) {
              double t = y / (double)my;
              if (rnd.NextDouble() > Math.Pow(t, 0.85)) a = 0;
              else a = (int)(a * (0.25 + 0.75 * t));
            }
            if (y > h - my) {
              double t = (h - 1 - y) / (double)my;
              if (rnd.NextDouble() > Math.Pow(t, 0.85)) a = 0;
              else a = (int)(a * (0.25 + 0.75 * t));
            }
            alpha[idx] = (byte)Math.Max(0, Math.Min(255, a));
          }
        }

        for (int y = 0; y < h; y++) {
          int row = y * stride;
          for (int x = 0; x < w; x++) {
            int i = row + x * 4;
            int idx = y * w + x;
            byte a = alpha[idx];
            if (a == 0) {
              buf[i] = (byte)pb; buf[i + 1] = (byte)pg; buf[i + 2] = (byte)pr; buf[i + 3] = 0;
              continue;
            }
            double s = strength[idx] / 255.0;
            int rr = (int)(ir + (0x8B - ir) * (1.0 - s) * 0.28);
            int gg = (int)(ig + (0x73 - ig) * (1.0 - s) * 0.28);
            int bb = (int)(ib + (0x55 - ib) * (1.0 - s) * 0.28);
            int aa = (int)(a * (0.62 + 0.38 * s));
            if (aa > 255) aa = 255;
            buf[i] = (byte)bb;
            buf[i + 1] = (byte)gg;
            buf[i + 2] = (byte)rr;
            buf[i + 3] = (byte)aa;
          }
        }

        Marshal.Copy(buf, 0, dstData.Scan0, bytes);
        dst.UnlockBits(dstData);
        dst.Save(dstPath, ImageFormat.Png);
      }
    }
  }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$dir = "F:\Projekte\VanityMine\repo\public\ascii"
@(
  "side-colosseum",
  "side-temple",
  "side-figure",
  "side-landscape",
  "side-aqueduct",
  "side-forum"
) | ForEach-Object {
  $src = Join-Path $dir "$_.png"
  $dst = Join-Path $dir "$_-plate.png"
  if (-not (Test-Path $dst) -or $_.Equals("side-forum")) {
    [PlateCutter4]::Cut($src, $dst)
    Write-Output "cut $_"
  } else {
    Write-Output "skip $_"
  }
}
