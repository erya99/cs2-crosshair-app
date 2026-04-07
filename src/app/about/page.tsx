// src/app/about/page.tsx
import Link from "next/link";

export default function About() {
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

        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">About <span className="text-red-600">CS2CrossHub</span></h1>
        
        <div className="space-y-8 leading-relaxed text-lg">
          <section>
            <p className="mb-4">
              Welcome to <strong>CS2CrossHub</strong>, the ultimate community-driven platform dedicated entirely to Counter-Strike 2 crosshairs. 
            </p>
            <p>
              Our mission is simple: to provide CS2 players of all skill levels—from Silver to Global Elite and Premier top-tier—with a fast, reliable, and clean library to discover, preview, and share the best crosshair codes in the game.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why We Built This</h2>
            <p className="mb-4">
              Counter-Strike has always been a game of precision. The difference between a missed shot and a game-winning clutch often comes down to milliseconds of reaction time and the perfect crosshair placement. 
            </p>
            <p>
              With the transition to Counter-Strike 2, Valve introduced the "Share Code" system, making it easier than ever to copy a friend's or a pro player's setup. However, finding those codes scattered across Reddit threads, YouTube descriptions, and Twitter posts was a hassle. We built CS2CrossHub to centralize all that data into one beautiful, easy-to-use directory.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Community First</h2>
            <p className="mb-4">
              CS2CrossHub is proudly powered by its users. While we actively curate and update the database with setups from top-tier professional esports players (like s1mple, NiKo, m0NESY, and ZywOo), the heart of our platform is the community tab. Any player can sign in via Steam and securely share their unique crosshair code with the world.
            </p>
            <p>
              Whether you prefer a dynamic crosshair for learning counter-strafing, a classic static green cross, or a tiny cyan dot for crisp one-taps, you will find it here.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
            <ul className="list-disc pl-6 space-y-3 text-base">
              <li><strong>Live Preview:</strong> Our custom rendering engine visualizes exactly how the crosshair looks in-game based solely on the share code.</li>
              <li><strong>One-Click Copy:</strong> No more selecting and copying text manually. One click and the code is ready to be imported into your CS2 settings.</li>
              <li><strong>Resolution Tags:</strong> Since crosshairs look different on 16:9 native vs 4:3 stretched, our platform allows users to tag the ideal aspect ratio for their setup.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}