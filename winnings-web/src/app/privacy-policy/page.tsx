import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1020_45%,_#05070f_100%)] px-4 py-8 text-[#F5E6B3] sm:px-6 lg:px-8">
      <main className="mx-auto w-full max-w-4xl rounded-2xl border border-amber-300/30 bg-black/50 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="mb-5">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-amber-100/85 underline underline-offset-4 hover:text-amber-100">
            <span aria-hidden="true">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-amber-100">Privacy Policy</h1>
        <p className="mt-2 text-sm text-amber-100/70">Last updated: February 24, 2026</p>

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
              <li>Cookies and similar technologies used for analytics and service improvement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">2. How We Use Information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>To operate and improve the website and user experience.</li>
              <li>To respond to inquiries sent through our contact channels.</li>
              <li>To monitor performance, troubleshoot issues, and protect site security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">3. Advertising and Cookies</h2>
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
            <h2 className="text-lg font-semibold text-amber-100">4. Data Sharing</h2>
            <p className="mt-2">
              We do not sell personal information. We may share limited data with trusted service providers that help
              us host, analyze, and maintain the website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">5. Data Retention</h2>
            <p className="mt-2">
              We keep information only as long as needed for legitimate business or legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">6. Your Rights</h2>
            <p className="mt-2">
              Depending on your location, you may have rights to request access, correction, or deletion of your
              personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">7. Contact</h2>
            <p className="mt-2">
              If you have privacy-related questions, please use our <Link href="/contact-us" className="underline underline-offset-4">Contact Us</Link> page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">8. Policy Updates</h2>
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
