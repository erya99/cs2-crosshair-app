import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#080809] text-zinc-300 py-12 px-6 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors mb-10 group">
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-bold tracking-tight">Back to Home</span>
        </Link>

        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">Terms of <span className="text-red-500">Service</span></h1>
        <p className="text-sm text-zinc-500 mb-8">Last Updated: April 2026</p>
        
        <div className="space-y-8 leading-relaxed text-sm sm:text-base text-zinc-400">
          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using CS2CrossHub (the "Site"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">2. User Generated Content</h2>
            <p>Our platform allows users to submit, post, and share Counter-Strike 2 crosshair codes and associated metadata (such as titles or player names). By submitting content, you grant CS2CrossHub a worldwide, non-exclusive, royalty-free license to use, display, and distribute said content.</p>
            <p className="mt-2">You agree not to post content that is:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Offensive, abusive, or explicitly inappropriate.</li>
              <li>Misleading, spam, or entirely unrelated to CS2 configurations.</li>
              <li>Violating any third-party copyrights or trademarks.</li>
            </ul>
            <p className="mt-2">We reserve the right to moderate, edit, or delete any content that violates these guidelines without prior notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">3. Disclaimer of Affiliation</h2>
            <p><strong>CS2CrossHub is an independent, community-driven platform and is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Valve Corporation, Counter-Strike 2, or any of its subsidiaries or its affiliates.</strong> The official Counter-Strike website can be found at counter-strike.net. The name Counter-Strike as well as related names, marks, emblems, and images are registered trademarks of their respective owners.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">4. Limitation of Liability</h2>
            <p>In no event shall CS2CrossHub or its administrators be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption, or game bans) arising out of the use or inability to use the materials on CS2CrossHub. Users are responsible for testing all crosshair codes in a secure environment before utilizing them in competitive gameplay.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">5. Modifications</h2>
            <p>CS2CrossHub may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
          </section>
        </div>
      </div>
    </div>
  );
}