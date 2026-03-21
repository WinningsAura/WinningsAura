"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BadmintonCategory = "Men's Singles" | "Women's Singles" | "Men's Doubles" | "Women's Doubles" | "Mixed Doubles";
type YearFilter = "2026" | "2025" | "2024";

type BadmintonRow = {
  Year: string;
  "Tournament/Event": string;
  Category: string;
  Winner: string;
  "Runner-up": string;
  "Semi-finalists": string;
  QF: string;
  R16: string;
  R32: string;
  "3rd in Group": string;
  "4th in Group": string;
  Currency: string;
};

const categories: BadmintonCategory[] = ["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];
const years: YearFilter[] = ["2026", "2025", "2024"];

const roundDefs = [
  { key: "Winner", label: "Winner" },
  { key: "Runner-up", label: "Runner-up" },
  { key: "Semi-finalists", label: "Semi-finalists" },
  { key: "QF", label: "QF" },
  { key: "R16", label: "R16" },
  { key: "R32", label: "R32" },
  { key: "3rd in Group", label: "3rd in Group" },
  { key: "4th in Group", label: "4th in Group" },
] as const;

function clean(value: string) {
  return (value || "").replace(/\uFEFF/g, "").trim();
}

function formatMoney(value: string, currency = "USD") {
  const text = clean(value);
  if (!text) return "-";
  if (text === "-" || text === "—" || text === "–") return "-";

  const cur = clean(currency).toUpperCase();
  const symbol = cur.includes("USD") ? "$" : cur.includes("EUR") ? "€" : cur.includes("GBP") ? "£" : "";

  if (/^([$€£])/.test(text)) return text;

  const numeric = Number(text.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return symbol ? `${symbol}${text}` : (cur ? `${cur} ${text}` : text);

  const formatted = numeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (symbol) return `${symbol}${formatted}`;
  return cur ? `${cur} ${formatted}` : formatted;
}

function normalizeCategory(value: string): string {
  const v = clean(value);
  const map: Record<string, BadmintonCategory> = {
    MS: "Men's Singles",
    WS: "Women's Singles",
    MD: "Men's Doubles",
    WD: "Women's Doubles",
    XD: "Mixed Doubles",
  };
  return map[v] || v;
}

function renderTournamentHeader(event: string) {
  const marker = "(Super 1000)";
  if (!event.includes(marker)) return event;

  const name = clean(event.replace(marker, ""));
  return (
    <>
      <span className="block">{name}</span>
      <span className="block">{marker}</span>
    </>
  );
}

export default function BadmintonStatsPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BadmintonCategory>("Men's Singles");
  const [selectedYear, setSelectedYear] = useState<YearFilter>("2026");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent("Badminton")}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch badminton data");
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

  const parsedRows = useMemo(() => {
    if (!rows.length) return [] as BadmintonRow[];
    const header = rows[0].map((h) => clean(h));

    const idx = {
      year: header.indexOf("Year"),
      event: header.indexOf("Tournament/Event"),
      category: header.indexOf("Category"),
      winner: header.indexOf("Winner"),
      runner: header.indexOf("Runner-up"),
      semi: header.indexOf("Semi-finalists"),
      qf: header.indexOf("QF"),
      r16: header.indexOf("R16"),
      r32: header.indexOf("R32"),
      third: header.indexOf("3rd in Group"),
      fourth: header.indexOf("4th in Group"),
      currency: header.indexOf("Currency"),
    };

    return rows.slice(1).map((r) => ({
      Year: clean(r[idx.year] || ""),
      "Tournament/Event": clean(r[idx.event] || ""),
      Category: normalizeCategory(r[idx.category] || ""),
      Winner: clean(r[idx.winner] || ""),
      "Runner-up": clean(r[idx.runner] || ""),
      "Semi-finalists": clean(r[idx.semi] || ""),
      QF: clean(r[idx.qf] || ""),
      R16: clean(r[idx.r16] || ""),
      R32: clean(r[idx.r32] || ""),
      "3rd in Group": clean(r[idx.third] || ""),
      "4th in Group": clean(r[idx.fourth] || ""),
      Currency: clean(r[idx.currency] || "USD"),
    }));
  }, [rows]);

  const filteredRows = useMemo(() => {
    return parsedRows
      .filter((r) => r.Year === selectedYear && r.Category === selectedCategory)
      .sort((a, b) => a["Tournament/Event"].localeCompare(b["Tournament/Event"]));
  }, [parsedRows, selectedYear, selectedCategory]);

  const tournaments = useMemo(() => {
    return Array.from(new Set(filteredRows.map((r) => r["Tournament/Event"]).filter(Boolean)));
  }, [filteredRows]);

  const matrixRows = useMemo(() => {
    return roundDefs.map((round) => {
      const values = tournaments.map((event) => {
        const row = filteredRows.find((r) => r["Tournament/Event"] === event);
        if (!row) return "-";
        return formatMoney(row[round.key], row.Currency);
      });
      return { round: round.label, values };
    });
  }, [filteredRows, tournaments]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#123524_0%,_#0b1020_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-6xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <section className="relative z-40 mb-4 overflow-visible rounded-2xl border border-amber-200/25 bg-black/45 p-4 sm:p-5">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('/badminton-aura-max-2026.svg')" }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-900/45 via-black/40 to-black/70" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
            </Link>
            <nav className="relative z-50 flex items-center gap-2 text-sm sm:gap-3">
              <div className="relative">
                <details className="group relative z-[1000]">
                  <summary className="list-none cursor-pointer rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Menu</summary>
                  <div className="absolute right-0 top-full z-[2000] mt-1 hidden w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 shadow-2xl group-open:block">
                    <Link href="/about-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>About Us</span><span>{"\uD83D\uDC65"}</span></Link>
                    <Link href="/tennis-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Tennis</span><span>{"\uD83C\uDFBE"}</span></Link>
                    <Link href="/cricket-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Cricket</span><span>{"\uD83C\uDFCF"}</span></Link>
                    <Link href="/golf-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Golf</span><span>{"\u26F3"}</span></Link>
                    <Link href="/chess-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Chess</span><span>{"\u265F"}</span></Link>
                    <Link href="/badminton-stats" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Badminton</span><span>{"\uD83C\uDFF8"}</span></Link>
                    <Link href="/contact-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Contact Us</span><span>{"\u2709\uFE0F"}</span></Link>
                  </div>
                </details>
              </div>
            </nav>
          </div>

          <h1 className="relative z-0 mt-3 break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:z-10 sm:text-4xl">Badminton Winnings</h1>

          <div className="relative z-10 mt-5">
            <h2 className="mb-3 break-words text-sm font-semibold leading-tight text-amber-100">Badminton Categories</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm text-amber-100 transition ${
                    selectedCategory === cat
                      ? "border-amber-200/90 bg-amber-200/15 ring-2 ring-amber-300/35"
                      : "border-amber-200/30 bg-black/45 hover:border-amber-200/70"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-4 w-full max-w-[150px]">
            <label className="mb-1 block text-xs font-semibold text-amber-100">Year</label>
            <select
              className="w-full rounded-lg border border-amber-200/40 bg-black/60 px-3 py-1.5 text-sm text-amber-100 outline-none transition focus:border-amber-200"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value as YearFilter)}
            >
              {years.map((y) => (
                <option className="bg-black" key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </section>

        {loading ? <p className="mt-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">Error: {error}</p> : null}

        <section className="mt-8">
          <h2 className="mb-3 break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">{selectedCategory} • {selectedYear}</h2>
          <p className="mb-3 text-xs leading-6 text-amber-100/80 sm:text-sm">
            Data shown here is compiled from public badminton sources and organized by tournament, year, category, and round.
            Amounts are displayed in listed event currency and should be independently verified with official tournament or federation releases.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
            <table className="min-w-[960px] w-full table-fixed border-separate border-spacing-0 border border-amber-200/35 text-left text-sm">
              <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                <tr>
                  <th className="sticky left-0 z-20 border-y border-amber-200/35 bg-[#153124] px-3 py-3 text-xs font-semibold tracking-wide sm:text-sm">
                    Round
                  </th>
                  {tournaments.map((event) => (
                    <th key={event} className="border-y border-amber-200/35 px-3 py-3 text-center text-xs font-semibold tracking-wide sm:text-sm">
                      {renderTournamentHeader(event)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row, rIdx) => (
                  <tr key={`${row.round}-${rIdx}`} className="odd:bg-black/25 even:bg-black/45">
                    <td className="sticky left-0 z-10 border-t border-amber-200/20 bg-[#101f18] px-3 py-3 align-top text-amber-50/95 whitespace-nowrap">
                      {row.round}
                    </td>
                    {row.values.map((value, cIdx) => (
                      <td key={`${row.round}-${cIdx}`} className="border-t border-amber-200/20 px-3 py-3 text-center whitespace-nowrap">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
                {!loading && !error && tournaments.length === 0 ? (
                  <tr>
                    <td className="border-t border-amber-200/20 px-3 py-4 text-center text-amber-100/80" colSpan={Math.max(1, tournaments.length + 1)}>
                      No rows available for this year/category.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
