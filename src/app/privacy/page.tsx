import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#080809] text-zinc-300 py-12 px-6 sm:py-20">
      <div className="max-w-3xl mx-auto">
        {/* GERİ DÖN BUTONU */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors mb-10 group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-bold tracking-tight">Back to Home</span>
        </Link>

        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">Privacy <span className="text-red-500">Policy</span></h1>
        
        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>When you sign in with Steam, we only collect your Steam ID, display name, and avatar URL to identify your account and display your shared crosshairs.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Cookies</h2>
            <p>We use essential cookies to keep you signed in. We also use third-party services like Google Analytics and ad partners which may use cookies to serve personalized content.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Sharing</h2>
            <p>We do not sell your personal data. Your Steam profile information is public on our site when you share a crosshair.</p>
          </section>
        </div>
      </div>
    </div>
  );
}