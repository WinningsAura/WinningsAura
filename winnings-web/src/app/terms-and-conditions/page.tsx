import Link from "next/link";

export default function TermsAndConditionsPage() {
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

        <h1 className="break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:text-4xl">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-amber-100/70">Effective date: March 28, 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-amber-100/90 sm:text-base">
          <p>
            These Terms and Conditions ("Terms") govern your use of the WinningsAura website.
            By accessing or using this site, you agree to these Terms.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">1. Information Purpose and No Final Reliance</h2>
            <p className="mt-2">
              WinningsAura aims to present prize-money and related information based on data that is publicly provided
              by organizers and other sources believed to be official. However, all content is provided for general
              informational purposes only and should not be treated as final, definitive, or official advice.
            </p>
            <p className="mt-2">
              You should independently verify data authenticity directly with the relevant organizer or governing body
              before making any decision based on website content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">2. Accuracy Disclaimer and Limitation of Responsibility</h2>
            <p className="mt-2">
              To the fullest extent permitted by law, WinningsAura and its owners/operators disclaim responsibility and
              liability for errors, omissions, delays, formatting issues, outdated entries, or authenticity of data
              displayed on the website.
            </p>
            <p className="mt-2">
              WinningsAura shall not be liable for any direct, indirect, incidental, consequential, special, or legal
              damages arising from use of or reliance on website content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">3. Intellectual Property and Content Use</h2>
            <p className="mt-2">
              Unless otherwise stated, website design, text, layouts, and compiled data presentation are owned by or
              licensed to WinningsAura.
            </p>
            <p className="mt-2">
              No user may copy, scrape, republish, distribute, or commercially use website content without prior written
              permission from WinningsAura owners, except for limited personal, non-commercial viewing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">4. Acceptable Use</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Do not attempt unauthorized access to site systems or related infrastructure.</li>
              <li>Do not interfere with site performance, security, or availability.</li>
              <li>Do not use automated methods to collect data at abusive rates.</li>
              <li>Do not post or transmit unlawful, harmful, or fraudulent content via website forms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">5. Third-Party Links and Services</h2>
            <p className="mt-2">
              The website may link to third-party services and resources. WinningsAura is not responsible for the
              availability, content, policies, or practices of third-party websites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">6. Contact Submissions</h2>
            <p className="mt-2">
              Messages sent through the <Link href="/contact-us" className="underline underline-offset-4">Contact Us</Link> page are treated as confidential,
              subject to applicable law and operational requirements described in our
              <Link href="/privacy-policy" className="ml-1 underline underline-offset-4">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">7. Sports Prize Structure Submissions</h2>
            <p className="mt-2">
              If you submit sports prize structure data through the website, you represent that the information is true,
              accurate to the best of your knowledge, and does not violate any third-party rights.
            </p>
            <p className="mt-2">
              WinningsAura may review, edit for formatting clarity, approve, reject, or remove submissions at its sole
              discretion. Submission does not guarantee publication, and published entries may include moderation notes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">8. User Accounts and Access</h2>
            <p className="mt-2">
              Certain features (including My Submissions, password reset, and submission-status tracking) require a user account.
              You are responsible for maintaining the confidentiality of your login credentials and for activity under your account.
            </p>
            <p className="mt-2">
              WinningsAura may suspend or restrict access where misuse, fraud, or security risk is detected.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">9. Changes to Terms</h2>
            <p className="mt-2">
              We may modify these Terms at any time. Updated Terms are effective once posted on this page.
              Continued use of the website after updates means you accept the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">10. Governing Law</h2>
            <p className="mt-2">
              These Terms are governed by applicable laws of the jurisdiction in which WinningsAura is operated,
              without prejudice to mandatory consumer protections that may apply in your location.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

