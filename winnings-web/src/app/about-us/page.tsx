import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2b1f4a_0%,_#140f2a_45%,_#07060f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
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

        <h1 className="break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:text-4xl">About WinningsAura</h1>

        <div className="mt-5 rounded-xl border border-amber-200/20 bg-black/40 px-4 py-4 sm:px-5 sm:py-5">
          <div className="space-y-4 text-amber-50/95 leading-7">
            <p>
              WinningsAura is a sports prize money intelligence platform focused on making payout information
              easier to find, understand, and compare.
            </p>

            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-cyan-200 to-fuchsia-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.28)]">
              Our Mission
            </p>
            <p>
              Our mission is to present prize structures in a clean, structured, and consistent format so users can
              quickly evaluate opportunities across sports, events, and categories.
            </p>

            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-cyan-200 to-fuchsia-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.28)]">
              Our Vision
            </p>
            <p>
              We aim to become a trusted reference point for athletes, families, analysts, media professionals,
              and sponsors who want transparent insights into the economics of sport.
            </p>

            <p>
              By comparing prize patterns across tournaments and sports, WinningsAura also helps kids, students,
              and young athletes explore potential career paths and make more informed long-term training decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
