"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import CrosshairPreview from "../components/CrosshairPreview";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("all"); // all, pro, community
  const [crosshairs, setCrosshairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [category, setCategory] = useState("community");
  const [showForm, setShowForm] = useState(false);

  const fetchCrosshairs = async () => {
    setLoading(true);
    const res = await fetch("/api/crosshairs");
    if (res.ok) {
      const data = await res.json();
      setCrosshairs(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCrosshairs(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crosshair?")) return;
    const res = await fetch(`/api/crosshairs/${id}`, { method: "DELETE" });
    if (res.ok) fetchCrosshairs();
  };

  const handleVote = async (id: string) => {
    if (!session) return alert("Please sign in to vote!");
    await fetch(`/api/crosshairs/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id }),
    });
    fetchCrosshairs();
  };

  const filteredCrosshairs = crosshairs.filter(c => 
    activeTab === "all" ? true : c.category === activeTab
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-800 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tighter text-white bg-red-600 px-2 py-1">CS2CENTER</h1>
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <button onClick={() => setActiveTab("all")} className={activeTab === 'all' ? 'text-white' : 'text-zinc-500 hover:text-white'}>Explore</button>
              <button onClick={() => setActiveTab("pro")} className={activeTab === 'pro' ? 'text-white' : 'text-zinc-500 hover:text-white'}>Pro Settings</button>
              <button onClick={() => setActiveTab("community")} className={activeTab === 'community' ? 'text-white' : 'text-zinc-500 hover:text-white'}>Community</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-zinc-100 text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white transition"
                >
                  + Share Code
                </button>
                <img src={session.user?.image || ""} className="w-8 h-8 rounded-full border border-zinc-700" alt="profile" />
                <button onClick={() => signOut()} className="text-xs text-zinc-500 hover:text-red-500 transition">Logout</button>
              </div>
            ) : (
              <button onClick={() => signIn("steam")} className="bg-[#1b2838] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#2a475e] transition">
                Sign in with STEAM
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* HERO */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Find your perfect aim.</h2>
          <p className="text-zinc-500">Discover and copy the best Counter-Strike 2 crosshair codes from pros and the community.</p>
        </div>

        {/* SHARE FORM (Toggle) */}
        {showForm && session && (
          <div className="bg-[#141417] border border-zinc-800 p-8 rounded-2xl mb-12 animate-in fade-in slide-in-from-top-4">
             <h3 className="text-xl font-bold mb-6">Share New Crosshair</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Title / Player Name</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0a0a0c] border border-zinc-700 rounded-lg p-3 outline-none focus:border-red-600 transition" placeholder="e.g. NiKo 2024" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0a0a0c] border border-zinc-700 rounded-lg p-3 outline-none">
                    <option value="community">Community</option>
                    <option value="pro">Pro Player</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Share Code</label>
                  <input value={shareCode} onChange={e => setShareCode(e.target.value)} className="w-full bg-[#0a0a0c] border border-zinc-700 rounded-lg p-3 outline-none focus:border-red-600 transition" placeholder="CSGO-XXXXX-..." />
                </div>
             </div>
             <button 
              onClick={async () => {
                await fetch("/api/crosshairs", {
                  method: "POST",
                  headers: {"Content-Type": "application/json"},
                  body: JSON.stringify({ title, shareCode, category, userId: session.user.id })
                });
                setTitle(""); setShareCode(""); setShowForm(false); fetchCrosshairs();
              }}
              className="mt-6 w-full bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700 transition"
             >
               Publish to Library
             </button>
          </div>
        )}

        {/* FEED GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrosshairs.map((cross) => (
            <div key={cross.id} className="group bg-[#0f0f12] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300">
              <div className="relative aspect-video bg-[#050505] flex items-center justify-center border-b border-zinc-800">
                <CrosshairPreview shareCode={cross.shareCode} />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${cross.category === 'pro' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                    {cross.category}
                  </span>
                </div>
                
                {/* Silme Butonu (Sadece Admin veya Sahibi için) */}
                {(session?.user?.role === "ADMIN" || session?.user?.id === cross.userId) && (
                  <button 
                    onClick={() => handleDelete(cross.id)}
                    className="absolute top-3 right-3 text-zinc-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-white">{cross.title}</h4>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      by <span className="text-zinc-300 font-medium">{cross.user?.name}</span>
                    </p>
                  </div>
                  <button onClick={() => handleVote(cross.id)} className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition">
                    <span className="text-red-500 text-xs">❤</span>
                    <span className="text-xs font-bold">{cross.voteCount}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(cross.shareCode);
                      alert("Code copied!");
                    }}
                    className="flex-1 bg-zinc-100 text-black py-2 rounded-lg text-sm font-bold hover:bg-white transition"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}