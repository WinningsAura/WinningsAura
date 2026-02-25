"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GolfSection = { title: string; header: string[]; body: string[][] };

function clean(v: string) {
  return (v || "").replace(/[?\uFFFD]/g, "").trim()
}

function parseMoney(value: string) {
  const n = Number((value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function normalizeFinishLabel(value: string) {
  const text = clean(value);
  if (!text) return "";
  return text.replace(/\b(\d+)(st|nd|rd|th)\b/gi, "$1");
}

function formatMoneyText(value: string) {
  const text = clean(value);
  if (!text) return "-";
  if (text === "-") return "-";

  const numeric = text.replace(/[^0-9.,-]/g, "").trim();
  if (!numeric) return text;
  const parsed = Number(numeric.replace(/,/g, ""));
  const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numeric;

  if (text.includes("$")) return `$${formatted}`;
  return formatted;
}

function formatAxisMoney(value: number) {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

function stripAmountFromGolfLabel(label: string) {
  const text = clean(label);
  if (!text) return "";
  return text.replace(/\s*\([^)]*(\$|USD|M|million|purse)[^)]*\)\s*$/i, "").trim();
}

function splitGolfHeader(label: string) {
  const text = stripAmountFromGolfLabel(label);
  if (!text) return ["", ""] as const;

  const words = text.split(/\s+/);
  if (words.length < 3) return [text, ""] as const;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] as const;
}

function buildGolfSections(rows: string[][]): GolfSection[] {
  const starts: Array<{ idx: number; title: string }> = [];
  rows.forEach((r, idx) => {
    const t = clean(r[0]);
    if (t.toLowerCase().startsWith("golf -")) starts.push({ idx, title: t });
  });

  return starts
    .map((s, i) => {
      const sectionRows = rows.slice(s.idx, i + 1 < starts.length ? starts[i + 1].idx : rows.length);
      const headerRel = sectionRows.findIndex((r) => clean(r[0]).toLowerCase() === "finish");
      if (headerRel === -1) return null;

      const header = sectionRows[headerRel].filter((c) => clean(c)).map((c) => stripAmountFromGolfLabel(c));
      const width = header.length;
      const body = sectionRows
        .slice(headerRel + 1)
        .map((r) => r.slice(0, width))
        .filter((r) => clean(r[0]))
        .filter((r) => !clean(r[0]).startsWith("�"));

      if (!header.length || !body.length) return null;
      return { title: s.title, header, body };
    })
    .filter(Boolean) as GolfSection[];
}

type GolfEvent = "Golf Majors" | "Golf Non Majors";

function getGolfEventFromTitle(title: string): GolfEvent {
  const t = clean(title).toLowerCase();
  return t.includes("non majors") ? "Golf Non Majors" : "Golf Majors";
}

function getGolfCategoryDisplayTitle(title: string) {
  const text = clean(title).replace(/[?\uFFFD]/g, "");
  if (!text) return "";

  const t = text.toLowerCase();
  if (/\bwomen\b/.test(t)) return "Women";
  if (/\bmen\b/.test(t)) return "Men";
  if (t.includes("non majors")) return "Non - Majors";
  if (t.includes("majors")) return "Majors";

  return text.replace(/^golf\s*-\s*/i, "").trim();
}

function orderGolfSectionsForDisplay(sections: GolfSection[]) {
  return [...sections].sort((a, b) => {
    const rank = (title: string) => {
      const label = getGolfCategoryDisplayTitle(title);
      if (label === "Men") return 0;
      if (label === "Women") return 1;
      return 2;
    };

    return rank(a.title) - rank(b.title);
  });
}

export default function GolfStatsPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GolfEvent>("Golf Majors");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedFinish, setSelectedFinish] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent("Golf")}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch golf data");
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

  const sections = useMemo(() => buildGolfSections(rows), [rows]);

  const filteredSections = useMemo(
    () => orderGolfSectionsForDisplay(sections.filter((s) => getGolfEventFromTitle(s.title) === selectedEvent)),
    [sections, selectedEvent],
  );

  const activeSection = useMemo(
    () => filteredSections.find((s) => s.title === selectedSection) || filteredSections[0] || null,
    [filteredSections, selectedSection],
  );

  useEffect(() => {
    if (!filteredSections.length) return;
    if (!filteredSections.some((s) => s.title === selectedSection)) setSelectedSection(filteredSections[0].title);
  }, [filteredSections, selectedSection]);

  const finishes = useMemo(() => (activeSection ? activeSection.body.map((r) => r[0]).filter(Boolean) : []), [activeSection]);

  useEffect(() => {
    if (!finishes.length) return;
    if (!selectedFinish || !finishes.includes(selectedFinish)) setSelectedFinish(finishes[0]);
  }, [finishes, selectedFinish]);

  const chartData = useMemo(() => {
    if (!activeSection) return [] as { label: string; raw: string; value: number }[];
    const row = activeSection.body.find((r) => r[0] === selectedFinish);
    if (!row) return [];

    return activeSection.header.slice(1).map((label, idx) => {
      const raw = row[idx + 1] || "";
      const value = parseMoney(raw);
      return { label, raw, value: Number.isNaN(value) ? 0 : value };
    });
  }, [activeSection, selectedFinish]);

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1020_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-6xl rounded-2xl bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1020_45%,_#05070f_100%)] p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <section className="relative mt-2 overflow-hidden rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: "url('/golf-aura-max-2026.svg')" }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-900/45 via-black/45 to-black/70" />

          <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
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

          <div className="relative z-10">
            <h1 className="break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:text-4xl">Golf Winnings</h1>

            <div className="mt-5 max-w-md">
            <label className="mb-2 block text-sm font-semibold text-amber-100/90">Golf Events</label>
            <select
              className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-sm text-amber-100 outline-none transition focus:border-amber-200 sm:text-base"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as GolfEvent)}
            >
              <option className="bg-black" value="Golf Majors">Majors</option>
              <option className="bg-black" value="Golf Non Majors">Non - Majors</option>
            </select>
          </div>

            <div className="mt-5">
              <h2 className="mb-3 break-words text-sm font-semibold leading-tight text-amber-100/90 sm:text-base">Golf Categories</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.title}
                    onClick={() => setSelectedSection(sec.title)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      activeSection?.title === sec.title
                        ? "border-amber-200/90 bg-amber-200/15 ring-2 ring-amber-300/35"
                        : "border-amber-200/30 bg-black/45 hover:border-amber-200/70"
                    }`}
                  >
                    {getGolfCategoryDisplayTitle(sec.title)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {loading ? <p className="mt-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">Error: {error}</p> : null}

        {activeSection ? (
          <>
            <div className="mt-6 overflow-hidden rounded-2xl border border-amber-200/35 bg-slate-900/40 backdrop-blur-sm">
              <table className="w-full table-fixed text-left text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-slate-700/35 to-slate-900/25 text-amber-100">
                  <tr>
                    {activeSection.header.map((cell, idx) => {
                      const [line1, line2] = splitGolfHeader(cell || `Column ${idx + 1}`);
                      return (
                        <th key={`${idx}-${cell}`} className="px-1 py-2 text-center font-semibold align-middle leading-tight sm:px-2">
                          <span className="inline-flex w-full flex-col items-center whitespace-normal break-words text-[11px] sm:text-xs">
                            <span>{line1}</span>
                            {line2 ? <span>{line2}</span> : null}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {activeSection.body.map((row, rIdx) => (
                    <tr key={rIdx} className="border-t border-slate-300/20 odd:bg-slate-900/25 even:bg-slate-800/30">
                      {row.map((cell, cIdx) => (
                        <td key={`${rIdx}-${cIdx}`} className={`px-1 py-2 text-center align-top sm:px-2 ${cIdx === 0 ? "whitespace-nowrap" : "whitespace-normal break-words text-[10px] sm:text-xs"}`}>
                          {cIdx === 0 ? (normalizeFinishLabel(cell) || "-") : formatMoneyText(cell || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <section className="mt-8 rounded-2xl border border-amber-200/35 bg-slate-900/40 p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="break-words text-base font-semibold leading-tight text-amber-100 sm:text-lg">Prize Money Chart</h3>
                <select className="rounded-lg border border-amber-200/40 bg-black/60 px-3 py-2 text-sm" value={selectedFinish} onChange={(e) => setSelectedFinish(e.target.value)}>
                  {finishes.map((f, i) => (
                    <option key={`${f}-${i}`} value={f}>{normalizeFinishLabel(f)}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto rounded-xl border border-amber-200/35 bg-slate-900/35 p-3">
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

                  {/* Axis titles intentionally hidden per UI request */}

                  <polyline fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={linePoints} />
                  {chartData.map((d, i) => {
                    const x = 24 + (chartData.length === 1 ? (680 - 48) / 2 : (i * (680 - 48)) / (chartData.length - 1));
                    const y = 20 + (1 - d.value / maxY) * 180;
                    const [line1, line2] = splitGolfHeader(d.label);
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
                      <div>{formatMoneyText(d.raw || "")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}





