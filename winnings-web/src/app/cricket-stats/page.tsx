"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function CricketStatsPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent("Cricket")}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch cricket data");
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

  const header = useMemo(() => rows[0] ?? [], [rows]);
  const body = useMemo(() => (rows.length > 1 ? rows.slice(1) : []), [rows]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-6xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/sports-winnings-logo.svg" alt="Sports Winnings" className="h-8 w-auto sm:h-9" />
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <Link href="/" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Home</Link>
            <div className="group relative">
              <button type="button" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Menu</button>
              <div className="invisible absolute right-0 top-full z-20 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <Link href="/about-us" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">About Us</Link>
                <Link href="/tennis-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">Tennis</Link>
                <Link href="/contact-us" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">Contact Us</Link>
              </div>
            </div>
          </nav>
        </div>
        <h1 className="text-2xl font-bold text-amber-100 sm:text-4xl">Cricket Stats</h1>
        <p className="mt-2 text-amber-100/80">Live data from the Cricket sheet.</p>

        {loading ? <p className="mt-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">Error: {error}</p> : null}

        <div className="mt-5 overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
          <table className="min-w-full text-left text-sm">
            {header.length > 0 ? (
              <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                <tr>
                  {header.map((cell, idx) => (
                    <th key={`${idx}-${cell}`} className="px-4 py-3 whitespace-nowrap font-semibold tracking-wide">
                      {cell || `Column ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45">
                  {row.map((cell, cIdx) => (
                    <td key={`${rIdx}-${cIdx}`} className="px-4 py-3 whitespace-nowrap align-top text-amber-50/95">
                      {cell || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link href="/" className="mt-6 inline-block rounded-xl border border-amber-200/40 px-4 py-2 text-sm text-amber-100 hover:border-amber-200">
          ← Back to Sports Home
        </Link>
      </main>
    </div>
  );
}

