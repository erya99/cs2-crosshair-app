"use client";

export default function CrosshairPreview({
  shareCode,
  size = 128,
}: {
  shareCode: string;
  size?: number; // default 128
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
        Geçersiz
        <br />
        Kod
      </div>
    );
  }

  const src = `/api/crosshair-image?code=${encodeURIComponent(shareCode)}&size=${size}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Crosshair: ${shareCode}`}
      width={size}
      height={size}
      className="rounded-lg border border-zinc-700 shadow-md flex-shrink-0 bg-zinc-900"
      loading="lazy"
    />
  );
}