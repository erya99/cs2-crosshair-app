import Link from "next/link";

export default function TermsOfService() {
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

        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">Terms of <span className="text-red-500">Service</span></h1>
        
        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Usage</h2>
            <p>By using CS2CrossHub, you agree to these terms. You are responsible for any crosshair codes you share on the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Content Standards</h2>
            <p>Do not upload offensive titles or misleading codes. We reserve the right to remove any content that violates community standards.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Disclaimer</h2>
            <p>This service is provided "as is". We are not responsible for any game bans or issues arising from the use of shared codes. Always test in-game.</p>
          </section>
        </div>
      </div>
    </div>
  );
}