import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1020_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-5xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <div className="relative">
              <details className="group">
                <summary className="list-none cursor-pointer rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">
                  Menu
                </summary>
                <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-open:opacity-100">
                  <Link href="/about-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>About Us</span><span>{"\uD83D\uDC65"}</span></Link>
                  <Link href="/tennis-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Tennis</span><span>{"\uD83C\uDFBE"}</span></Link>
                  <Link href="/cricket-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Cricket</span><span>{"\uD83C\uDFCF"}</span></Link>
                  <Link href="/golf-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Golf</span><span>{"\u26F3"}</span></Link>
                  <Link href="/chess-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Chess</span><span>{"\u265F"}</span></Link>
                    <Link href="/badminton-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Badminton</span><span>{"\uD83C\uDFF8"}</span></Link>
                    <Link href="/soccer-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Soccer</span><span>{"\u26BD"}</span></Link>
                  <Link href="/contact-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Contact Us</span><span>{"\u2709\uFE0F"}</span></Link>
                </div>
              </details>
            </div>
          </nav>
        </div>

        <h1 className="break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-amber-100/70">Last updated: March 28, 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-amber-100/90 sm:text-base">
          <p>
            At WinningsAura, we respect your privacy. This Privacy Policy explains what information we collect,
            how we use it, and your choices.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">1. Information We Collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Basic usage data such as page views, browser type, and device information.</li>
              <li>Contact information you provide when you submit forms (for example, name and email).</li>
              <li>Prize-structure submission data you provide (such as sport, event, category, payout values, and notes).</li>
              <li>Account information for login and access to My Submissions (email and password hash).</li>
              <li>Security/session data and password reset tokens required for account access and recovery.</li>
              <li>Cookies and similar technologies used for analytics, authentication, and service improvement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">2. How We Use Information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>To operate and improve the website and user experience.</li>
              <li>To process, review, and publish approved sports prize structure submissions.</li>
              <li>To enable account login and show users the status of their own submissions.</li>
              <li>To send essential account or workflow emails (for example, password reset and publication notifications).</li>
              <li>To respond to inquiries sent through our contact channels.</li>
              <li>To monitor performance, troubleshoot issues, and protect site security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">3. Contact Form Confidentiality</h2>
            <p className="mt-2">
              Messages received through our <Link href="/contact-us" className="underline underline-offset-4">Contact Us</Link> page are treated as confidential.
              We do not intentionally publish or disclose contact submissions, except where disclosure is required by law,
              needed to protect rights/safety, or required to operate trusted service providers who support the website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">4. Advertising and Cookies</h2>
            <p className="mt-2">
              We may use third-party advertising services (including Google AdSense) that use cookies to serve ads.
              These cookies may be used to show more relevant advertisements based on prior visits to this and other
              websites.
            </p>
            <p className="mt-2">
              Google and its partners may use advertising cookies. Users may opt out of personalized advertising by
              visiting Google Ads Settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">5. Data Sharing</h2>
            <p className="mt-2">
              We do not sell personal information. We may share limited data with trusted service providers that help
              us host, analyze, maintain, secure, and communicate website operations (for example, hosting and email delivery).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">6. Data Retention</h2>
            <p className="mt-2">
              We keep information only as long as needed for legitimate business or legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">7. Your Rights</h2>
            <p className="mt-2">
              Depending on your location, you may have rights to request access, correction, or deletion of your
              personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">8. Related Legal Terms</h2>
            <p className="mt-2">
              For website-use rules, data accuracy disclaimers, and content usage restrictions, see our
              <Link href="/terms-and-conditions" className="ml-1 underline underline-offset-4">Terms and Conditions</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">9. Policy Updates</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
              updated effective date.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

