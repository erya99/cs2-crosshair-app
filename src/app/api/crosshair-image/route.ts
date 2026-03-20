import { NextRequest, NextResponse } from "next/server";
import { decode } from "crosshair-code-generator";
import sharp from "sharp";

// ── CS2 GERÇEK LOOKUP TABLOLARI (CrosshairSettings.cs) ──────────────────────
const LENGTH_MAP: [number, number][] = [
  [0, 0], [0.3, 1], [0.7, 2], [1.2, 3], [1.6, 4], [2.1, 5], [2.5, 6], [2.9, 7],
  [3.399, 8], [3.799, 9], [4.299, 10], [4.699, 11], [5.199, 12], [5.599, 13], [5.999, 14],
  [6.499, 15], [6.899, 16], [7.399, 17], [7.799, 18], [8.299, 19], [8.699, 20], [9.199, 21],
  [9.599, 22], [10.099, 23],
];
const THICKNESS_MAP: [number, number][] = [
  [0, 1], [0.7, 2], [1.12, 3], [1.56, 4], [2.01, 5], [2.45, 6], [2.89, 7],
];
const GAP_MAP: [number, number][] = [
  [-7.0, -3], [-5.9, -2], [-4.9, -1], [-3.0, 0], [-2.0, 1], [-1.0, 2], [-0.9, 2],
  [-0.8, 2], [-0.7, 2], [-0.6, 2], [-0.5, 2], [-0.4, 2], [-0.3, 2], [-0.2, 2],
  [-0.1, 2], [-0.05, 3], [0.00, 3], [1.0, 4], [2.0, 5], [3.0, 6], [4.0, 7],
];

function lookup(table: [number, number][], value: number): number {
  let best: number | null = null;
  for (const [k, v] of table) {
    if (k <= value) best = v;
    else break;
  }
  return best ?? 0;
}

function buildSVG(shareCode: string): string | null {
  const s = decode(shareCode);
  if (!s) return null;

  const CANVAS = 128;
  const ZOOM   = 4;
  const sc     = (v: number) => Math.round(v * ZOOM);

  // CS2 piksel değerleri — lookup table
  const pixelLength    = lookup(LENGTH_MAP,    s.size      ?? 5);
  const pixelThickness = lookup(THICKNESS_MAP, s.thickness ?? 0.5);
  const pixelGap       = lookup(GAP_MAP,       s.gap       ?? 0);
  const outlineT       = s.outline
    ? lookup(THICKNESS_MAP, s.outlineThickness ?? 1)
    : 0;

  // C# DrawCrosshair formülü — birebir port
  const totalDistance     = pixelGap + 2;
  const adjustedLength    = pixelThickness === 1 ? pixelLength - 1 : pixelLength;
  const rightBottomOffset = pixelThickness > 1 && pixelThickness % 2 !== 0 ? 1 : 0;

  const td = sc(totalDistance);
  const al = sc(adjustedLength);
  const pt = Math.max(1, sc(pixelThickness));
  const rb = sc(rightBottomOffset);
  const ot = sc(outlineT);
  const ph = Math.floor(pt / 2); // thickness yarısı (yatay çizgi dikey offset)

  const cx = CANVAS / 2;
  const cy = CANVAS / 2;

  // Renk
  let r = 0, g = 255, b = 0;
  switch (s.color) {
    case 0: r=255; g= 82; b= 82; break;
    case 1: r= 76; g=175; b= 80; break;
    case 2: r=255; g=235; b= 59; break;
    case 3: r= 33; g=150; b=243; break;
    case 4: r=  0; g=255; b=255; break;
    case 5: r=s.r??255; g=s.g??255; b=s.b??255; break;
    default: r=0; g=255; b=0;
  }
  const a255    = s.useAlpha ? (s.alpha ?? 255) : 255;
  const opacity = (a255 / 255).toFixed(3);
  const fill    = `rgb(${r},${g},${b})`;
  const black   = `rgb(0,0,0)`;

  const rect = (x: number, y: number, w: number, h: number, color: string) =>
    w > 0 && h > 0
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity="${opacity}"/>`
      : "";

  // Pillow draw.line([(x1,y), (x2,y)], width=pt) → rect(x1, y-ph, x2-x1, pt)
  // Pillow draw.line([(x, y1), (x, y2)], width=pt) → rect(x-ph, y1, pt, y2-y1)
  function hLine(x1: number, x2: number, y: number): string {
    const w = Math.abs(x2 - x1);
    const lx = Math.min(x1, x2);
    let out = "";
    if (ot > 0) out += rect(lx - ot, y - ph - ot, w + ot * 2, pt + ot * 2, black);
    out += rect(lx, y - ph, w, pt, fill);
    return out;
  }

  function vLine(x: number, y1: number, y2: number): string {
    const h = Math.abs(y2 - y1);
    const ly = Math.min(y1, y2);
    let out = "";
    if (ot > 0) out += rect(x - ph - ot, ly - ot, pt + ot * 2, h + ot * 2, black);
    out += rect(x - ph, ly, pt, h, fill);
    return out;
  }

  // 4 çizgi — C# DrawCrosshair sırası
  let lines = "";
  lines += hLine(cx - td - al, cx - td,       cy);           // Left
  lines += hLine(cx + td + rb, cx + td+al+rb, cy);           // Right
  lines += vLine(cx,           cy - td - al,  cy - td);      // Top
  lines += vLine(cx,           cy + td + rb,  cy+td+al+rb);  // Bottom

  // Center dot
  if (s.dot) {
    lines += rect(cx - ph, cy - ph, pt, pt, fill);
  }

  return (
    `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${CANVAS}" height="${CANVAS}" fill="#18181b"/>` +
    lines +
    `</svg>`
  );
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";

  if (!/^CSGO-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/.test(code)) {
    return new NextResponse("Invalid code", { status: 400 });
  }

  try {
    const svg = buildSVG(code);
    if (!svg) return new NextResponse("Render failed", { status: 400 });

    const pngBuffer = await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toBuffer();

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400",
        "Content-Length": pngBuffer.length.toString(),
      },
    });
  } catch {
    return new NextResponse("Render error", { status: 500 });
  }
}