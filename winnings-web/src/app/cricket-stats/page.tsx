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
    const sectionRows = (iccHeadingIdx === -1 ? rows : rows.slice(0, iccHeadingIdx)).filter((r) => (r[0] || "").trim());
    if (!sectionRows.length) return { header: [] as string[], body: [] as string[][] };

    const header = sectionRows[0].slice(0, 5);
    const body = sectionRows.slice(1).map((r) => r.slice(0, 5));
    return { header, body };
  }, [rows]);

  const iccTable = useMemo(() => {
    const headerIdx = rows.findIndex((r) => r.some((c) => (c || "").trim().toLowerCase() === "option") && r.some((c) => (c || "").toLowerCase().includes("tournament")));
    if (headerIdx === -1) return { header: [] as string[], body: [] as string[][] };

    const firstColIdx = rows[headerIdx].findIndex((c) => (c || "").trim().toLowerCase() === "option");
    const startIdx = firstColIdx + 1; // drop Option column
    const headerRow = rows[headerIdx].slice(startIdx, startIdx + 4);
    const body: string[][] = [];

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      const option = (row[firstColIdx] || "").trim();
      if (!option) {
        if (body.length) break;
        continue;
      }
      if (!/^\d+$/.test(option)) continue;
      body.push(row.slice(startIdx, startIdx + 4));
    }

    return { header: headerRow, body };
  }, [rows]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-6xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
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
                    <Link href="/contact-us" className="flex items-center justify-between rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10"><span>Contact Us</span><span>{"\u2709\uFE0F"}</span></Link>
                  </div>
                </details>
              </div>
          </nav>
        </div>
        <h1 className="text-2xl font-bold text-amber-100 sm:text-4xl">Cricket Winnings</h1>

        {loading ? <p className="mt-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">Error: {error}</p> : null}

        <section className="mt-5">
          <h2 className="mb-3 text-lg font-semibold text-amber-100">Central Contracts and Match Fees</h2>
          <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
            <table className="min-w-full text-left text-sm">
              {contractsTable.header.length > 0 ? (
                <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                  <tr>
                    {contractsTable.header.map((cell, idx) => {
                      const label = cleanMojibake(cell || "") || `Column ${idx + 1}`;
                      const displayLabel =
                        label === "Test Fee"
                          ? "Test Match Fee"
                          : label === "ODI Fee"
                            ? "ODI Match Fee"
                            : label === "T20I Fee"
                              ? "T20I Match Fee"
                              : label;

                      return (
                        <th key={`contracts-${idx}-${cell}`} className="px-4 py-3 whitespace-nowrap font-semibold tracking-wide">
                          {displayLabel}
                        </th>
                      );
                    })}
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
                      <td key={`contracts-${rIdx}-${cIdx}`} className="px-4 py-3 whitespace-nowrap align-top text-amber-50/95">
                        {cIdx === 0 ? (cleanMojibake(cell || "") || "�") : (normalizeContractCurrency(cell || "", row[0] || "") || "�")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-amber-100">ICC Event Prize Money Structures (Men's & Women's)</h2>
          <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              {iccTable.header.length > 0 ? (
                <thead className="border-b border-amber-200/35 bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                  <tr>
                    {iccTable.header.map((cell, idx) => (
                      <th key={`icc-${idx}-${cell}`} className="px-4 py-3 whitespace-nowrap font-semibold tracking-wide">
                        {cleanMojibake(cell || "") || `Column ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody>
                {iccTable.body.map((row, rIdx) => (
                  <tr
                    key={`icc-${rIdx}`}
                    className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45"
                    style={{ animation: "fly-in-row 520ms ease-out both", animationDelay: `${Math.min(rIdx * 45, 900)}ms` }}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={`icc-${rIdx}-${cIdx}`}
                        className={`px-4 py-3 align-top text-amber-50/95 ${cIdx === 0 || cIdx === 1 ? "whitespace-nowrap" : ""}`}
                      >
                        {cleanMojibake(cell || "") || "�"}
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








