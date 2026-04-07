// src/app/crosshair/[id]/page.tsx
import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import CrosshairPreview from "../../../components/CrosshairPreview";
import Link from "next/link";
import ClientCopyButton from "./ClientCopyButton";
import ClientVoteButton from "./ClientVoteButton";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "../../../lib/auth";

type PageProps = {
  params: Promise<{ id: string }>;
};

// AdSense ve Google için otomatik SEO (Metadata) üretici
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  
  const cross = await prisma.crosshair.findUnique({ where: { id: resolvedParams.id } });
  if (!cross) return { title: "Crosshair Not Found" };
  return {
    title: `${cross.title} CS2 Crosshair Code | CS2CrossHub`,
    description: `Get the exact CS2 crosshair code used by ${cross.title}. Aspect Ratio: ${cross.resolution}, Category: ${cross.category}. View live preview and copy instantly.`,
  };
}

export default async function CrosshairDetail({ params }: PageProps) {
  const resolvedParams = await params;

  // 1. Veritabanından Crosshair'i bul
  const cross = await prisma.crosshair.findUnique({
    where: { id: resolvedParams.id },
    include: { user: { select: { name: true, image: true } } },
  });

  if (!cross) return notFound();

  // 2. Kullanıcı giriş yaptıysa daha önceden beğenmiş mi kontrol et
  const session = await getServerSession(getAuthOptions());
  const userId = (session?.user as any)?.id ?? null;
  let hasVoted = false;

  if (userId) {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_crosshairId: { userId, crosshairId: cross.id }
      }
    });
    if (vote) hasVoted = true;
  }

  return (
    <div className="min-h-screen bg-[#080809] text-zinc-100 relative" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      {/* Arka Plan */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.35] mix-blend-screen bg-cover bg-no-repeat bg-[20%_center] md:bg-center"
        style={{ backgroundImage: "url('/backgroundcross.jpg')" }} />

      {/* Basit Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080809]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-white tracking-tight text-base hover:opacity-80 transition">
            CS2CROSS<span className="text-red-600">HUB</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-white transition flex items-center gap-1">
            &larr; Back to Library
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Başlık, Profil ve YENİ BEĞENİ BUTONU */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0c0c0e]/80 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-zinc-300 font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
            <span className={`w-2 h-2 rounded-full ${cross.category === 'pro' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'}`} />
            {cross.category} SETUP
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-5 drop-shadow-lg">
            {cross.title}
          </h1>
          
          {/* Kullanıcı Profili ve Beğeni Butonu Yanyana */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <img src={cross.user?.image} alt="" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-sm font-medium">Shared by {cross.user?.name}</span>
            </div>
            
            {/* Araya dikey ince bir çizgi koyalım şık dursun */}
            <div className="w-px h-5 bg-white/10" />

            {/* Yeni Beğeni Butonumuz */}
            <ClientVoteButton crosshairId={cross.id} initialVoteCount={cross.voteCount} initialVoted={hasVoted} />
          </div>
        </div>

        {/* Devasa Önizleme (Preview) */}
        <div className="bg-[#0f0f11] rounded-2xl overflow-hidden border border-black/80 ring-1 ring-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8">
          <div className="relative bg-[#0a0a0c] h-64 sm:h-80 flex items-center justify-center border-b border-black/60 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
            <CrosshairPreview shareCode={cross.shareCode} size={256} />
            <span className="absolute bottom-4 right-4 text-[11px] font-black px-3 py-1 rounded uppercase tracking-wider bg-black/60 text-zinc-300 border border-white/10 backdrop-blur-md">
              {cross.resolution || "16:9"} ASPECT RATIO
            </span>
          </div>
          <div className="p-6">
            <div className="bg-black/60 rounded-xl px-4 py-3 mb-6 font-mono text-sm sm:text-base text-zinc-300 text-center border border-white/[0.04] shadow-inner break-all">
              {cross.shareCode}
            </div>
            <ClientCopyButton code={cross.shareCode} />
          </div>
        </div>

        {/* AdSense İçin Otomatik Üretilen SEO Metni */}
        <div className="mt-12 bg-black/40 border border-white/5 p-6 sm:p-8 rounded-2xl backdrop-blur-md text-sm sm:text-base">
          <h2 className="text-xl font-bold text-white mb-4 drop-shadow-sm">About {cross.title}'s CS2 Crosshair</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Looking to improve your aim and precision in Counter-Strike 2? You are viewing the exact crosshair settings for <strong>{cross.title}</strong>. 
            This is a <strong>{cross.category}</strong> crosshair configuration that is highly optimized for a <strong>{cross.resolution}</strong> aspect ratio. 
            Having the right crosshair gap, thickness, and color is crucial for landing crisp headshots, controlling your weapon's spray pattern, and holding angles effectively in competitive CS2 matches.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            To use this setup, simply click the "COPY CROSSHAIR CODE" button above. Open your CS2 game console or navigate to the in-game settings (Game &gt; Crosshair &gt; Share or Import), and paste the unique share code. 
            Your crosshair will instantly update to match this specific profile!
          </p>
        </div>

      </main>
    </div>
  );
}