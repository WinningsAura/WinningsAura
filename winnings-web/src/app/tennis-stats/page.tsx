"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const sheetNames = ["Tennis Grand Slams", "ATP and WTA"] as const;
type SheetName = (typeof sheetNames)[number];

const ATP_WTA_SECTION_ORDER = ["masters1000", "wta1000", "atp500events", "2025wta500", "2025atp250", "2025wta250"] as const;
const ATP_WTA_SECTION_HEADINGS = [
  "masters1000eventssingles",
  "atp500eventssingles",
  "wta1000singles",
  "2025wta500prizemoneysingles",
  "2025atp250prizemoneysummarysinglesonly",
  "2025wta250prizemoneysummarysinglesonly",
] as const;

function getAtpWtaSectionKey(normalized: string) {
  return ATP_WTA_SECTION_HEADINGS.find((h) => normalized.includes(h)) || null;
}

function getAtpWtaSectionDisplayTitle(title: string) {
  const n = normalizeRoundLabel(title);
  if (n.includes("masters1000")) return "Masters 1000 Events (Singles - Men)";
  if (n.includes("wta1000")) return "WTA 1000 Events (Singles - Women)";
  if (n.includes("atp500events")) return "ATP 500 Events (Singles- Men)";
  if (n.includes("2025wta500")) return "WTA 500 Events (Singles - Women)";
  if (n.includes("2025atp250")) return "ATP 250 Events (Singles - Men)";
  if (n.includes("2025wta250")) return "WTA 250 Events (Singles - Women)";
  return title;
}
const STORAGE_SHEET_KEY = "tennisStats.selectedSheet";
const STORAGE_CATEGORY_KEY = "tennisStats.selectedCategory";
const STORAGE_ROUND_KEY = "tennisStats.selectedRound";
const STORAGE_SORT_DIR_KEY = "tennisStats.sortDir";
const STORAGE_ATP_WTA_EVENT_KEY = "tennisStats.selectedAtpWtaEvent";

type Category = "Singles" | "Doubles" | "Mixed Doubles";
const categories: Category[] = ["Singles", "Doubles", "Mixed Doubles"];

const categoryImage: Record<Category, string> = {
  Singles: "/card-singles.svg",
  Doubles: "/card-doubles.svg",
  "Mixed Doubles": "/card-mixed.svg",
};

const grandSlamCourts = [
  { name: "Australian Open", colors: "from-sky-500 to-blue-700" },
  { name: "French Open / Roland-Garros", colors: "from-orange-500 to-red-700" },
  { name: "Wimbledon", colors: "from-emerald-500 to-green-800" },
  { name: "US Open", colors: "from-blue-500 via-blue-700 to-emerald-800" },
] as const;

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
  if (!text) return "-";

  const normalizedHeader = (header || "").toLowerCase();

  if (normalizedHeader === "round") {
    return text.replace(/[?\uFFFD]/g, "").trim();
  }

  if (normalizedHeader.includes("australian open")) {
    const numericPart = text.replace(/[^0-9.,-]/g, "").trim();
    if (!numericPart) return text;
    const parsed = Number(numericPart.replace(/,/g, ""));
    const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numericPart;
    return `A$${formatted}`;
  }

  if (normalizedHeader.includes("nottingham open")) {
    if (/^(A\$|\$|€|£)/.test(text)) return text;
    const numericPart = text.replace(/[^0-9.,-]/g, "").trim();
    if (!numericPart) return text;
    const parsed = Number(numericPart.replace(/,/g, ""));
    const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numericPart;
    return `$${formatted}`;
  }

  if (!normalizedHeader.includes("french open") && !normalizedHeader.includes("wimbledon")) {
    return text;
  }

  const numericPart = text.replace(/[^0-9.,-]/g, "").trim();
  if (!numericPart) return text;

  const parsed = Number(numericPart.replace(/,/g, ""));
  const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numericPart;

  if (normalizedHeader.includes("french open")) return `\u20AC${formatted}`;
  if (normalizedHeader.includes("wimbledon")) return `\u00A3${formatted}`;
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
  return (value || "").replace(/[?\uFFFD]/g, "").trim();
}

function cleanTournamentName(value: string) {
  const text = cleanRoundDisplay(value);
  return text.replace(/\s*[-:]?\s*total\s*prize\s*pool.*$/i, "").trim();
}

function cleanHeadingText(value: string) {
  return (value || "").replace(/[?\uFFFD]/g, "").trim();
}

function buildWta250FallbackSection(allRows: string[][]) {
  const title = "2025 WTA 250 Prize Money Summary - Singles Only";

  type Entry = {
    tournament: string;
    currency: string;
    winner: string;
    finalist: string;
    semi: string;
    quarter: string;
    r16: string;
    r32: string;
    q2?: string;
    q1?: string;
  };

  const entries: Entry[] = [];

  allRows.forEach((r) => {
    const t = cleanRoundDisplay(r[0] || "");
    const n = normalizeRoundLabel(t);

    if (t && n !== "tournament") {
      const hasCoreMoney = [r[2], r[3], r[4], r[5], r[6], r[7]].some((v) => /\d/.test(v || ""));
      const looksLikeWta250Tournament = n.includes("nottinghamopen") || n.includes("transylvaniaopen") || n.includes("hobartinternational") || n.includes("hongkongtennisopen") || n.includes("copacolsanitas") || n.includes("wta250");

      if (hasCoreMoney && looksLikeWta250Tournament) {
        entries.push({
          tournament: cleanTournamentName(t),
          currency: r[1] || "",
          winner: r[2] || "",
          finalist: r[3] || "",
          semi: r[4] || "",
          quarter: r[5] || "",
          r16: r[6] || "",
          r32: r[7] || "",
        });
      }
      return;
    }

    if (!t && entries.length) {
      const parsed = parseOtherRoundsText(r[7] || "");
      if (parsed?.key === "q2") entries[entries.length - 1].q2 = parsed.raw;
      if (parsed?.key === "q1") entries[entries.length - 1].q1 = parsed.raw;
    }
  });

  if (!entries.length) return null;

  const tournaments = entries.map((e) => e.tournament);
  const body: string[][] = [
    ["Winner", ...entries.map((e) => cleanMoneyByCurrency(e.winner, e.currency))],
    ["Runner up", ...entries.map((e) => cleanMoneyByCurrency(e.finalist, e.currency))],
    ["Semi Finalists", ...entries.map((e) => cleanMoneyByCurrency(e.semi, e.currency))],
    ["Quarter Finalists", ...entries.map((e) => cleanMoneyByCurrency(e.quarter, e.currency))],
    ["Round of 16", ...entries.map((e) => cleanMoneyByCurrency(e.r16, e.currency))],
    ["Round of 32", ...entries.map((e) => cleanMoneyByCurrency(e.r32, e.currency))],
  ];

  if (entries.some((e) => e.q2)) body.push(["Q2", ...entries.map((e) => cleanMoneyByCurrency(e.q2 || "", e.currency))]);
  if (entries.some((e) => e.q1)) body.push(["Q1", ...entries.map((e) => cleanMoneyByCurrency(e.q1 || "", e.currency))]);

  return { title, header: ["Round", ...tournaments], body };
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
  const colQ2 = idxOf("q2");
  const colQ1 = idxOf("q1");
  const colOtherRounds = idxOf("otherrounds");
  const colR64 = colR64Direct !== -1 ? colR64Direct : colR32R64Combined;

  if (colTournament === -1 || colWinner === -1) return null;

  type TournamentEntry = {
    row: string[];
    currency: string;
    extras: Partial<Record<"r16" | "r32" | "r64" | "q2" | "q1", string>>;
  };

  const entries: TournamentEntry[] = [];

  dataRows.forEach((r) => {
    const t = cleanRoundDisplay(r[colTournament] || "");
    const n = normalizeRoundLabel(t);
    const otherRaw = colOtherRounds !== -1 ? r[colOtherRounds] || "" : "";

    if (t && n !== "tournament" && !n.includes("notes") && !n.includes("source") && !n.includes("whereavailable") && !n.includes("prizemoneysummary")) {
      const hasMoneyLike = [colWinner, colFinalist, colSemi, colQuarter, colR16, colR32, colR64, colQ2, colQ1, colOtherRounds]
        .filter((i) => i !== -1)
        .some((i) => /\d/.test(r[i] || ""));

      if (hasMoneyLike) {
        const entry: TournamentEntry = {
          row: r,
          currency: colCurrency !== -1 ? r[colCurrency] || "" : "",
          extras: {},
        };

        const parsed = parseOtherRoundsText(otherRaw);
        if (parsed) entry.extras[parsed.key] = parsed.raw;

        entries.push(entry);
      }
      return;
    }

    if (!t && otherRaw && entries.length) {
      const parsed = parseOtherRoundsText(otherRaw);
      if (parsed) entries[entries.length - 1].extras[parsed.key] = parsed.raw;
    }
  });

  if (!entries.length) return null;

  let filteredEntries = entries;
  if (normalizeRoundLabel(title).includes("2025atp250")) {
    filteredEntries = entries.filter((e) => {
      const n = normalizeRoundLabel(cleanTournamentName(e.row[colTournament] || ""));
      if (!n) return false;
      if (n.includes("wta250")) return false;
      if (n.includes("nottinghamopen") || n.includes("transylvaniaopen") || n.includes("hobartinternational") || n.includes("hongkongtennisopen") || n.includes("copacolsanitas")) return false;
      return true;
    });
  }

  if (!filteredEntries.length) return null;

  const tournaments = filteredEntries.map((e) => cleanTournamentName(e.row[colTournament] || ""));

  const roundDefs: Array<{ label: string; key: "winner" | "runnerup" | "semi" | "quarter" | "r16" | "r32" | "r64" | "q2" | "q1"; col: number }> = [
    { label: "Winner", key: "winner", col: colWinner },
    { label: "Runner up", key: "runnerup", col: colFinalist },
    { label: "Semi Finalists", key: "semi", col: colSemi },
    { label: "Quarter Finalists", key: "quarter", col: colQuarter },
    { label: "Round of 16", key: "r16", col: colR16 },
    { label: "Round of 32", key: "r32", col: colR32 },
    { label: "Round of 64", key: "r64", col: colR64 },
    { label: "Q2", key: "q2", col: colQ2 },
    { label: "Q1", key: "q1", col: colQ1 },
  ];

  const body = roundDefs
    .map((round) => {
      const vals = filteredEntries.map((entry) => {
        const raw = round.col !== -1 ? entry.row[round.col] || "" : "";

        if ((round.key === "r32" || round.key === "r64") && colR32 !== -1 && colR32 === colR64) {
          const parts = raw.split("/").map((p) => p.trim());
          if (round.key === "r32") return cleanMoneyByCurrency(parts[0] || raw, entry.currency || "");
          if (round.key === "r64") return cleanMoneyByCurrency(parts[1] || "", entry.currency || "");
        }

        const fallback = round.key === "r16" || round.key === "r32" || round.key === "r64" || round.key === "q2" || round.key === "q1"
          ? entry.extras[round.key]
          : "";

        return cleanMoneyByCurrency(raw || fallback || "", entry.currency || "");
      });

      const hasAnyValue = vals.some((v) => v !== "-");
      if (!hasAnyValue) return null;
      return [round.label, ...vals];
    })
    .filter(Boolean) as string[][];

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
  const raw = (value || "").replace(/[?\uFFFD~]/g, "").trim();
  if (!raw) return "-";
  const numPart = raw.replace(/[^0-9.,-]/g, "").trim();
  if (!numPart) return raw;
  const parsed = Number(numPart.replace(/,/g, ""));
  const formatted = Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : numPart;
  const cur = (currency || "").toUpperCase();

  if (cur === "USD") return `$${formatted}`;
  if (cur === "EUR") return `\u20AC${formatted}`;
  if (cur === "GBP") return `\u00A3${formatted}`;

  if (raw.includes("A$")) return `A$${formatted}`;
  if (raw.includes("$")) return `$${formatted}`;
  if (raw.includes("\u20AC")) return `\u20AC${formatted}`;
  if (raw.includes("\u00A3")) return `\u00A3${formatted}`;

  return formatted;
}

function parseOtherRoundsText(value: string): { key: "r16" | "r32" | "r64" | "q2" | "q1"; raw: string } | null {
  const text = cleanRoundDisplay(value);
  const extractAmount = () => {
    const m = text.match(/(?:r16|r32|r64|q2|q1|3rd\s*r|2nd\s*r|1st\s*r)\s*[:\-]?\s*(.+)$/i);
    return (m?.[1] || text).trim();
  };

  const amount = extractAmount();
  if (/^r16\b/i.test(text) || /^3rd\s*r\b/i.test(text)) return { key: "r16", raw: amount };
  if (/^r32\b/i.test(text) || /^2nd\s*r\b/i.test(text)) return { key: "r32", raw: amount };
  if (/^r64\b/i.test(text) || /^1st\s*r\b/i.test(text)) return { key: "r64", raw: amount };
  if (/^q2\b/i.test(text)) return { key: "q2", raw: amount };
  if (/^q1\b/i.test(text)) return { key: "q1", raw: amount };
  return null;
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
  if (text.startsWith("\u20AC")) return "\u20AC";
  if (text.startsWith("\u00A3")) return "\u00A3";
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
  const [selectedAtpWtaEvent, setSelectedAtpWtaEvent] = useState<string>("");

  useEffect(() => {
    try {
      const savedSheet = localStorage.getItem(STORAGE_SHEET_KEY);
      const savedCategory = localStorage.getItem(STORAGE_CATEGORY_KEY);
      const savedRound = localStorage.getItem(STORAGE_ROUND_KEY);
      const savedSortDir = localStorage.getItem(STORAGE_SORT_DIR_KEY);
      const savedAtpWtaEvent = localStorage.getItem(STORAGE_ATP_WTA_EVENT_KEY);

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
      if (savedAtpWtaEvent) {
        setSelectedAtpWtaEvent(savedAtpWtaEvent);
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

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(STORAGE_ATP_WTA_EVENT_KEY, selectedAtpWtaEvent || "");
    } catch {
      // Ignore storage errors.
    }
  }, [selectedAtpWtaEvent, prefsLoaded]);

  const atpWtaSections = useMemo(() => {
    if (selectedSheet !== "ATP and WTA") return [] as Array<{ title: string; header: string[]; body: string[][] }>;

    const starts: Array<{ idx: number; title: string }> = [];
    rows.forEach((r, idx) => {
      const rowText = r.map((c) => cleanRoundDisplay(c || "")).join(" ").trim();
      const n = normalizeRoundLabel(rowText);
      if (getAtpWtaSectionKey(n)) {
        starts.push({ idx, title: rowText || cleanRoundDisplay(r[0] || "") });
      }
    });

    const sections = starts
      .map((s, i) => buildAtpWtaSection(rows, s.idx, i + 1 < starts.length ? starts[i + 1].idx : rows.length, s.title))
      .filter(Boolean) as Array<{ title: string; header: string[]; body: string[][] }>;

    const hasWta250 = sections.some((s) => normalizeRoundLabel(s.title).includes("2025wta250"));
    if (!hasWta250) {
      const fallbackWta250 = buildWta250FallbackSection(rows);
      if (fallbackWta250) sections.push(fallbackWta250);
    }

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

  const selectedAtpWtaSection = useMemo(() => {
    if (selectedSheet !== "ATP and WTA") return null;
    return atpWtaSections.find((s) => s.title === selectedAtpWtaEvent) || atpWtaSections[0] || null;
  }, [selectedSheet, atpWtaSections, selectedAtpWtaEvent]);

  useEffect(() => {
    if (selectedSheet !== "ATP and WTA") return;
    const hasCurrent = atpWtaSections.some((s) => s.title === selectedAtpWtaEvent);
    if (!hasCurrent) setSelectedAtpWtaEvent(atpWtaSections[0]?.title || "");
  }, [selectedSheet, atpWtaSections, selectedAtpWtaEvent]);

  const processed = useMemo(() => {
    if (selectedSheet === "ATP and WTA") {
      if (selectedAtpWtaSection) return { sectionHeader: selectedAtpWtaSection.title, header: selectedAtpWtaSection.header, body: selectedAtpWtaSection.body };
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
  }, [rows, selectedSheet, selectedCategory, selectedAtpWtaSection]);

  const sortedBody = useMemo(() => {
    const copy = [...processed.body];
    if (selectedSheet !== "Tennis Grand Slams") return copy;

    copy.sort((a, b) => {
      const av = a[0] ?? "";
      const bv = b[0] ?? "";
      const cmp = getGrandSlamRoundRank(av) - getGrandSlamRoundRank(bv);
      if (cmp !== 0) return cmp;
      return av.localeCompare(bv);
    });
    return copy;
  }, [processed.body, selectedSheet]);

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
      <main className="relative z-30 mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
          {selectedSheet === "Tennis Grand Slams" ? (
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="grid h-full grid-cols-2 grid-rows-2 lg:grid-cols-4 lg:grid-rows-1">
                {grandSlamCourts.map((court) => (
                  <div key={court.name} className={`relative border border-white/10 bg-gradient-to-br ${court.colors}`}>
                    <div className="absolute inset-3 rounded-md border border-white/25" />
                    <div className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 bg-white/25" />
                    <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-white/20" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-black/45" />
            </div>
          ) : null
          }
          <div className="relative z-10">
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
          <h1 className="mt-2 text-2xl font-bold text-amber-100 sm:text-4xl lg:text-5xl">Tennis Winnings</h1>

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

          {selectedSheet === "Tennis Grand Slams" ? (
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
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {atpWtaSections.map((sec) => (
                <button
                  key={sec.title}
                  onClick={() => setSelectedAtpWtaEvent(sec.title)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedAtpWtaSection?.title === sec.title
                      ? "border-amber-200/90 bg-amber-200/15 ring-2 ring-amber-300/35"
                      : "border-amber-200/30 bg-black/45 hover:border-amber-200/70"
                  }`}
                >
                  {getAtpWtaSectionDisplayTitle(sec.title)}
                </button>
              ))}
            </div>
          )}
          </div>
        </section>

        {loading ? <p className="mb-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mb-4 text-sm text-rose-300">Error: {error}</p> : null}

        {selectedSheet === "ATP and WTA" ? (
          selectedAtpWtaSection ? (
            <div className="space-y-6">
              <section key={selectedAtpWtaSection.title} className="rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
                <h2 className="mb-3 text-lg font-semibold text-amber-100 sm:text-xl">{getAtpWtaSectionDisplayTitle(selectedAtpWtaSection.title)}</h2>
                <div className="overflow-x-auto rounded-xl border border-amber-200/20 bg-black/35 p-2">
                  <table className="w-full table-fixed text-left text-xs sm:text-sm">
                    <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                      <tr>
                        {selectedAtpWtaSection.header.map((cell, idx) => {
                          const [line1, line2] = splitHeaderTwoLines(cleanHeadingText(cell || `Column ${idx + 1}`));
                          return (
                            <th
                              key={`${selectedAtpWtaSection.title}-${idx}`}
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
                      {selectedAtpWtaSection.body.map((row, rIdx) => (
                        <tr key={`${selectedAtpWtaSection.title}-${rIdx}`} className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45">
                          {row.map((cell, cIdx) => (
                            <td
                              key={`${selectedAtpWtaSection.title}-${rIdx}-${cIdx}`}
                              className={`px-2 py-2 text-center align-top text-amber-50/95 ${cIdx === 0 ? "whitespace-normal" : "whitespace-nowrap text-[11px] sm:text-sm"}`}
                            >
                              {formatCurrencyByHeader(selectedAtpWtaSection.header[cIdx] || "", cell || "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="prize-chart" className="rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
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
                      const cleanLabel = cleanHeadingText(d.label);
                      const symbol = currencySymbolFromFormatted(formatCurrencyByHeader(cleanLabel, d.raw || ""));
                      const labelText = `${cleanLabel}${symbol ? ` (${symbol})` : ""}`;
                      const [line1, line2] = splitHeaderTwoLines(labelText);
                      const placeBelow = i % 2 === 1;
                      const baseY = placeBelow ? Math.min(210, y + 14) : Math.max(14, y - 14);
                      return (
                        <g key={`${d.label}-${i}`}>
                          <circle cx={x} cy={y} r="4" fill="#FDE68A" />
                          <text x={x} y={baseY} textAnchor="middle" fontSize="10" fill="rgba(253,230,138,0.95)">
                            <tspan x={x} dy="0">{line1}</tspan>
                            {line2 ? <tspan x={x} dy="10">{line2}</tspan> : null}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {chartData.map((d, i) => (
                      <div key={`${d.label}-${i}`} className="rounded-lg border border-amber-200/20 px-3 py-2 text-xs text-amber-100/90">
                        <div className="font-semibold whitespace-nowrap">{cleanHeadingText(d.label)}</div>
                        <div>{formatCurrencyByHeader(cleanHeadingText(d.label), d.raw || "")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          ) : null
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
                        const [line1, line2] = splitHeaderTwoLines(cleanHeadingText(cell || `Column ${idx + 1}`));
                        const isRoundCol = idx === 0;
                        return (
                          <th key={`${idx}-${cell}`} className="px-2 py-2 text-center font-semibold tracking-wide align-middle">
                            {isRoundCol ? (
                              <button onClick={() => onSort(idx)} className="inline-flex flex-col items-center leading-tight hover:text-white">
                                <span>{line1}</span>
                                {line2 ? <span>{line2}</span> : null}
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
                      <p className="text-xs text-amber-200/85">{cleanHeadingText(h || `Column ${cIdx + 1}`)}</p>
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
                          {`${cleanHeadingText(d.label)}${currencySymbolFromFormatted(formatCurrencyByHeader(cleanHeadingText(d.label), d.raw || "")) ? ` (${currencySymbolFromFormatted(formatCurrencyByHeader(cleanHeadingText(d.label), d.raw || ""))})` : ""}`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {chartData.map((d, i) => (
                    <div key={`${d.label}-${i}`} className="rounded-lg border border-amber-200/20 px-3 py-2 text-xs text-amber-100/90">
                      <div className="font-semibold whitespace-nowrap">{cleanHeadingText(d.label)}</div>
                      <div>{formatCurrencyByHeader(cleanHeadingText(d.label), d.raw || "")}</div>
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











