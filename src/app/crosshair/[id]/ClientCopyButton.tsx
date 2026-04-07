// src/app/crosshair/[id]/ClientCopyButton.tsx
"use client";
import { useState } from "react";

export default function ClientCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      className={`w-full py-4 rounded-xl text-lg font-black transition-all duration-200 shadow-lg ${
        copied ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
      }`}
    >
      {copied ? "✓ COPIED TO CLIPBOARD!" : "COPY CROSSHAIR CODE"}
    </button>
  );
}