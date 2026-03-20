"use client";

import { useEffect, useRef, useState } from "react";
import { decode } from "crosshair-code-generator";

export default function CrosshairPreview({ shareCode }: { shareCode: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !shareCode) return;

    try {
      const settings = decode(shareCode);
      if (!settings) {
        setError(true);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // Tuvali temizle
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, W, H);

      // ── Ham CS2 değerleri ──────────────────────────────────────────────
      const rawThickness    = settings.thickness        ?? 0.5;
      const rawSize         = settings.size             ?? 5;
      const rawGap          = settings.gap              ?? 0;
      const rawOutlineThick = settings.outlineThickness ?? 1;

      const hasOutline = !!settings.outline;
      const hasDot     = !!settings.dot;
      const isTShape   = !!(settings.t || settings.tStyle);

      // ── CS2 Source SDK piksel hesabı ──────────────────────────────────
      // thickness → piksel: her 0.5 = 1px, minimum 1px
      const t_px = Math.max(1, Math.round(rawThickness * 2));
      // size → doğrudan piksel
      const s_px = Math.max(1, Math.round(rawSize));
      // gap → doğrudan piksel (negatif olabilir)
      const g_px = Math.round(rawGap);
      // outline → doğrudan piksel
      const o_px = hasOutline ? Math.max(1, Math.round(rawOutlineThick)) : 0;

      // ── CS2 koordinat formülü (Source SDK'dan) ────────────────────────
      // Merkez = 0 kabul edilirse:
      //   İç kenar (gap): g_px
      //   Dış kenar (gap+size): g_px + s_px
      //
      // gap negatif olduğunda (örn. gap=-4, size=1):
      //   İç kenar: -4  → dış kenar: -3
      //   Çizgi, merkezin -4 ile -3 arasına düşer (sol tarafa geçer)
      //   Ama CS2 bunu abs() alarak simetrik gösterir:
      //   Gerçek konum = abs(gap) ile abs(gap)+size arası
      //
      // Yani: innerDist = abs(g_px), outerDist = abs(g_px) + s_px
      const innerDist = Math.abs(g_px);       // merkeze olan iç mesafe
      const outerDist = innerDist + s_px;     // merkeze olan dış mesafe

      // ── Dinamik ZOOM ─────────────────────────────────────────────────
      // Canvas'ın %75'ini crosshair dolduracak şekilde ölçekle
      // Toplam görünen genişlik = outerDist (her iki yönde)
      const ZOOM = Math.min(10, Math.max(2, Math.floor((W * 0.38) / outerDist)));

      const t      = t_px    * ZOOM;
      const inner  = innerDist * ZOOM;
      const outer  = outerDist * ZOOM;
      const o      = o_px;          // outline zoom'suz, sabit piksel
      const t_half = t / 2;

      // ── Renk ─────────────────────────────────────────────────────────
      let r = 0, gr = 255, b = 0;
      switch (settings.color) {
        case 0: r = 255; gr =  82; b =  82; break; // Kırmızı
        case 1: r =  76; gr = 175; b =  80; break; // Yeşil
        case 2: r = 255; gr = 235; b =  59; break; // Sarı
        case 3: r =  33; gr = 150; b = 243; break; // Mavi
        case 4: r =   0; gr = 255; b = 255; break; // Cyan
        case 5:                                      // Özel renk
          r  = settings.r ?? 255;
          gr = settings.g ?? 255;
          b  = settings.b ?? 255;
          break;
        default: r = 0; gr = 255; b = 0;
      }
      const alpha = settings.useAlpha
        ? (settings.alpha ?? 255) / 255
        : 1;

      // ── Çizgi parçaları ───────────────────────────────────────────────
      // Sol:  cx-outer  →  cx-inner  (yatay, t yüksekliğinde)
      // Sağ:  cx+inner  →  cx+outer  (yatay, t yüksekliğinde)
      // Üst:  cy-outer  →  cy-inner  (dikey, t genişliğinde)
      // Alt:  cy+inner  →  cy+outer  (dikey, t genişliğinde)
      const parts: { x: number; y: number; w: number; h: number }[] = [];

      // Sol
      parts.push({ x: cx - outer, y: cy - t_half, w: s_px * ZOOM, h: t });
      // Sağ
      parts.push({ x: cx + inner, y: cy - t_half, w: s_px * ZOOM, h: t });
      // Alt
      parts.push({ x: cx - t_half, y: cy + inner, w: t, h: s_px * ZOOM });
      // Üst (T-shape yoksa)
      if (!isTShape) {
        parts.push({ x: cx - t_half, y: cy - outer, w: t, h: s_px * ZOOM });
      }
      // Merkez nokta
      if (hasDot) {
        parts.push({ x: cx - t_half, y: cy - t_half, w: t, h: t });
      }

      // ── Çizim ────────────────────────────────────────────────────────
      ctx.save();
      ctx.translate(0.5, 0.5);

      // Outline
      if (hasOutline && o > 0) {
        ctx.beginPath();
        for (const p of parts) {
          ctx.rect(
            Math.round(p.x) - o,
            Math.round(p.y) - o,
            Math.round(p.w) + o * 2,
            Math.round(p.h) + o * 2
          );
        }
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fill();
      }

      // Asıl crosshair
      ctx.beginPath();
      for (const p of parts) {
        ctx.rect(
          Math.round(p.x),
          Math.round(p.y),
          Math.round(p.w),
          Math.round(p.h)
        );
      }
      ctx.fillStyle = `rgba(${r}, ${gr}, ${b}, ${alpha})`;
      ctx.fill();

      ctx.restore();

      setError(false);
    } catch (err) {
      console.error("Crosshair çizilemedi:", err);
      setError(true);
    }
  }, [shareCode]);

  if (error) {
    return (
      <div className="w-[96px] h-[96px] bg-zinc-900 rounded-lg flex items-center justify-center text-[10px] text-zinc-500 text-center p-2 border border-zinc-800">
        Geçersiz<br />Kod
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={96}
      height={96}
      className="bg-zinc-900 rounded-lg border border-zinc-700 shadow-md flex-shrink-0"
      title="Canlı Crosshair Önizlemesi"
    />
  );
}