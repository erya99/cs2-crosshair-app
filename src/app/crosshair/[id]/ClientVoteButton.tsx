// src/app/crosshair/[id]/ClientVoteButton.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ClientVoteButton({ 
  crosshairId, 
  initialVoteCount, 
  initialVoted 
}: { 
  crosshairId: string; 
  initialVoteCount: number; 
  initialVoted: boolean; 
}) {
  const { data: session } = useSession();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleVote = async () => {
    if (!session) {
      showToast("Please sign in with Steam to vote.");
      return;
    }
    if (loading) return;

    // Hızlı (Optimistic) Güncelleme: Sunucuyu beklemeden anında kırmızı yap
    setLoading(true);
    const newVoted = !voted;
    setVoted(newVoted);
    setVoteCount(prev => newVoted ? prev + 1 : prev - 1);

    try {
      const res = await fetch(`/api/crosshairs/${crosshairId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: (session.user as any).id }),
      });
      
      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      // Eğer bir hata olursa beğeni işlemini geri al
      setVoted(!newVoted);
      setVoteCount(prev => !newVoted ? prev + 1 : prev - 1);
      showToast("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleVote}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border shadow-sm disabled:opacity-50 ${
          voted 
            ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30" 
            : "bg-black/40 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
        </svg>
        <span className="text-sm font-bold">{voteCount}</span>
      </button>

      {/* TOAST (Uyarı Ekranı) */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-white/10 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}