"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const sheetNames = ["Tennis Grand Slams", "ATP and WTA"] as const;
type SheetName = (typeof sheetNames)[number];

const ATP_WTA_SECTION_ORDER = ["masters1000", "atp500events", "wta1000", "2025wta500", "2025atp250"] as const;
const STORAGE_SHEET_KEY = "tennisStats.selectedSheet";
const STORAGE_CATEGORY_KEY = "tennisStats.selectedCategory";
const STORAGE_ROUND_KEY = "tennisStats.selectedRound";
const STORAGE_SORT_DIR_KEY = "tennisStats.sortDir";

type Category = "Singles" | "Doubles" | "Mixed Doubles";
const categories: Category[] = ["Singles", "Doubles", "Mixed Doubles"];

const categoryImage: Record<Category, string> = {
  Singles: "/card-singles.svg",
  Doubles: "/card-doubles.svg",
  "Mixed Doubles": "/card-mixed.svg",
};

function findRowIndex(rows: string[][], text: string) {
  return rows.findIndex((r) => (r[0] || "").toLowerCase().includes(text.toLowerCase()));
}

function sliceCategoryRows(rows: string[][], category: Category) {
  if (rows.length === 0) return rows;

  const singlesStart = findRowIndex(rows, "Singles Mens and Womens");
  const doublesStart = findRowIndex(rows, "Doubles Men's and Women's");
  const mixedStart = findRowIndex(rows, "Mixed Doubles");

  if (singlesStart === -1 && doublesStart === -1 && mixedStart === -1) return rows;

  if (category === "Singles" && singlesStart !== -1) {
    const end = doublesStart !== -1 ? doublesStart : rows.length;
    return rows.slice(singlesStart, end);
  }

  if (category === "Doubles" && doublesStart !== -1) {
    const end = mixedStart !== -1 ? mixedStart : rows.length;
    return rows.slice(doublesStart, end);
  }

  if (category === "Mixed Doubles" && mixedStart !== -1) {
    return rows.slice(mixedStart);
  }

  return rows;
}

function dropFirstColumn(rows: string[][]) {
  return rows.map((r) => (r.length > 1 ? r.slice(1) : r));
}

function toNumber(value: string) {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function formatCurrencyByHeader(header: string, value: string) {
  const text = (value || "").trim();
  if (!text) return "—";

  const normalizedHeader = (header || "").toLowerCase();

  // Clean odd characters in Round labels (including replacement-char artifacts)
  if (normalizedHeader === "round") {
    return text.replace(/[?�\uFFFD]/g, "").trim();
  }

  // Australian Open: always show A$ prefix.
  if (normalizedHeader.includes("australian open")) {
    const numericPart = text.replace(/[^0-9.,-]/g, "").trim();
    if (!numericPart) return text;
    const parsed = Number(numericPart.replace(/,/g, ""));
    const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numericPart;
    return `A$${formatted}`;
  }

  if (!normalizedHeader.includes("french open") && !normalizedHeader.includes("wimbledon")) {
    return text;
  }

  const numericPart = text.replace(/[^0-9.,-]/g, "").trim();
  if (!numericPart) return text;

  // Keep consistent number grouping (commas) across all currency columns.
  const parsed = Number(numericPart.replace(/,/g, ""));
  const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numericPart;

  if (normalizedHeader.includes("french open")) return `€${formatted}`;
  if (normalizedHeader.includes("wimbledon")) return `£${formatted}`;
  return text;
}

function splitHeaderTwoLines(label: string) {
  const clean = (label || "").trim();
  if (!clean) return ["", ""] as const;
  const words = clean.split(/\s+/);
  if (words.length < 2) return [clean, ""] as const;

  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] as const;
}

function cleanRoundDisplay(value: string) {
  return (value || "").replace(/[?�\uFFFD]/g, "").trim();
}

function cleanTournamentName(value: string) {
  const text = cleanRoundDisplay(value);
  return text.replace(/\s*[-–—:]?\s*total\s*prize\s*pool.*$/i, "").trim();
}

function buildAtpWtaSection(allRows: string[][], start: number, end: number, title: string) {
  const sectionRows = allRows.slice(start, end);
  const headerRowRel = sectionRows.findIndex((r) => normalizeRoundLabel(r[0] || "") === "tournament");
  if (headerRowRel === -1) return null;

  const hdr = sectionRows[headerRowRel] ?? [];
  const dataRows = sectionRows.slice(headerRowRel + 1);

  const idxOf = (wanted: string) => hdr.findIndex((h) => normalizeRoundLabel(h).includes(wanted));
  const colTournament = idxOf("tournament");
  const colCurrency = idxOf("currency");
  const colWinner = idxOf("winner");
  const colFinalist = idxOf("finalist");
  const colSemi = idxOf("semifinal");
  const colQuarter = idxOf("quarterfinal");
  const colR16 = idxOf("r16");
  const colR32 = idxOf("r32");
  const colR64Direct = idxOf("r64");
  const colR32R64Combined = idxOf("r32r64");
  const isMastersSection = normalizeRoundLabel(title).includes("masters1000");
  const colR64 = colR64Direct !== -1 ? colR64Direct : (isMastersSection ? colR32R64Combined : -1);

  // If R32 and R64 resolve to the same combined column (e.g., "R32 / R64"),
  // split values at render-time so they are not duplicated.
  const sameR32R64Column = colR32 !== -1 && colR32 === colR64;

  if (colTournament === -1 || colWinner === -1) return null;

  const tournamentRows = dataRows.filter((r) => {
    const t = cleanRoundDisplay(r[colTournament] || "");
    if (!t) return false;
    const n = normalizeRoundLabel(t);
    if (n === "tournament") return false;
    if (n.includes("notes") || n.includes("source") || n.includes("whereavailable") || n.includes("prizemoneysummary")) return false;
    const hasMoneyLike = [colWinner, colFinalist, colSemi, colQuarter, colR16, colR32]
      .filter((i) => i !== -1)
      .some((i) => /\d/.test(r[i] || ""));
    return hasMoneyLike;
  });

  if (!tournamentRows.length) return null;

  const tournaments = tournamentRows.map((r) => cleanTournamentName(r[colTournament] || ""));
  const currencies = tournamentRows.map((r) => (colCurrency !== -1 ? (r[colCurrency] || "") : ""));

  const roundDefs: Array<{ label: string; col: number }> = [
    { label: "Winner", col: colWinner },
    { label: "Runner up", col: colFinalist },
    { label: "Semi Finalists", col: colSemi },
    { label: "Quarter Finalists", col: colQuarter },
    { label: "Round of 16", col: colR16 },
    { label: "Round of 32", col: colR32 },
    { label: "Round of 64", col: colR64 },
  ].filter((x) => x.col !== -1);

  const body = roundDefs.map((round) => {
    const vals = tournamentRows.map((r, i) => {
      const raw = r[round.col] || "";

      if (sameR32R64Column) {
        const parts = raw.split("/").map((p) => p.trim());
        if (normalizeRoundLabel(round.label) === "roundof32") {
          return cleanMoneyByCurrency(parts[0] || raw, currencies[i] || "");
        }
        if (normalizeRoundLabel(round.label) === "roundof64") {
          return cleanMoneyByCurrency(parts[1] || "", currencies[i] || "");
        }
      }

      return cleanMoneyByCurrency(raw, currencies[i] || "");
    });
    return [round.label, ...vals];
  });

  return { title, header: ["Round", ...tournaments], body };
}

function normalizeRoundLabel(value: string) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getGrandSlamRoundRank(value: string) {
  const v = normalizeRoundLabel(value);

  // Canonical order:
  // Winner, Runner up, Semifinalists, Quarterfinalists, Round of 16, Third Round, Second Round, First Round, Q3, Q2, Q1
  if (v.includes("winner")) return 0;
  if (v.includes("runnerup") || (v.includes("runner") && v.includes("up")) || v === "final") return 1;
  if (v.includes("semifinal") || v.includes("semifinalist") || v.includes("semif") || v.includes("semi") || v === "sf") return 2;
  if (v.includes("quarterfinal") || v.includes("quarterfinalist") || v.includes("quarter") || v === "qf") return 3;

  if (v.includes("roundof16") || v === "round16" || v.includes("r16")) return 4;

  // Different sheets use either Round-of naming or ordinal round names.
  if (v.includes("roundof32") || v === "round32" || v.includes("r32") || v.includes("thirdround")) return 5;
  if (v.includes("roundof64") || v === "round64" || v.includes("r64") || v.includes("secondround")) return 6;
  if (v.includes("firstround") || v.includes("roundof128") || v === "round128" || v.includes("r128") || v === "round1" || v.includes("r1")) return 7;

  if (v === "q3" || v.includes("qualifying3") || v.includes("qualifyinground3") || (v.includes("qualifying") && v.includes("3"))) return 8;
  if (v === "q2" || v.includes("qualifying2") || v.includes("qualifyinground2") || (v.includes("qualifying") && v.includes("2"))) return 9;
  if (v === "q1" || v.includes("qualifying1") || v.includes("qualifyinground1") || (v.includes("qualifying") && v.includes("1"))) return 10;

  return Number.MAX_SAFE_INTEGER;
}

function cleanMoneyByCurrency(value: string, currency: string) {
  const raw = (value || "").replace(/[?�\uFFFD~]/g, "").trim();
  if (!raw) return "—";
  const numPart = raw.replace(/[^0-9.,-]/g, "").trim();
  if (!numPart) return raw;
  const parsed = Number(numPart.replace(/,/g, ""));
  const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numPart;
  const cur = (currency || "").toUpperCase();
  if (cur === "USD") return `$${formatted}`;
  if (cur === "EUR") return `€${formatted}`;
  if (cur === "GBP") return `£${formatted}`;
  return formatted;
}

function formatAxisMoney(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function currencySymbolFromFormatted(value: string) {
  const text = (value || "").trim();
  if (!text) return "";
  if (text.startsWith("A$")) return "A$";
  if (text.startsWith("$")) return "$";
  if (text.startsWith("€")) return "€";
  if (text.startsWith("£")) return "£";
  return "";
}

export default function TennisStatsPage() {
  const [selectedSheet, setSelectedSheet] = useState<SheetName>("Tennis Grand Slams");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Singles");
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<number>(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedRound, setSelectedRound] = useState<string>("");

  useEffect(() => {
    try {
      const savedSheet = localStorage.getItem(STORAGE_SHEET_KEY);
      const savedCategory = localStorage.getItem(STORAGE_CATEGORY_KEY);
      const savedRound = localStorage.getItem(STORAGE_ROUND_KEY);
      const savedSortDir = localStorage.getItem(STORAGE_SORT_DIR_KEY);

      if (savedSheet && (sheetNames as readonly string[]).includes(savedSheet)) {
        setSelectedSheet(savedSheet as SheetName);
      }
      if (savedCategory && (categories as readonly string[]).includes(savedCategory)) {
        setSelectedCategory(savedCategory as Category);
      }
      if (savedRound) {
        setSelectedRound(savedRound);
      }
      if (savedSortDir === "asc" || savedSortDir === "desc") {
        setSortDir(savedSortDir);
      }
    } catch {
      // Ignore storage errors and continue with defaults.
    } finally {
      setPrefsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent(selectedSheet)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch sheet data");
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
  }, [selectedSheet, prefsLoaded]);
  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(STORAGE_SHEET_KEY, selectedSheet);
    } catch {
      // Ignore storage errors.
    }
  }, [selectedSheet, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(STORAGE_CATEGORY_KEY, selectedCategory);
    } catch {
      // Ignore storage errors.
    }
  }, [selectedCategory, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(STORAGE_ROUND_KEY, selectedRound || "");
    } catch {
      // Ignore storage errors.
    }
  }, [selectedRound, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(STORAGE_SORT_DIR_KEY, sortDir);
    } catch {
      // Ignore storage errors.
    }
  }, [sortDir, prefsLoaded]);

  const atpWtaSections = useMemo(() => {
    if (selectedSheet !== "ATP and WTA") return [] as Array<{ title: string; header: string[]; body: string[][] }>;

    const starts: Array<{ idx: number; title: string }> = [];
    rows.forEach((r, idx) => {
      const t = cleanRoundDisplay(r[0] || "");
      const n = normalizeRoundLabel(t);
      if (
        n.includes("masters1000") ||
        n.includes("atp500events") ||
        n.includes("wta1000") ||
        n.includes("2025wta500") ||
        n.includes("2025atp250")
      ) {
        starts.push({ idx, title: t });
      }
    });

    const sections = starts
      .map((s, i) => buildAtpWtaSection(rows, s.idx, i + 1 < starts.length ? starts[i + 1].idx : rows.length, s.title))
      .filter(Boolean) as Array<{ title: string; header: string[]; body: string[][] }>;

    sections.sort((a, b) => {
      const aKey = normalizeRoundLabel(a.title);
      const bKey = normalizeRoundLabel(b.title);
      const aRank = ATP_WTA_SECTION_ORDER.findIndex((k) => aKey.includes(k));
      const bRank = ATP_WTA_SECTION_ORDER.findIndex((k) => bKey.includes(k));
      const ra = aRank === -1 ? Number.MAX_SAFE_INTEGER : aRank;
      const rb = bRank === -1 ? Number.MAX_SAFE_INTEGER : bRank;
      if (ra !== rb) return ra - rb;
      return a.title.localeCompare(b.title);
    });

    return sections;
  }, [rows, selectedSheet]);

  const processed = useMemo(() => {
    if (selectedSheet === "ATP and WTA") {
      const first = atpWtaSections[0];
      if (first) return { sectionHeader: first.title, header: first.header, body: first.body };
      return { sectionHeader: selectedSheet, header: [], body: [] as string[][] };
    }

    const sectionRows = sliceCategoryRows(rows, selectedCategory);
    if (sectionRows.length === 0) return { sectionHeader: selectedCategory, header: [], body: [] as string[][] };

    const withoutCategoryColumn = dropFirstColumn(sectionRows);
    const body = withoutCategoryColumn.length > 1 ? withoutCategoryColumn.slice(1) : [];

    // For Tennis Grand Slams, show only: Round + 4 slam columns.
    // The source sheet has messy multi-row headers, so we use stable column positions
    // from the prize rows and apply fixed display headers.
    const slamHeader = ["Round", "Australian Open", "US Open", "French Open", "Wimbledon"];
    const roundLabels = new Set([
      "winner",
      "runner-up",
      "semifinalists",
      "quarterfinalists",
      "round of 16",
      "round of 32",
      "round of 64",
      "round of 128",
      "third round",
      "second round",
      "first round",
      "q3",
      "q2",
      "q1",
      "qualifying round 3",
      "qualifying round 2",
      "qualifying round 1",
      "qualifying 3",
      "qualifying 2",
      "qualifying 1",
    ]);

    const startIdx = body.findIndex((r) => roundLabels.has((r[0] || "").trim().toLowerCase()));
    const prizeRows = (startIdx >= 0 ? body.slice(startIdx) : body)
      .filter((r) => (r[0] || "").trim().length > 0)
      .map((r) => [r[0] || "", r[1] || "", r[2] || "", r[3] || "", r[4] || ""])
      .filter((r) => getGrandSlamRoundRank(r[0] || "") !== Number.MAX_SAFE_INTEGER);

    return { sectionHeader: selectedCategory, header: slamHeader, body: prizeRows };
  }, [rows, selectedSheet, selectedCategory, atpWtaSections]);

  const sortedBody = useMemo(() => {
    const copy = [...processed.body];
    copy.sort((a, b) => {
      const av = a[0] ?? "";
      const bv = b[0] ?? "";
      const cmp = getGrandSlamRoundRank(av) - getGrandSlamRoundRank(bv);
      if (cmp !== 0) return cmp;
      return av.localeCompare(bv);
    });
    return copy;
  }, [processed.body]);

  const rounds = useMemo(() => sortedBody.map((r) => r[0]).filter(Boolean), [sortedBody]);

  useEffect(() => {
    if (!selectedRound && rounds.length) setSelectedRound(rounds[0]);
    if (selectedRound && !rounds.includes(selectedRound)) setSelectedRound(rounds[0] || "");
  }, [rounds, selectedRound]);

  const chartData = useMemo(() => {
    const targetRow = sortedBody.find((r) => r[0] === selectedRound);
    if (!targetRow || processed.header.length <= 1) return [] as { label: string; value: number; raw: string }[];

    return processed.header.slice(1).map((label, idx) => {
      const raw = targetRow[idx + 1] || "";
      const value = toNumber(raw);
      return { label, value: Number.isNaN(value) ? 0 : value, raw };
    });
  }, [sortedBody, selectedRound, processed.header]);

  const maxChart = useMemo(() => Math.max(1, ...chartData.map((d) => d.value)), [chartData]);

  const yTicks = useMemo(() => {
    const steps = 5;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = (maxChart * (steps - i)) / steps;
      const y = 20 + (i * (220 - 40)) / steps;
      return { value, y };
    });
  }, [maxChart]);

  const linePoints = useMemo(() => {
    if (chartData.length === 0) return "";
    const width = 680;
    const height = 220;
    const padX = 24;
    const padY = 20;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    return chartData
      .map((d, i) => {
        const x = padX + (chartData.length === 1 ? plotW / 2 : (i * plotW) / (chartData.length - 1));
        const y = padY + (1 - d.value / maxChart) * plotH;
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData, maxChart]);

  function onSort(colIdx: number) {
    if (colIdx === 0) {
      setSortCol(0);
      setSortDir("asc");
      return;
    }

    if (sortCol === colIdx) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(colIdx);
      setSortDir("asc");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] text-[#F5E6B3]">
      <main className="relative z-10 mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="mb-6 rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300/90 sm:text-sm">Tennis Prize Money Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-amber-100 sm:text-4xl lg:text-5xl">Tennis Stats</h1>

          <div className="mt-5 max-w-md">
            <label className="mb-2 block text-sm font-semibold text-amber-100/90">Tennis Events</label>
            <select
              className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-sm text-amber-100 outline-none transition focus:border-amber-200 sm:text-base"
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value as SheetName)}
            >
              {sheetNames.map((name) => (
                <option className="bg-black" key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`group overflow-hidden rounded-xl border text-left transition sm:rounded-2xl ${
                  selectedCategory === c
                    ? "border-amber-200/90 ring-2 ring-amber-300/35"
                    : "border-amber-200/30 hover:border-amber-200/70"
                }`}
              >
                <div className="relative h-24 w-full sm:h-28">
                  <Image src={categoryImage[c]} alt={`${c} category`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30" />
                  <p className="absolute bottom-2 left-3 text-sm font-semibold text-amber-100 sm:text-base">{c}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {loading ? <p className="mb-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mb-4 text-sm text-rose-300">Error: {error}</p> : null}

        {selectedSheet === "ATP and WTA" ? (
          <div className="space-y-6">
            {atpWtaSections.map((sec) => (
              <section key={sec.title} className="rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
                <h2 className="mb-3 text-lg font-semibold text-amber-100 sm:text-xl">{sec.title}</h2>
                <div className="overflow-x-auto rounded-xl border border-amber-200/20 bg-black/35 p-2">
                  <table className="w-full table-fixed text-left text-xs sm:text-sm">
                    <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                      <tr>
                        {sec.header.map((cell, idx) => {
                          const [line1, line2] = splitHeaderTwoLines(cell || `Column ${idx + 1}`);
                          return (
                            <th
                              key={`${sec.title}-${idx}`}
                              className={`px-2 py-2 text-center font-semibold align-middle ${idx === 0 ? "w-32" : ""}`}
                            >
                              <span className="inline-flex flex-col items-center leading-tight">
                                <span>{line1}</span>
                                {line2 ? <span>{line2}</span> : null}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.body.map((row, rIdx) => (
                        <tr key={`${sec.title}-${rIdx}`} className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45">
                          {row.map((cell, cIdx) => (
                            <td
                              key={`${sec.title}-${rIdx}-${cIdx}`}
                              className={`px-2 py-2 text-center align-top text-amber-50/95 ${cIdx === 0 ? "whitespace-normal" : "whitespace-nowrap text-[11px] sm:text-sm"}`}
                            >
                              {formatCurrencyByHeader(sec.header[cIdx] || "", cell || "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-amber-100 sm:text-xl">{processed.sectionHeader}</h2>
              <a href="#prize-chart" className="inline-flex rounded-md border border-amber-200/40 p-1 hover:border-amber-200/80" aria-label="Open prize chart">
                <Image src="/graph-line-icon.svg" alt="Open line graph" width={18} height={18} />
              </a>
            </div>

            <div className="hidden rounded-2xl border border-amber-200/35 bg-black/55 shadow-[0_0_40px_rgba(245,185,59,0.08)] backdrop-blur-sm md:block">
              <table className="w-full table-fixed text-left text-xs sm:text-sm">
                {processed.header.length > 0 ? (
                  <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                    <tr>
                      {processed.header.map((cell, idx) => {
                        const [line1, line2] = splitHeaderTwoLines(cell || `Column ${idx + 1}`);
                        const isRoundCol = idx === 0;
                        return (
                          <th key={`${idx}-${cell}`} className="px-2 py-2 text-center font-semibold tracking-wide align-middle">
                            {isRoundCol ? (
                              <button onClick={() => onSort(idx)} className="inline-flex flex-col items-center leading-tight hover:text-white">
                                <span>{line1}</span>
                                {line2 ? <span>{line2}</span> : null}
                                <span className="mt-1 text-[10px]">▲</span>
                              </button>
                            ) : (
                              <span className="inline-flex flex-col items-center leading-tight">
                                <span>{line1}</span>
                                {line2 ? <span>{line2}</span> : null}
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {sortedBody.map((row, rIdx) => (
                    <tr key={rIdx} className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45 hover:bg-amber-200/10">
                      {row.map((cell, cIdx) => (
                        <td key={`${rIdx}-${cIdx}`} className="px-2 py-2 text-center align-top break-words text-amber-50/95">
                          {formatCurrencyByHeader(processed.header[cIdx] || "", cell || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {sortedBody.map((row, rIdx) => (
                <div key={rIdx} className="rounded-xl border border-amber-200/30 bg-black/55 p-3">
                  {processed.header.map((h, cIdx) => (
                    <div key={`${rIdx}-${cIdx}`} className="flex items-start justify-between gap-3 border-b border-amber-200/10 py-1.5 last:border-b-0">
                      <p className="text-xs text-amber-200/85">{h || `Column ${cIdx + 1}`}</p>
                      <p className="text-right text-sm text-amber-50/95">{formatCurrencyByHeader(h || "", row[cIdx] || "")}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <section id="prize-chart" className="mt-8 rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-amber-100">Prize Money Chart</h3>
                <select
                  className="rounded-lg border border-amber-200/40 bg-black/60 px-3 py-2 text-sm"
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                >
                  {rounds.map((r, i) => (
                    <option key={`${r}-${i}`} value={r}>
                      {cleanRoundDisplay(r)}
                    </option>
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
                    const y = 20 + (1 - d.value / maxChart) * (220 - 40);
                    const labelY = Math.max(12, y - 8);
                    return (
                      <g key={`${d.label}-${i}`}>
                        <circle cx={x} cy={y} r="4" fill="#FDE68A" />
                        <text x={x} y={labelY} textAnchor="middle" fontSize="10" fill="rgba(253,230,138,0.95)">
                          {`${d.label}${currencySymbolFromFormatted(formatCurrencyByHeader(d.label, d.raw || "")) ? ` (${currencySymbolFromFormatted(formatCurrencyByHeader(d.label, d.raw || ""))})` : ""}`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {chartData.map((d, i) => (
                    <div key={`${d.label}-${i}`} className="rounded-lg border border-amber-200/20 px-3 py-2 text-xs text-amber-100/90">
                      <div className="font-semibold whitespace-nowrap">{d.label}</div>
                      <div>{formatCurrencyByHeader(d.label, d.raw || "")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
