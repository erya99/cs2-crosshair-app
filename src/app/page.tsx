"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import CrosshairPreview from "../components/CrosshairPreview";
import Link from "next/link";

type Crosshair = {
  id: string;
  title: string;
  shareCode: string;
  category: string;
  resolution: string;
  voteCount: number;
  createdAt: string;
  userId: string;
  voted: boolean;
  user: { name: string; image: string };
};

type SortBy = "votes" | "newest";
type Tab    = "all" | "pro" | "community";

const PAGE_SIZE = 12;

function timeAgo(dateStr: string) {
  if (!dateStr) return "just now";
  const diff  = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return "recently";
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function CopyButton({ code }: { code: string }) {
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
      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
        copied ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {copied ? "✓ Copied!" : "Copy Code"}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

export default function Home() {
  const { data: session } = useSession();

  // Data
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [loading, setLoading]       = useState(true);

  // Filters
  const [tab, setTab]               = useState<Tab>("all");
  const [resFilter, setResFilter]   = useState<string>("all");
  const [search, setSearch]         = useState("");
  const [sortBy, setSortBy]         = useState<SortBy>("votes");
  const [page, setPage]             = useState(1);

  // Form
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [title, setTitle]           = useState("");
  const [shareCode, setShareCode]   = useState("");
  const [category, setCategory]     = useState("community");
  const [resolution, setResolution] = useState("16:9");

  // Mobile nav
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const role    = (session?.user as any)?.role ?? "USER";
  const isAdmin = role === "ADMIN";

  const fetchCrosshairs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crosshairs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCrosshairs(data);
      }
    } catch (error) {
      console.error("Error fetching crosshairs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCrosshairs(); }, [fetchCrosshairs]);

  useEffect(() => { setPage(1); }, [tab, search, sortBy, resFilter]);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  const filtered = crosshairs
    .filter(c => tab === "all" ? true : c.category === tab)
    .filter(c => resFilter === "all" ? true : (c.resolution || "16:9") === resFilter)
    .filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (c.title || "").toLowerCase().includes(q) ||
        (c.shareCode || "").toLowerCase().includes(q) ||
        (c.user?.name || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sortBy === "votes"
        ? (b.voteCount || 0) - (a.voteCount || 0)
        : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all:       crosshairs.length,
    pro:       crosshairs.filter(c => c.category === "pro").length,
    community: crosshairs.filter(c => c.category === "community").length,
  };

  const userCount = crosshairs.filter(c => c.userId === session?.user?.id).length;
  const canAdd    = session && (isAdmin || userCount < 3);
  const canDelete = (cross: Crosshair) => isAdmin || cross.userId === session?.user?.id;

  const handleSubmit = async () => {
    setFormError("");
    if (!title.trim() || !shareCode.trim()) { setFormError("Please fill in all fields."); return; }
    if (!/^CSGO-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/.test(shareCode)) {
      setFormError("Invalid share code format. Should be: CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX");
      return;
    }
    setSubmitting(true);
    const res  = await fetch("/api/crosshairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, shareCode, category, resolution }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error ?? "Something went wrong."); }
    else { 
      setTitle(""); 
      setShareCode(""); 
      setCategory("community"); 
      setResolution("16:9"); 
      setShowForm(false); 
      fetchCrosshairs(); 
    }
    setSubmitting(false);
  };

  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleVote = async (id: string) => {
    if (!session) {
      showToast("Please sign in with Steam to vote.");
      return;
    }
    await fetch(`/api/crosshairs/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id }),
    });
    fetchCrosshairs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this crosshair?")) return;
    await fetch(`/api/crosshairs/${id}`, { method: "DELETE" });
    fetchCrosshairs();
  };

  return (
    <div className="min-h-screen bg-[#080809] text-zinc-100 relative" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* ── GRAFİTİ ARKA PLAN KATMANI (Aydınlatıldı opacity 0.35) ── */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.35] mix-blend-screen bg-cover bg-no-repeat bg-[20%_center] md:bg-center"
        style={{ 
          backgroundImage: "url('/backgroundcross.jpg')"
        }} 
      />

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080809]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="font-black text-white tracking-tight text-base shrink-0 hover:opacity-80 transition">
            CS2CROSS<span className="text-red-600">HUB</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {(["all","pro","community"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  tab === t ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}>
                {t === "all" ? "All" : t === "pro" ? "Pro" : "Community"}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {session ? (
              <>
                {canAdd && (
                  <button onClick={() => setShowForm(f => !f)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all">
                    <span className="text-base leading-none">+</span>
                    <span className="hidden sm:inline">Share</span>
                  </button>
                )}
                {!isAdmin && (
                  <span className="text-[11px] text-zinc-600 hidden sm:block">{userCount}/3</span>
                )}
                <img src={session.user?.image ?? ""} alt="" className="w-7 h-7 rounded-full ring-1 ring-white/10 shrink-0" />
                <span className="text-sm text-zinc-400 hidden lg:block max-w-[100px] truncate">{session.user?.name}</span>
                {isAdmin && (
                  <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider hidden sm:block">
                    Admin
                  </span>
                )}
                <button onClick={() => signOut()} className="text-xs text-zinc-600 hover:text-red-400 transition hidden sm:block">
                  Sign out
                </button>
              </>
            ) : (
              <button onClick={() => signIn("steam")}
                className="flex items-center gap-2 bg-[#1b2838] hover:bg-[#253a50] border border-[#2a475e] text-white px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z"/>
                </svg>
                <span className="hidden sm:inline">Sign in with Steam</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}

            <button onClick={() => setMobileNavOpen(o => !o)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileNavOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#080809] px-4 py-3 flex flex-col gap-1 relative z-50">
            {(["all","pro","community"] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setMobileNavOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  tab === t ? "bg-white/10 text-white" : "text-zinc-500"
                }`}>
                {t === "all" ? `All (${counts.all})` : t === "pro" ? `Pro (${counts.pro})` : `Community (${counts.community})`}
              </button>
            ))}
            <div className="border-t border-white/5 my-1" />
            {(["all", "4:3", "16:9", "16:10"]).map(r => (
              <button key={r} onClick={() => { setResFilter(r); setMobileNavOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium uppercase transition-all ${
                  resFilter === r ? "bg-white/10 text-white" : "text-zinc-500"
                }`}>
                {r === "all" ? "Any Resolution" : r}
              </button>
            ))}
            {session && (
              <>
                <div className="border-t border-white/5 my-1" />
                <button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm text-red-400 mt-1">
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <main className="pt-14 relative z-10">

        {/* ── HERO (OLD SCHOOL / GRUNGE) ── */}
        <section className="relative overflow-hidden border-b border-white/5 bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#080809] via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
            <div className="max-w-2xl">
              
              <div className="inline-flex items-center gap-2 bg-[#0c0c0e]/80 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-zinc-300 font-bold uppercase tracking-widest mb-6 backdrop-blur-sm shadow-sm">
                <span className="w-2 h-2 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                {crosshairs.length} crosshairs
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-6 uppercase" 
                  style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
                Find your<br />
                <span className="text-red-600">
                  perfect aim.
                </span>
              </h1>
              
              <p className="text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-lg drop-shadow-lg bg-black/40 border border-white/5 p-4 rounded-sm backdrop-blur-sm">
                Discover, copy and share Counter-Strike 2 crosshair codes from pro players and the community.
              </p>
            </div>
          </div>
        </section>

        {/* ── SHARE FORM ── */}
        {showForm && session && (
          <section ref={formRef} className="border-b border-white/5 bg-[#0c0c0e]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Share a Crosshair</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-2">Title / Player Name</label>
                      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. NiKo 2025"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-2">
                        Category {!isAdmin && <span className="text-zinc-700 normal-case tracking-normal font-normal">(pro = admin only)</span>}
                      </label>
                      <select value={category} onChange={e => setCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-red-500/50 transition-all">
                        <option value="community" className="bg-[#0c0c0e] text-white">Community</option>
                        {isAdmin && <option value="pro" className="bg-[#0c0c0e] text-white">Pro Player</option>}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-2">Aspect Ratio</label>
                      <select value={resolution} onChange={e => setResolution(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-red-500/50 transition-all">
                        <option value="16:9" className="bg-[#0c0c0e] text-white">16:9 (Native)</option>
                        <option value="4:3" className="bg-[#0c0c0e] text-white">4:3 (Stretched)</option>
                        <option value="16:10" className="bg-[#0c0c0e] text-white">16:10</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-2">Share Code</label>
                    <input value={shareCode} onChange={e => setShareCode(e.target.value)} placeholder="CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 outline-none focus:border-red-500/50 transition-all" />
                  </div>
                  {formError && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{formError}</p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button onClick={handleSubmit} disabled={submitting}
                      className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-red-500/20">
                      {submitting ? "Publishing..." : "Publish"}
                    </button>
                    <button onClick={() => { setShowForm(false); setFormError(""); }}
                      className="text-zinc-500 hover:text-white px-4 py-3 text-sm transition">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SEARCH + FILTER BAR ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, player or code..."
                className="w-full bg-[#0a0a0c]/80 backdrop-blur-md border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/40 focus:bg-white/[0.07] transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 rounded-xl p-1 gap-0.5">
                {(["all","pro","community"] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      tab === t ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                    }`}>
                    {t === "all" ? `All (${counts.all})` : t === "pro" ? `Pro (${counts.pro})` : `Community (${counts.community})`}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 rounded-xl p-1 gap-0.5">
                {(["all", "4:3", "16:9", "16:10"]).map(r => (
                  <button key={r} onClick={() => setResFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                      resFilter === r ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                    }`}>
                    {r === "all" ? "Any Res" : r}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 rounded-xl p-1 gap-0.5">
                <button onClick={() => setSortBy("votes")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === "votes" ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                  Top
                </button>
                <button onClick={() => setSortBy("newest")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === "newest" ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Newest
                </button>
              </div>
            </div>
          </div>

          {search && (
            <p className="text-xs text-zinc-400 mt-3 drop-shadow-md">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
          )}
        </section>

        {/* ── GRID ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-[#0a0a0c]/60 backdrop-blur-sm rounded-2xl border border-white/5">
              <p className="text-zinc-400 text-lg drop-shadow-md">
                {search ? `No results for "${search}"` : "No crosshairs here yet."}
              </p>
              {search
                ? <button onClick={() => setSearch("")} className="mt-4 text-red-500 hover:text-red-400 text-sm font-semibold transition">Clear search →</button>
                : session && canAdd && <button onClick={() => setShowForm(true)} className="mt-4 text-red-500 hover:text-red-400 text-sm font-semibold transition">Be the first to share →</button>
              }
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((cross, i) => (
                  <article key={cross.id}
                    // Dış Kenarlık Eskitmesi: Koyu border ve kalın iç gölge ile elde edildi (Kumlama SİLİNDİ)
                    className="group relative bg-[#0f0f11] rounded-xl overflow-hidden hover:-translate-y-0.5 transition-all duration-200 border border-black/80 ring-1 ring-white/5 hover:ring-white/15 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
                    
                    {/* ── ÜST: YUMUŞAK VE TEMİZ PREVIEW KUTUSU ── */}
                    <div className="relative bg-[#0a0a0c] h-40 flex items-center justify-center border-b border-black/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-20">
                      <CrosshairPreview shareCode={cross.shareCode} size={128} />
                      
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm ${
                          cross.category === "pro"
                            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                            : "bg-sky-400/10 text-sky-400 border border-sky-400/20"
                        }`}>
                          {cross.category}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-black/40 text-zinc-300 border border-white/10 backdrop-blur-md shadow-sm">
                          {cross.resolution || "16:9"}
                        </span>
                      </div>

                      {canDelete(cross) && (
                        <button onClick={() => handleDelete(cross.id)}
                          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-black/80 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all border border-white/5"
                          title="Delete">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* ── ALT: BİLGİLER ── */}
                    <div className="p-4 relative z-20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-[15px] truncate drop-shadow-md">{cross.title}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <img src={cross.user?.image} alt="" className="w-4 h-4 rounded-full opacity-90 object-cover" />
                            <span className="text-xs text-zinc-400 truncate max-w-[90px]">{cross.user?.name}</span>
                            <span className="text-zinc-600 text-xs">·</span>
                            <span className="text-xs text-zinc-500">{timeAgo(cross.createdAt)}</span>
                          </div>
                        </div>
                        <button onClick={() => handleVote(cross.id)} 
                          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ml-2 disabled:opacity-40 disabled:cursor-default shadow-sm ${cross.voted ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-black/40 border border-white/5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"}`}>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-xs font-bold">{cross.voteCount}</span>
                        </button>
                      </div>
                      <div className="bg-black/60 rounded-lg px-3 py-2 mb-3 font-mono text-[10px] text-zinc-400 truncate border border-white/[0.04] shadow-inner">
                        {cross.shareCode}
                      </div>
                      <CopyButton code={cross.shareCode} />
                    </div>
                  </article>
                ))}
              </div>

              {/* ── PAGINATION ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-default transition text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "…" ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-zinc-600 text-sm drop-shadow-md">…</span>
                        ) : (
                          <button key={p} onClick={() => setPage(p as number)}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                              page === p ? "bg-white text-black shadow-lg" : "bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                            }`}>
                            {p}
                          </button>
                        )
                      )}
                  </div>

                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-default transition text-sm font-medium">
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        
        {/* ── SEO & FAQ SECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-white/5 mt-12 bg-[#0a0a0c]/40 backdrop-blur-md rounded-t-3xl">
          <h2 className="text-2xl font-bold text-white mb-8 drop-shadow-md">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-400">
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 drop-shadow-sm">How do I use a CS2 crosshair code?</h3>
              <p className="text-sm leading-relaxed">
                To use a crosshair code in Counter-Strike 2, simply click the "Copy" button on any crosshair profile on our site. Open your CS2 settings, navigate to Game {'>'} Crosshair, and click on "Share or Import". Paste the copied code into the text box and click "Import". Your new crosshair will be applied instantly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 drop-shadow-sm">Are these crosshairs used by CS2 pro players?</h3>
              <p className="text-sm leading-relaxed">
                Yes! CS2CrossHub regularly updates its database with the exact crosshair settings used by top CS2 esports professionals. Whether you are looking for s1mple's dot crosshair or m0NESY's dynamic setup, you can find and preview them live before importing them into your game.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 drop-shadow-sm">Why is choosing the right crosshair important in CS2?</h3>
              <p className="text-sm leading-relaxed">
                A properly configured crosshair improves your visibility, spray control, and overall aim accuracy. Depending on your screen resolution, aspect ratio (like 4:3 stretched), and personal preference, finding the perfect gap, thickness, and color can significantly impact your matchmaking rank and Premier rating.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 drop-shadow-sm">Can I share my own crosshair?</h3>
              <p className="text-sm leading-relaxed">
                Absolutely. CS2CrossHub is built for the community. You can easily export your own crosshair code from the CS2 settings menu and submit it to our platform. Sharing your unique crosshair helps other players discover new playstyles and aim techniques.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-white/10 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
              <Link href="/" className="text-2xl font-black tracking-tighter text-white drop-shadow-lg">
                CS2CROSS<span className="text-red-600">HUB</span>
              </Link>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                The ultimate community-driven library for Counter-Strike 2 crosshairs. Discover, share, and improve your aim.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-bold text-zinc-400">
              <Link href="/privacy" className="hover:text-red-500 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-red-500 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-red-500 transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-medium">
              © 2026 CS2CrossHub. PROUDLY POWERED BY THE COMMUNITY.
            </p>
            <p className="text-[11px] text-zinc-700 italic max-w-md text-center md:text-right">
              CS2CrossHub is not affiliated with Valve Corporation or Counter-Strike 2. All game assets belong to their respective owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}