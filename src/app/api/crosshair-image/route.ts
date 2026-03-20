import { NextRequest, NextResponse } from "next/server";
import { decode } from "crosshair-code-generator";
import sharp from "sharp";

function buildSVG(shareCode: string): string | null {
  const s = decode(shareCode);
  if (!s) return null;

  const CANVAS = 128;
  const cx = CANVAS / 2;
  const cy = CANVAS / 2;

  // ── CS2 GERÇEK RENDER FORMÜLÜ ─────────────────────────────────────────
  // CS2 motoru 768p base resolution kullanır, 1080p'ye ölçekler
  // Her konsol değeri: piksel = round(value * 1080 / 768)
  const BASE   = 768.0;
  const SCREEN = 1080.0;
  const cs2Scale = SCREEN / BASE; // 1.40625

  const isLegacy = s.style === 5;

  let t_cs2 = Math.ceil((s.thickness ?? 0) * cs2Scale);
  if (isLegacy && t_cs2 === 0) t_cs2 = 1; // Legacy: min 1px

  const s_cs2 = Math.max(1, Math.round((s.size ?? 5) * cs2Scale));
  const g_cs2 = Math.round((s.gap ?? 0) * cs2Scale) + 4; // +4 CS2 dahili offset
  const o_cs2 = s.outline
    ? Math.max(1, Math.round((s.outlineThickness ?? 1) * cs2Scale))
    : 0;

  // ── VIEWER ZOOM ───────────────────────────────────────────────────────
  // CS2 piksellerini 128x128 canvas için büyüt
  // Thickness max 4px ile sınırlı — orantısız kalın görünmesin
  const VIEWER_ZOOM = 6;
  const THICK_MAX   = 4;

  const t  = Math.max(1, Math.min(t_cs2 * VIEWER_ZOOM, THICK_MAX));
  const sv = Math.max(1, s_cs2 * VIEWER_ZOOM);
  const gs = g_cs2 * VIEWER_ZOOM;
  const o  = o_cs2;

  // Simetrik hizalama
  const t_top = Math.floor(t / 2);
  const t_bot = t - t_top;

  // ── RENK ─────────────────────────────────────────────────────────────
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
  const outFill = `rgb(0,0,0)`;

  // ── ÇİZGİ PARÇALARI ──────────────────────────────────────────────────
  type Rect = { x: number; y: number; w: number; h: number };
  const parts: Rect[] = [
    { x: cx - gs - sv, y: cy - t_top, w: sv,   h: t   }, // Sol
    { x: cx + gs,      y: cy - t_top, w: sv,   h: t   }, // Sağ
    { x: cx - t_top,   y: cy + gs,    w: t,    h: sv  }, // Alt
  ];
  if (!(s.t || s.tStyle)) {
    parts.push({ x: cx - t_top, y: cy - gs - sv, w: t, h: sv }); // Üst
  }
  if (s.dot) {
    parts.push({ x: cx - t_top, y: cy - t_top, w: t, h: t }); // Dot
  }

  const rect = (p: Rect, fc: string, expand = 0) =>
    `<rect x="${p.x - expand}" y="${p.y - expand}" ` +
    `width="${p.w + expand * 2}" height="${p.h + expand * 2}" ` +
    `fill="${fc}" fill-opacity="${opacity}"/>`;

  const outlineRects = o > 0 ? parts.map(p => rect(p, outFill, o)).join("") : "";
  const mainRects    = parts.map(p => rect(p, fill)).join("");

  return (
    `<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${CANVAS}" height="${CANVAS}" fill="#18181b"/>` +
    outlineRects +
    mainRects +
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
        // Aynı kod = aynı görsel: tarayıcı 7 gün, CDN 30 gün cache'lesin
        "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400",
        "Content-Length": pngBuffer.length.toString(),
      },
    });
  } catch {
    return new NextResponse("Render error", { status: 500 });
  }
}