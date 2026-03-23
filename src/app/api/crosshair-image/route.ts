import { NextRequest, NextResponse } from "next/server";
import { decode } from "crosshair-code-generator";
import sharp from "sharp";

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
const CS2_PRESET_COLORS: [number, number, number][] = [
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [0, 0, 255],
  [0, 255, 255],
];
const DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";

function decodeColorIndex(shareCode: string): number {
  try {
    const code = shareCode.replace(/CSGO|-/g, "");
    const chars = Array.from(code).reverse();
    let big = BigInt(0);
    const dictLen = BigInt(DICTIONARY.length);
    for (const ch of chars) {
      big = big * dictLen + BigInt(DICTIONARY.indexOf(ch));
    }
    const hex = big.toString(16).padStart(36, "0");
    const byte10 = parseInt(hex.substring(20, 22), 16);
    const bits = byte10.toString(2).padStart(8, "0");
    return parseInt(bits.substring(5, 8), 2);
  } catch {
    return 5;
  }
}

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
  const ZOOM = 4;
  const sc = (v: number) => Math.round(v * ZOOM);

  const pixelLength = lookup(LENGTH_MAP, s.size ?? 5);
  const pixelThickness = lookup(THICKNESS_MAP, s.thickness ?? 0.5);
  const pixelGap = lookup(GAP_MAP, s.gap ?? 0);
  const ot = s.outline ? Math.max(1, Math.round((s.outlineThickness ?? 1) * 1.5)) : 0;

  const td = sc(pixelGap + 2);
  const al = sc(pixelThickness === 1 ? pixelLength - 1 : pixelLength);
  const pt = Math.max(1, sc(pixelThickness));
  const rb = pixelThickness > 1 && pixelThickness % 2 !== 0 ? 1 : 0;
  const ph = Math.floor(pt / 2);
  const cx = CANVAS / 2;
  const cy = CANVAS / 2;

  let r = 0, g = 255, b = 0;
  const colorIdx = decodeColorIndex(shareCode);
  if (colorIdx >= 0 && colorIdx <= 4) {
    [r, g, b] = CS2_PRESET_COLORS[colorIdx];
  } else {
    r = s.r ?? 0;
    g = s.g ?? 255;
    b = s.b ?? 0;
  }

  const a255 = s.useAlpha ? (s.alpha ?? 255) : 255;
  const op = (a255 / 255).toFixed(3);

  const R = (x: number, y: number, w: number, h: number, c: string): string => {
    if (w <= 0 || h <= 0) return "";
    return (
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" fill="' + c + '" fill-opacity="' + op + '"/>'
    );
  };

  const fill = "rgb(" + r + "," + g + "," + b + ")";
  const black = "rgb(0,0,0)";

  const hLine = (x1: number, x2: number, y: number): string => {
    const w = Math.abs(x2 - x1);
    const lx = Math.min(x1, x2);
    return (ot > 0 ? R(lx - ot, y - ph - ot, w + ot * 2, pt + ot * 2, black) : "") +
      R(lx, y - ph, w, pt, fill);
  };

  const vLine = (x: number, y1: number, y2: number): string => {
    const h = Math.abs(y2 - y1);
    const ly = Math.min(y1, y2);
    return (ot > 0 ? R(x - ph - ot, ly - ot, pt + ot * 2, h + ot * 2, black) : "") +
      R(x - ph, ly, pt, h, fill);
  };

  let lines = "";
  lines += hLine(cx - td - al, cx - td, cy);
  lines += hLine(cx + td + rb, cx + td + al + rb, cy);
  lines += vLine(cx, cy - td - al, cy - td);
  lines += vLine(cx, cy + td + rb, cy + td + al + rb);
  if (s.dot) lines += R(cx - ph, cy - ph, pt, pt, fill);

  return (
    '<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="128" height="128" fill="#18181b"/>' +
    lines +
    "</svg>"
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
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Length": pngBuffer.length.toString(),
      },
    });
  } catch (e) {
    return new NextResponse(String(e), { status: 500 });
  }
}