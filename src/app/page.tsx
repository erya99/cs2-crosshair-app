"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Canlı çizim bileşenimizi içeri aktarıyoruz
import CrosshairPreview from "../components/CrosshairPreview";

export default function Home() {
  const { data: session, status } = useSession();
  
  const [title, setTitle] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [category, setCategory] = useState("community");
  const [message, setMessage] = useState("");
  
  // Veritabanından gelen crosshair'leri tutacağımız liste
  const [crosshairs, setCrosshairs] = useState<any[]>([]);

  // Sayfa açıldığında verileri çeken fonksiyon
  const fetchCrosshairs = async () => {
    const res = await fetch("/api/crosshairs");
    if (res.ok) {
      const data = await res.json();
      setCrosshairs(data);
    }
  };

  // Bileşen ekrana geldiğinde fetchCrosshairs'i çalıştır
  useEffect(() => {
    fetchCrosshairs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kaydediliyor...");

    const res = await fetch("/api/crosshairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        shareCode,
        category,
        userId: session?.user?.id,
      }),
    });

    if (res.ok) {
      setMessage("✅ Crosshair başarıyla eklendi!");
      setTitle("");
      setShareCode("");
      fetchCrosshairs(); // Yeni kayıt eklenince listeyi anında güncelle!
    } else {
      setMessage("❌ Bir hata oluştu veya bu kod zaten sistemde var.");
    }
  };

  // OYLAMA (BEĞENME) FONKSİYONU
  const handleVote = async (crosshairId: string) => {
    if (!session?.user?.id) {
      alert("Oy vermek için lütfen Steam ile giriş yapın!");
      return;
    }

    const res = await fetch(`/api/crosshairs/${crosshairId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id }),
    });

    if (res.ok) {
      // İşlem başarılıysa ekrandaki sayıların güncellenmesi için listeyi yeniden çekiyoruz
      fetchCrosshairs();
    }
  };

  // Kopyalama Butonu Fonksiyonu
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("✅ Kod kopyalandı: " + code);
  };

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Yükleniyor...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-12 bg-zinc-950 text-white px-4">
      <div className="w-full max-w-4xl"> {/* Kartlar daha geniş dursun diye max-w-4xl yaptık */}
        
        {/* ÜST BİLGİ VE GİRİŞ */}
        <div className="flex justify-between items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">CS2 Crosshairs</h1>
            <p className="text-zinc-400 text-sm mt-1">En iyi nişangah kodlarını keşfet ve paylaş.</p>
          </div>
          {session ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-white">{session.user?.name}</p>
                <button onClick={() => signOut()} className="text-sm text-red-500 hover:text-red-400">Çıkış Yap</button>
              </div>
              <img src={session.user?.image || ""} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-green-500" />
            </div>
          ) : (
            <button onClick={() => signIn("steam")} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 font-semibold rounded-lg transition-colors">
              Steam ile Giriş
            </button>
          )}
        </div>

        {/* EKLEME FORMU */}
        {session && (
          <form onSubmit={handleSubmit} className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4 shadow-xl mb-12">
            <h2 className="text-xl font-bold mb-4 border-b border-zinc-800 pb-2">Yeni Crosshair Paylaş</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Başlık / İsim</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500" placeholder="Örn: s1mple 2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500">
                  <option value="community">Topluluk</option>
                  <option value="pro">E-Sporcu</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Paylaşım Kodu</label>
              <input type="text" required value={shareCode} onChange={(e) => setShareCode(e.target.value)} pattern="CSGO-.*" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-green-500" placeholder="CSGO-XXXX-XXXX-XXXX-XXXX" />
            </div>
            <button type="submit" className="w-full mt-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">Sisteme Ekle</button>
            {message && <p className={`text-center mt-2 text-sm font-medium ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>{message}</p>}
          </form>
        )}

        {/* PAYLAŞILAN CROSSHAIRLER (FİD) */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔥 Son Paylaşılanlar
          </h2>
          <div className="space-y-4">
            {crosshairs.length === 0 ? (
              <p className="text-zinc-500 text-center py-8 bg-zinc-900 rounded-xl border border-zinc-800">Henüz crosshair paylaşılmamış. İlk paylaşan sen ol!</p>
            ) : (
              crosshairs.map((cross) => (
                <div key={cross.id} className="p-5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
                  
                  {/* SOL KISIM: Canlı Crosshair Çizimi ve Kullanıcı Bilgisi */}
                  <div className="flex items-center gap-5">
                    {/* SİHİR BURADA: CANLI ÇİZİM */}
                    <div className="flex-shrink-0">
                      <CrosshairPreview shareCode={cross.shareCode} />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="font-bold text-xl text-white flex items-center gap-2">
                        {cross.title}
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${cross.category === 'pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {cross.category}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <img src={cross.user?.image || "/default-avatar.png"} alt="User" className="w-6 h-6 rounded-full border border-zinc-700" />
                        <span>{cross.user?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* SAĞ KISIM: Butonlar ve Kod */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <code className="bg-zinc-950 px-3 py-2 rounded-lg text-sm text-green-400 font-mono border border-zinc-800 flex-1 md:flex-none text-center">
                      {cross.shareCode}
                    </code>
                    
                    <button 
                      onClick={() => handleVote(cross.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-sm font-medium transition-colors text-red-400"
                    >
                      ❤️ <span className="text-white">{cross.voteCount}</span>
                    </button>

                    <button 
                      onClick={() => copyToClipboard(cross.shareCode)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-green-700 hover:border-green-600 hover:text-white border border-zinc-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      Kopyala
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}