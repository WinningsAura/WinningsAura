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

function parseMoney(value: string) {
  const n = Number((value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function formatAxisMoney(value: number) {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

function splitHeaderTwoLines(label: string) {
  const cleanLabel = clean(label);
  if (!cleanLabel) return ["", ""] as const;
  const words = cleanLabel.split(/\s+/);
  if (words.length < 3) return [cleanLabel, ""] as const;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] as const;
}

export default function ChessStatsPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open (Men's)");
  const [selectedPosition, setSelectedPosition] = useState<string>("");

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

  const positions = useMemo(() => table.body.map((r) => r[0]).filter(Boolean), [table.body]);

  useEffect(() => {
    if (!positions.length) return;
    if (!selectedPosition || !positions.includes(selectedPosition)) setSelectedPosition(positions[0]);
  }, [positions, selectedPosition]);

  const chartData = useMemo(() => {
    const row = table.body.find((r) => r[0] === selectedPosition);
    if (!row) return [] as { label: string; raw: string; value: number }[];

    return table.header.slice(1).map((label, idx) => {
      const raw = row[idx + 1] || "";
      const value = parseMoney(raw);
      return { label, raw, value: Number.isNaN(value) ? 0 : value };
    });
  }, [table.body, table.header, selectedPosition]);

  const maxY = useMemo(() => Math.max(1, ...chartData.map((d) => d.value)), [chartData]);

  const yTicks = useMemo(() => {
    const safeMax = Math.max(1, maxY);
    return Array.from({ length: 5 }, (_, i) => {
      const value = (safeMax * (4 - i)) / 4;
      const y = 20 + (i * 180) / 4;
      return { value, y };
    });
  }, [maxY]);

  const linePoints = useMemo(() => {
    if (!chartData.length) return "";
    return chartData
      .map((d, i) => {
        const x = 24 + (chartData.length === 1 ? (680 - 48) / 2 : (i * (680 - 48)) / (chartData.length - 1));
        const y = 20 + (1 - d.value / maxY) * 180;
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData, maxY]);

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
                    <th
                      key={`chess-${idx}-${cell}`}
                      className={`border-y border-amber-200/35 px-4 py-3 text-xs font-semibold tracking-wide sm:text-sm ${
                        idx === 0
                          ? "sticky left-0 z-20 whitespace-normal break-words bg-[#151a2d]"
                          : "whitespace-nowrap text-center"
                      }`}
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.body.map((row, rIdx) => (
                  <tr key={`chess-row-${rIdx}`} className="odd:bg-black/25 even:bg-black/45">
                    {row.map((cell, cIdx) => (
                      <td
                        key={`chess-${rIdx}-${cIdx}`}
                        className={`border-t border-amber-200/20 px-4 py-3 align-top text-amber-50/95 ${
                          cIdx === 0
                            ? "sticky left-0 z-10 whitespace-normal break-words bg-[#101528]"
                            : "whitespace-nowrap text-center"
                        }`}
                      >
                        {cell || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedCategory === "Both" ? (
          <section className="mt-8 rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">Prize Money Chart</h3>
              <select className="rounded-lg border border-amber-200/40 bg-black/60 px-3 py-2 text-sm" value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                {positions.map((p, i) => (
                  <option key={`${p}-${i}`} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-amber-200/20 bg-black/35 p-3">
              <svg viewBox="0 0 680 220" className="h-[220px] min-w-[680px] w-full">
                {yTicks.map((t, i) => (
                  <g key={`tick-${i}`}>
                    <line x1="24" y1={t.y} x2="656" y2={t.y} stroke="rgba(253,230,138,0.18)" />
                    <text x="20" y={t.y + 4} textAnchor="end" fontSize="10" fill="rgba(253,230,138,0.8)">
                      {formatAxisMoney(t.value)}
                    </text>
                  </g>
                ))}
                <line x1="24" y1="200" x2="656" y2="200" stroke="rgba(253,230,138,0.35)" />
                <line x1="24" y1="20" x2="24" y2="200" stroke="rgba(253,230,138,0.35)" />
                <polyline fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={linePoints} />
                {chartData.map((d, i) => {
                  const x = 24 + (chartData.length === 1 ? (680 - 48) / 2 : (i * (680 - 48)) / (chartData.length - 1));
                  const y = 20 + (1 - d.value / maxY) * 180;
                  const [line1, line2] = splitHeaderTwoLines(d.label);
                  const placeBelow = i % 2 === 1;
                  const baseY = placeBelow ? Math.min(210, y + 14) : Math.max(14, y - 14);

                  return (
                    <g key={`${d.label}-${i}`}>
                      <circle cx={x} cy={y} r="4" fill="#FDE68A" />
                      <text x={x} y={baseY} textAnchor="middle" fontSize="10" fill="rgba(253,230,138,0.95)">
                        <tspan x={x} dy="0">{line1 || d.label}</tspan>
                        {line2 ? <tspan x={x} dy="10">{line2}</tspan> : null}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {chartData.map((d, i) => (
                  <div key={`${d.label}-${i}`} className="rounded-lg border border-amber-200/20 px-3 py-2 text-xs text-amber-100/90">
                    <div className="font-semibold whitespace-normal break-words">{d.label}</div>
                    <div>{formatMoney(d.raw || "")}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
