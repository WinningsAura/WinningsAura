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

  const iccDefaultHeader = ["Tournament", "Winner", "Runner Up", "Semi-finalists"];

  const iccTable = useMemo(() => {
    const fallbackHeader = iccDefaultHeader;

    const headerIdx = rows.findIndex((r) => {
      const normalized = r.map((c) => cleanMojibake(c || "").toLowerCase());
      return normalized.some((c) => c === "option") && normalized.some((c) => c.includes("tournament"));
    });

    if (headerIdx === -1) return { header: fallbackHeader, body: [] as string[][] };

    const normalizedHeaderRow = rows[headerIdx].map((c) => cleanMojibake(c || "").toLowerCase());
    const firstColIdx = normalizedHeaderRow.findIndex((c) => c === "option");
    if (firstColIdx === -1) return { header: fallbackHeader, body: [] as string[][] };

    const startIdx = firstColIdx + 1; // drop Option column
    const headerRowRaw = rows[headerIdx].slice(startIdx, startIdx + 4).map((c) => cleanMojibake(c || ""));
    const headerRow = headerRowRaw.map((h, i) => h || fallbackHeader[i]);
    const body: string[][] = [];

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      const option = cleanMojibake(row[firstColIdx] || "");
      if (!option) {
        if (body.length) break;
        continue;
      }
      if (!/^\d+$/.test(option)) continue;
      body.push(row.slice(startIdx, startIdx + 4));
    }

    return { header: headerRow, body };
  }, [rows]);

  const iccHeader = iccTable.header.length ? iccTable.header : iccDefaultHeader;

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
                <details className="group">
                  <summary className="list-none cursor-pointer rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">
                    Menu
                  </summary>
                  <div className="pointer-events-none absolute right-0 top-full z-[60] mt-1 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-open:pointer-events-auto group-open:opacity-100">
                    <Link href="/about-us" className="block w-full rounded-md px-3 py-2 text-amber-100 leading-5 hover:bg-amber-200/10">
                      <span className="flex items-center justify-between"><span>About Us</span><span>{"\uD83D\uDC65"}</span></span>
                    </Link>
                    <Link href="/tennis-stats" className="block w-full rounded-md px-3 py-2 text-amber-100 leading-5 hover:bg-amber-200/10">
                      <span className="flex items-center justify-between"><span>Tennis</span><span>{"\uD83C\uDFBE"}</span></span>
                    </Link>
                    <Link href="/cricket-stats" className="block w-full rounded-md px-3 py-2 text-amber-100 leading-5 hover:bg-amber-200/10">
                      <span className="flex items-center justify-between"><span>Cricket</span><span>{"\uD83C\uDFCF"}</span></span>
                    </Link>
                    <Link href="/golf-stats" className="block w-full rounded-md px-3 py-2 text-amber-100 leading-5 hover:bg-amber-200/10">
                      <span className="flex items-center justify-between"><span>Golf</span><span>{"\u26F3"}</span></span>
                    </Link>
                    <Link href="/contact-us" className="block w-full rounded-md px-3 py-2 text-amber-100 leading-5 hover:bg-amber-200/10">
                      <span className="flex items-center justify-between"><span>Contact Us</span><span>{"\u2709\uFE0F"}</span></span>
                    </Link>
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
          <h2 className="mb-3 break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">Men's Central Contracts and Match Fees</h2>
          <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
            <table className="min-w-full text-left text-sm">
              {contractsTable.header.length > 0 ? (
                <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                  <tr>
                    {contractsTable.header.map((cell, idx) => (
                      <th key={`contracts-${idx}-${cell}`} className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal break-words sm:text-sm sm:whitespace-nowrap">
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
                      <td key={`contracts-${rIdx}-${cIdx}`} className="px-4 py-3 whitespace-normal break-words align-top text-amber-50/95 sm:whitespace-nowrap">
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
          <h2 className="mb-3 break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">ICC Event Prize Money Structures (Men&apos;s &amp; Women&apos;s)</h2>
          <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
            <table className="min-w-full border-separate border-spacing-0 border border-amber-200/35 text-left text-sm">
              <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                <tr>
                  {iccHeader.map((cell, idx) => (
                    <th key={`icc-${idx}-${cell}`} className="border-y border-amber-200/35 px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal break-words sm:text-sm sm:whitespace-nowrap">
                      {cleanMojibake(cell || "") || `Column ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {iccTable.body.map((row, rIdx) => (
                  <tr
                    key={`icc-${rIdx}`}
                    className="odd:bg-black/25 even:bg-black/45"
                    style={{ animation: "fly-in-row 520ms ease-out both", animationDelay: `${Math.min(rIdx * 45, 900)}ms` }}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={`icc-${rIdx}-${cIdx}`}
                        className={`border-t border-amber-200/20 px-4 py-3 align-top text-amber-50/95 ${cIdx === 0 || cIdx === 1 ? "whitespace-normal break-words sm:whitespace-nowrap" : ""}`}
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








