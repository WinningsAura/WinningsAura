"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const sports = [
  {
    name: "Tennis",
    image: "/tennis-aura-max-2026.svg",
    href: "/tennis-stats",
    description: "Explore premium tennis prize money insights.",
  },
  {
    name: "Cricket",
    image: "/cricket-aura-max-2026.svg",
    href: "/cricket-stats",
    description: "Discover cricket stats and winnings dashboards.",
  },
  {
    name: "Golf",
    image: "/golf-aura-max-2026.svg",
    href: "/golf-stats",
    description: "View golf winnings and event prize insights.",
  },
  {
    name: "Chess",
    image: "/chess-aura-max-2026.svg",
    href: "/chess-stats",
    description: "Explore chess prize money across open, women's, and mixed events.",
  },
  {
    name: "Badminton",
    image: "/badminton-aura-max-2026.svg",
    href: "/badminton-stats",
    description: "Track badminton payouts by category, year, and round.",
  },
  {
    name: "Soccer",
    image: "/soccer-aura-max-2026.svg",
    href: "/soccer-stats",
    description: "View FIFA and continental soccer prize money details.",
  },
  {
    name: "Compare Sports",
    image: "/sports-legends-bg.svg",
    href: "/compare-sports",
    description: "Compare top prize amounts across sports by position.",
  },
] as const;

export default function HomePage() {
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const id = window.setInterval(() => {
      setStartIndex((i) => (i - 1 + sports.length) % sports.length);
    }, 4000);

    return () => window.clearInterval(id);
  }, [isPaused]);

  const rotatingSports = useMemo(() => {
    return sports.map((_, i) => sports[(startIndex + i) % sports.length]);
  }, [startIndex]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1020_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-8%] h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute top-1/3 right-[-10%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-16%] left-1/3 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="relative z-30 mb-6 rounded-2xl border border-amber-300/30 bg-black/55 p-5 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:mb-8 sm:rounded-3xl sm:p-8">
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
                    <Link href="/compare-sports" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Compare Sports</span><span>{"\uD83D\uDCCA"}</span></Link>
                    <Link href="/submit-prize-structure" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Submit Prize Data</span><span>{"\uD83D\uDCDD"}</span></Link>
                    <Link href="/contact-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Contact Us</span><span>{"\u2709\uFE0F"}</span></Link>
                  </div>
                </details>
              </div>
            </nav>
          </div>

          <h1 className="mt-2 break-words text-[clamp(1.75rem,6vw,2.7rem)] font-bold leading-tight tracking-tight text-amber-100 sm:text-5xl">WinningsAura</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-amber-100/90 sm:text-base">
            Sports Prize Money Intelligence — structured, comparable, and easy to explore across tournaments,
            categories, and sports.
          </p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-xs leading-6 text-amber-100/80 sm:text-sm">
            <li>Compare payouts across sports and events in seconds.</li>
            <li>See clean prize structures without spreadsheet noise.</li>
            <li>Track trends and opportunities from one platform.</li>
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/submit-prize-structure"
              className="rounded-xl border border-amber-200/60 bg-amber-300/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/30"
            >
              Submit Prize Structure
            </Link>
            {/* helper text removed */}
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-amber-200/20 bg-black/35 p-4 sm:mb-8 sm:rounded-3xl sm:p-6">
          <h2 className="text-lg font-semibold text-amber-100 sm:text-xl">Why WinningsAura</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-100/80 sm:text-base">
            Sports payout information is often fragmented across formats and sources. WinningsAura standardizes that
            data so athletes, fans, and analysts can compare prize structures quickly and make better decisions.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rotatingSports.map((sport) => (
            <Link
              key={sport.name}
              href={sport.href}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-amber-300/30 bg-black/50 shadow-2xl backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-[0_0_50px_rgba(245,185,59,0.2)] sm:rounded-3xl ${
                sport.name === "Golf"
                  ? "shadow-[0_24px_60px_rgba(16,185,129,0.22),0_0_35px_rgba(34,211,238,0.16)]"
                  : ""
              }`}
            >
              <div className="relative h-44 w-full sm:h-52 lg:h-56">
                <Image
                  src={sport.image}
                  alt={`${sport.name} visual`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                {sport.name === "Tennis" ? (
                  <div className="pointer-events-none absolute inset-0 opacity-35">
                    <div className="grid h-full grid-cols-4 grid-rows-2">
                      {[
                        "from-orange-400 to-orange-700",
                        "from-blue-400 to-blue-700",
                        "from-green-400 to-green-700",
                        "from-blue-700 to-slate-950",
                        "from-orange-400 to-orange-700",
                        "from-blue-400 to-blue-700",
                        "from-green-400 to-green-700",
                        "from-blue-700 to-slate-950",
                      ].map((colors, idx) => (
                        <div key={idx} className={`border border-white/10 bg-gradient-to-br ${colors}`} />
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

                {sport.name === "Compare Sports" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                    <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura logo" className="h-9 w-auto drop-shadow-[0_0_12px_rgba(245,185,59,0.45)] sm:h-11" />
                    <div className="flex items-end gap-1.5">
                      <span className="h-5 w-2 rounded bg-amber-300/85" />
                      <span className="h-8 w-2 rounded bg-amber-300/85" />
                      <span className="h-12 w-2 rounded bg-amber-200" />
                      <span className="h-9 w-2 rounded bg-amber-300/85" />
                      <span className="h-14 w-2 rounded bg-amber-100" />
                    </div>
                  </div>
                ) : null}

                <p className="absolute bottom-3 left-3 max-w-[85%] break-words text-lg font-bold leading-tight text-amber-100 sm:bottom-4 sm:left-4 sm:max-w-none sm:text-2xl">{sport.name}</p>
              </div>
              <div className="flex-1 p-4 text-sm leading-6 text-amber-100/85 sm:p-5">
                {sport.name === "Compare Sports" ? "Graphs view for quick cross-sport comparison." : sport.description}
              </div>
            </Link>
          ))}
        </section>
      </main>

      <style jsx>{`
        .animate-dollar-spin {
          transform-origin: 50% 55%;
          animation: dollarSpin 5s ease-in-out infinite;
        }

        @keyframes dollarSpin {
          0% {
            transform: rotate(0deg);
          }
          60% {
            transform: rotate(1080deg);
          }
          100% {
            transform: rotate(1080deg);
          }
        }
      `}</style>
    </div>
  );
}

