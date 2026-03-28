import Link from "next/link";

export default function Contact() {
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

        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">Get in <span className="text-red-500">Touch</span></h1>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12">
          <p className="text-lg mb-8">Have questions, feedback, or business inquiries? Reach out to us via email.</p>
          
          <div className="space-y-4">
            <div className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Email Support</div>
            <a 
              href="mailto:contact@cs2crosshub.com" 
              className="text-2xl sm:text-3xl font-bold text-white hover:text-red-500 transition-colors break-all"
            >
              archuarymedia@gmail.com
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-sm text-zinc-500 leading-relaxed">
              We typically respond within 24-48 hours. Thank you for being part of the CS2CrossHub community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}