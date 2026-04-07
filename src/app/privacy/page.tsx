import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#080809] text-zinc-300 py-12 px-6 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors mb-10 group">
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-bold tracking-tight">Back to Home</span>
        </Link>

        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">Privacy <span className="text-red-500">Policy</span></h1>
        <p className="text-sm text-zinc-500 mb-8">Last Updated: April 2026</p>
        
        <div className="space-y-8 leading-relaxed text-sm sm:text-base text-zinc-400">
          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">1. Introduction and General Principles</h2>
            <p>Welcome to CS2CrossHub. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us. When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect personal information that you voluntarily provide to us when registering at the Services expressing an interest in obtaining information about us or our products and services. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect can include the following:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Steam Authentication Data:</strong> When you log in via Steam, we receive your public Steam ID, display name, and avatar image. We do NOT have access to your Steam password, email, or payment information.</li>
              <li><strong>Usage Data:</strong> We automatically collect certain information when you visit, use or navigate the Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, and referring URLs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">3. How We Use Your Information</h2>
            <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To post and display the crosshair codes you choose to share with the community.</li>
              <li>To deliver targeted advertising to you (via Google AdSense) based on your interests and location.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">4. Cookies and Web Beacons</h2>
            <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. We use essential cookies to maintain your login session. Furthermore, third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-3">5. Data Retention and Deletion</h2>
            <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law. You can request the deletion of your account and associated crosshair data at any time by contacting our support team.</p>
          </section>
        </div>
      </div>
    </div>
  );
}