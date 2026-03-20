"use client";

// v3 — cache bust
const RENDER_VERSION = "4";

export default function CrosshairPreview({
  shareCode,
  size = 128,
}: {
  shareCode: string;
  size?: number;
}) {
  const isValid =
    /^CSGO-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/.test(
      shareCode
    );

  if (!isValid) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-zinc-900 rounded-lg flex items-center justify-center text-[10px] text-zinc-500 text-center p-2 border border-zinc-800 flex-shrink-0"
      >
        Invalid
        <br />
        Code
      </div>
    );
  }

  const src = `/api/crosshair-image?code=${encodeURIComponent(shareCode)}&v=${RENDER_VERSION}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Crosshair: ${shareCode}`}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        flexShrink: 0,
      }}
      className="rounded-sm border border-zinc-800 bg-[#18181b]"
      loading="lazy"
      draggable={false}
    />
  );
}