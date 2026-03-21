import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1020_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-5xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
          </Link>
        </div>

        <h1 className="text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:text-4xl">Cookie Policy</h1>
        <p className="mt-2 text-sm text-amber-100/70">Last updated: March 21, 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-amber-100/90 sm:text-base">
          <p>
            WinningsAura uses cookies and similar technologies to keep the site functional, measure performance,
            and support advertising features.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">1. Essential cookies</h2>
            <p className="mt-2">Required for core site behavior, security, and basic navigation.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">2. Analytics cookies</h2>
            <p className="mt-2">Used to understand traffic and improve pages/features.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">3. Advertising cookies</h2>
            <p className="mt-2">
              Advertising partners (such as Google AdSense) may use cookies to personalize ads based on prior visits.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-100">4. Your choices</h2>
            <p className="mt-2">
              You can manage browser cookie settings at any time. If supported in your region, consent controls are
              shown when you first visit the site.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
