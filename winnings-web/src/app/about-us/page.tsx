"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AboutUsPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent("About Us")}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load About Us content");
        if (!cancelled) setRows(Array.isArray(data.rows) ? data.rows : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-5xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/winnings-aura-logo.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            
            <div className="group relative">
              <button type="button" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Menu</button>
              <div className="invisible absolute right-0 top-full z-50 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <Link href="/tennis-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Tennis</span><span>{"\uD83C\uDFBE"}</span></Link>
                <Link href="/cricket-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Cricket</span><span>{"\uD83C\uDFCF"}</span></Link>
                <Link href="/golf-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Golf</span><span>{"\u26F3"}</span></Link>
                <Link href="/contact-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Contact Us</span><span>{"\u2709\uFE0F"}</span></Link>
              </div>
            </div>
          </nav>
        </div>
        <h1 className="text-2xl font-bold text-amber-100 sm:text-4xl">About Us</h1>
        <p className="mt-2 text-amber-100/80">Content is loaded from the Excel sheet named &quot;About Us&quot;.</p>

        {loading ? <p className="mt-4 text-sm text-amber-100/80">Loading...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-5 space-y-3">
          {rows.map((row, idx) => {
            const line = row.filter(Boolean).join(" ").trim();
            if (!line) return null;
            return (
              <p key={idx} className="rounded-lg border border-amber-200/20 bg-black/40 px-4 py-3 text-amber-50/95">
                {line}
              </p>
            );
          })}
        </div>
      </main>
    </div>
  );
}



