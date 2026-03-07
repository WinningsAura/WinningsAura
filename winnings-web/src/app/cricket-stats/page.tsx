"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function cleanMojibake(value: string) {
  return (value || "")
    .replace(/â‚¹/g, "\u20B9")
    .replace(/Â£/g, "\u00A3")
    .replace(/â€™/g, "'")
    .replace(/â€“|–|—|�/g, "-")
    .replace(/\uFFFD/g, "")
    .replace(/\?/g, "")
    .replace(/\b(Men|Women)-s\b/gi, "$1's")
    .replace(/Men['’]?s/gi, "Men's")
    .replace(/Women['’]?s/gi, "Women's")
    .replace(/([\u20B9\u00A3$])-\s*/g, "$1")
    .replace(/([\u20B9\u00A3$])\s*-\s*(?=\d)/g, "$1")
    .replace(/~-/g, "~")
    .replace(/\s*-\s*-/g, "-")
    .replace(/-{2,}/g, "-")
    .trim();
}

function normalizeContractCurrency(value: string, country: string) {
  let text = cleanMojibake(value);
  if (!text) return "";

  const lowerCountry = country.toLowerCase();
  const hasCurrencyPrefix = /^(\u20B9|\u00A3|\$|PKR|AUD|Tk|EUR)/i.test(text) || text.includes("$");

  if (!hasCurrencyPrefix) {
    if (lowerCountry.includes("india")) text = `\u20B9${text}`;
    else if (lowerCountry.includes("england")) text = `\u00A3${text}`;
  }

  if (lowerCountry.includes("england")) {
    text = text.replace(/^\u00A3-/, "\u00A3");
  }

  return text;
}

function formatContractCell(value: string, country: string, colIdx: number) {
  let text = normalizeContractCurrency(value, country);
  if (!text) return "-";

  if (country.toLowerCase().includes("england") && colIdx >= 2) {
    // Normalize England fee formats like £~£14.5K / ~14.5K / £14.5K -> ~£14.5K
    text = text.replace(/^£\s*~\s*£?/i, "~£");
    text = text.replace(/^~\s*£?/i, "~£");
    if (!text.startsWith("~£")) {
      text = text.replace(/^£\s*/i, "");
      text = `~£${text.replace(/^~+/, "")}`;
    }
  }

  return text;
}

type IccTable = { header: string[]; body: string[][] };
const ICC_DEFAULT_HEADER = ["Tournament", "Winner", "Runner Up", "Other Key Prizes"];

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
  const text = cleanMojibake(label || "");
  if (!text) return ["", ""] as const;
  const words = text.split(/\s+/);
  if (words.length < 3) return [text, ""] as const;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] as const;
}

function extractIccTable(rows: string[][], gender: "men" | "women", fallbackHeader: string[]): IccTable {
  const headingIdx = rows.findIndex((r) => cleanMojibake(r[0] || "").toLowerCase().includes(`icc event prize money structures - ${gender}`));
  if (headingIdx === -1) return { header: fallbackHeader, body: [] };

  const headerRow = (rows[headingIdx + 1] || []).map((c) => cleanMojibake(c || ""));
  const colCount = Math.max(1, headerRow.filter((c) => c.trim().length > 0).length);
  const header = Array.from({ length: colCount }, (_, i) => headerRow[i] || fallbackHeader[i] || `Column ${i + 1}`);

  const body: string[][] = [];
  for (let i = headingIdx + 2; i < rows.length; i++) {
    const first = cleanMojibake(rows[i]?.[0] || "").toLowerCase();
    if (!first) break;
    if (first.includes("icc event prize money structures -") || first.includes("prize money for domestic tournaments")) break;
    body.push(Array.from({ length: colCount }, (_, c) => cleanMojibake(rows[i]?.[c] || "") || "-"));
  }

  return { header, body };
}

function extractMensIccRows13To33(rows: string[][], fallbackHeader: string[]): IccTable {
  const headingIdx = rows.findIndex((r) => cleanMojibake(r[0] || "").toLowerCase().includes("icc event prize money structures - men's"));
  if (headingIdx === -1) return { header: fallbackHeader, body: [] };

  // source rows 13..33 inclusive = heading + header + 19 data rows
  const segment = rows.slice(headingIdx, headingIdx + 21);
  const headerRow = (segment[1] || []).map((c) => cleanMojibake(c || ""));
  const colCount = Math.max(5, headerRow.filter((c) => c.trim().length > 0).length);
  const header = Array.from({ length: colCount }, (_, i) => headerRow[i] || fallbackHeader[i] || `Column ${i + 1}`);

  const body = segment
    .slice(2)
    .map((r) => Array.from({ length: colCount }, (_, c) => cleanMojibake(r?.[c] || "") || "-"))
    .filter((r) => r.some((c) => c && c !== "-"));

  return { header, body };
}

export default function CricketStatsPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"Men's" | "Women's">("Men's");
  const [selectedPrizeRow, setSelectedPrizeRow] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent("Cricket")}`, { cache: "no-store" });
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

  const contractsTable = useMemo(() => {
    const iccHeadingIdx = rows.findIndex((r) => r.some((c) => (c || "").toLowerCase().includes("icc event prize money structures")));
    const sectionRows = iccHeadingIdx === -1 ? rows : rows.slice(0, iccHeadingIdx);

    const headerIdx = sectionRows.findIndex((r) => cleanMojibake(r[0] || "").toLowerCase() === "country");
    if (headerIdx === -1) return { header: [] as string[], body: [] as string[][] };

    const header = ["Country", "Central Retainer", "Test Fee", "ODI Fee", "T20 Fee"];

    const body = sectionRows
      .slice(headerIdx + 1)
      .map((r) => r.slice(0, 5))
      .filter((r) => cleanMojibake(r[0] || "").trim().length > 0);

    return { header, body };
  }, [rows]);

  const iccMensTable = useMemo(() => extractMensIccRows13To33(rows, ICC_DEFAULT_HEADER), [rows]);
  const iccWomensTable = useMemo(() => extractIccTable(rows, "women", ICC_DEFAULT_HEADER), [rows]);
  const activeIccTable = selectedCategory === "Men's" ? iccMensTable : iccWomensTable;

  const displayIccTable = useMemo(() => {
    if (selectedCategory === "Men's") return activeIccTable;
    const removeIdx = activeIccTable.header.findIndex((h) => cleanMojibake(h).toLowerCase().includes("other key prizes"));
    if (removeIdx === -1) return activeIccTable;
    return {
      header: activeIccTable.header.filter((_, i) => i !== removeIdx),
      body: activeIccTable.body.map((row) => row.filter((_, i) => i !== removeIdx)),
    };
  }, [activeIccTable, selectedCategory]);

  const iccHeader = displayIccTable.header.length ? displayIccTable.header : ICC_DEFAULT_HEADER;

  const prizeRows = useMemo(() => displayIccTable.body.map((r) => cleanMojibake(r[0] || "")).filter(Boolean), [displayIccTable.body]);

  useEffect(() => {
    if (!prizeRows.length) return;
    if (!selectedPrizeRow || !prizeRows.includes(selectedPrizeRow)) setSelectedPrizeRow(prizeRows[0]);
  }, [prizeRows, selectedPrizeRow]);

  const chartData = useMemo(() => {
    const row = displayIccTable.body.find((r) => cleanMojibake(r[0] || "") === selectedPrizeRow);
    if (!row) return [] as { label: string; raw: string; value: number }[];

    return iccHeader.slice(1).map((label, idx) => {
      const raw = row[idx + 1] || "";
      const value = parseMoney(raw);
      return { label, raw, value: Number.isNaN(value) ? 0 : value };
    });
  }, [displayIccTable.body, iccHeader, selectedPrizeRow]);

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f2a3a_0%,_#0a1626_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-6xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <section className="relative mb-4 overflow-visible rounded-2xl border border-amber-200/25 bg-black/45 p-4 sm:p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: "url('/cricket-aura-max-2026.svg')" }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-900/45 via-black/40 to-black/70" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
            </Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-3">
              <div className="relative">
                <details className="group relative z-[90]">
                  <summary className="list-none cursor-pointer rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">
                    Menu
                  </summary>
                  <div className="pointer-events-none absolute right-0 top-full z-[100] mt-0 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 pt-3 opacity-0 shadow-2xl transition group-open:pointer-events-auto group-open:opacity-100">
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
          <h1 className="relative z-0 mt-3 break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:z-10 sm:text-4xl">Cricket Winnings</h1>
        </section>

        {loading ? <p className="mt-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">Error: {error}</p> : null}

        <section className="mt-5">
          <h2 className="mb-3 break-words text-sm font-semibold leading-tight text-amber-100/90">Cricket Categories</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(["Men's", "Women's"] as const).map((cat) => (
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

        {selectedCategory === "Men's" ? (
          <section className="mt-5">
            <h2 className="mb-3 break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">Player Central Contracts and Match Fees</h2>
            <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
              <table className="min-w-full text-left text-sm">
                {contractsTable.header.length > 0 ? (
                  <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                    <tr>
                      {contractsTable.header.map((cell, idx) => (
                        <th
                          key={`contracts-${idx}-${cell}`}
                          className={`px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal break-words sm:text-sm sm:whitespace-nowrap ${
                            idx === 0 ? "sticky left-0 z-20 bg-[#173342]" : ""
                          }`}
                        >
                          {cleanMojibake(cell || "") || `Column ${idx + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {contractsTable.body.map((row, rIdx) => (
                    <tr
                      key={`contracts-${rIdx}`}
                      className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45"
                      style={{ animation: "fly-in-row 520ms ease-out both", animationDelay: `${Math.min(rIdx * 45, 900)}ms` }}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={`contracts-${rIdx}-${cIdx}`}
                          className={`px-4 py-3 whitespace-normal break-words align-top text-amber-50/95 sm:whitespace-nowrap ${
                            cIdx === 0 ? "sticky left-0 z-10 bg-[#0d2230]" : ""
                          }`}
                        >
                          {cIdx === 0 ? (cleanMojibake(cell || "") || "-") : formatContractCell(cell || "", row[0] || "", cIdx)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="mb-3 break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">
            {selectedCategory === "Men's" ? "ICC Event Prize Money Structures - Men's Team" : "ICC Event Prize Money Structures - Women's Team"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
            <table className="min-w-full table-fixed border-separate border-spacing-0 border border-amber-200/35 text-left text-sm">
              <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                <tr>
                  {iccHeader.map((cell, idx) => (
                    <th
                      key={`icc-${idx}-${cell}`}
                      className={`border-y border-amber-200/35 px-4 py-3 text-xs font-semibold tracking-wide sm:text-sm ${
                        idx === 0
                          ? "sticky left-0 z-20 whitespace-normal break-words bg-[#173342]"
                          : idx === 3
                            ? "whitespace-normal break-words"
                            : "whitespace-nowrap"
                      }`}
                    >
                      {cleanMojibake(cell || "") || `Column ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayIccTable.body.map((row, rIdx) => (
                  <tr
                    key={`icc-${rIdx}`}
                    className="odd:bg-black/25 even:bg-black/45"
                    style={{ animation: "fly-in-row 520ms ease-out both", animationDelay: `${Math.min(rIdx * 45, 900)}ms` }}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={`icc-${rIdx}-${cIdx}`}
                        className={`border-t border-amber-200/20 px-4 py-3 align-top text-amber-50/95 ${
                          cIdx === 0
                            ? "sticky left-0 z-10 whitespace-normal break-words bg-[#0d2230]"
                            : "whitespace-nowrap text-center"
                        }`}
                      >
                        {cleanMojibake(cell || "") || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">Prize Money Chart</h3>
            <select className="rounded-lg border border-amber-200/40 bg-black/60 px-3 py-2 text-sm" value={selectedPrizeRow} onChange={(e) => setSelectedPrizeRow(e.target.value)}>
              {prizeRows.map((r, i) => (
                <option key={`${r}-${i}`} value={r}>{r}</option>
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
                  <div className="font-semibold whitespace-normal break-words">{cleanMojibake(d.label)}</div>
                  <div>{cleanMojibake(d.raw || "") || "-"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}








