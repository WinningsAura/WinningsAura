"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = "Open (Men's)" | "Women's" | "Both";

function clean(value: string) {
  return (value || "")
    .replace(/�/g, "")
    .replace(/\uFFFD/g, "")
    .trim();
}

function formatMoney(value: string) {
  const text = clean(value);
  if (!text) return "-";
  if (/^((A\$)|[$€£])?\s*-\s*$/i.test(text)) return "-";
  if (/[$€£]/.test(text)) return text;
  if (/\d/.test(text)) return `$${text}`;
  return text;
}

function sectionBounds(rows: string[][], label: Category) {
  const start = rows.findIndex((r) => clean(r[0] || "").toLowerCase() === "category" && clean(r[1] || "").toLowerCase() === label.toLowerCase());
  if (start === -1) return null;

  let end = rows.length;
  for (let i = start + 1; i < rows.length; i++) {
    if (clean(rows[i][0] || "").toLowerCase() === "category") {
      end = i;
      break;
    }
  }

  return { start, end };
}

export default function ChessStatsPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open (Men's)");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent("Chess")}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch chess data");
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

  const table = useMemo(() => {
    const bounds = sectionBounds(rows, selectedCategory);
    if (!bounds) return { header: [] as string[], body: [] as string[][] };

    const section = rows.slice(bounds.start, bounds.end);
    const headerRow = section.find((r) => clean(r[0] || "").toLowerCase() === "position") || [];
    const lastCol = Math.max(2, headerRow.findLastIndex((c) => clean(c || "") !== "") + 1);
    const header = headerRow.slice(0, lastCol).map((c, i) => clean(c || "") || `Column ${i + 1}`);

    const body = section
      .slice(section.indexOf(headerRow) + 1)
      .map((r) => r.slice(0, lastCol).map((c) => clean(c || "")))
      .filter((r) => clean(r[0] || "") !== "")
      .map((r) => r.map((c, idx) => (idx === 0 ? (c || "-") : formatMoney(c))));

    return { header, body };
  }, [rows, selectedCategory]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1d2238_0%,_#0d1120_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-6xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <section className="relative mb-4 overflow-visible rounded-2xl border border-amber-200/25 bg-black/45 p-4 sm:p-5">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('/chess-aura-max-2026.svg')" }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-900/45 via-black/40 to-black/70" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
            </Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-3">
              <div className="relative">
                <details className="group">
                  <summary className="list-none cursor-pointer rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Menu</summary>
                  <div className="pointer-events-none absolute right-0 top-full z-[100] mt-1 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-open:pointer-events-auto group-open:opacity-100">
                    <Link href="/about-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>About Us</span><span>{"\uD83D\uDC65"}</span></Link>
                    <Link href="/tennis-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Tennis</span><span>{"\uD83C\uDFBE"}</span></Link>
                    <Link href="/cricket-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Cricket</span><span>{"\uD83C\uDFCF"}</span></Link>
                    <Link href="/golf-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Golf</span><span>{"\u26F3"}</span></Link>
                    <Link href="/chess-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Chess</span><span>{"\u265F"}</span></Link>
                    <Link href="/contact-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Contact Us</span><span>{"\u2709\uFE0F"}</span></Link>
                  </div>
                </details>
              </div>
            </nav>
          </div>
          <h1 className="relative z-0 mt-3 break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:z-10 sm:text-4xl">Chess Winnings</h1>
        </section>

        {loading ? <p className="mt-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">Error: {error}</p> : null}

        <section className="mt-5">
          <h2 className="mb-3 break-words text-sm font-semibold leading-tight text-amber-100/90">Chess Categories</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(["Open (Men's)", "Women's", "Both"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedCategory === cat
                    ? "border-amber-200/90 bg-amber-200/15 ring-2 ring-amber-300/35"
                    : "border-amber-200/30 bg-black/45 hover:border-amber-200/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">{selectedCategory}</h2>
          <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
            <table className="min-w-full table-fixed border-separate border-spacing-0 border border-amber-200/35 text-left text-sm">
              <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                <tr>
                  {table.header.map((cell, idx) => (
                    <th key={`chess-${idx}-${cell}`} className={`border-y border-amber-200/35 px-4 py-3 text-xs font-semibold tracking-wide sm:text-sm ${idx === 0 ? "whitespace-normal break-words" : "whitespace-nowrap text-center"}`}>
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.body.map((row, rIdx) => (
                  <tr key={`chess-row-${rIdx}`} className="odd:bg-black/25 even:bg-black/45">
                    {row.map((cell, cIdx) => (
                      <td key={`chess-${rIdx}-${cIdx}`} className={`border-t border-amber-200/20 px-4 py-3 align-top text-amber-50/95 ${cIdx === 0 ? "whitespace-normal break-words" : "whitespace-nowrap text-center"}`}>
                        {cell || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
