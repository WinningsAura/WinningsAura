"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Position = "Winner" | "Runner-up";
type GenderFilter = "All" | "Men" | "Women";

type SportPoint = {
  sport: string;
  event: string;
  amount: number;
  display: string;
};

type SportEventValue = {
  event: string;
  raw: string;
};

const positionOptions: Position[] = ["Winner", "Runner-up"];
const genderOptions: GenderFilter[] = ["All", "Men", "Women"];

const sportSheets = [
  { sport: "Tennis", sheet: "Tennis Grand Slams" },
  { sport: "Badminton", sheet: "Badminton" },
  { sport: "Cricket", sheet: "Cricket" },
  { sport: "Golf", sheet: "Golf" },
  { sport: "Chess", sheet: "Chess" },
  { sport: "Soccer", sheet: "Soccer" },
] as const;

const SPORT_EVENT_OPTIONS: Record<string, string[]> = {
  Tennis: ["Australian Open", "US Open", "French Open", "Wimbledon"],
  Badminton: [],
  Cricket: ["ODI World Cup", "Champions Trophy", "T20 World Cup", "WTC Final", "Women’s T20 World Cup", "Women’s ODI World Cup"],
  Golf: ["Masters", "U.S. Open", "PGA Championship", "The Open", "U.S. Women’s Open", "KPMG Women’s PGA", "Chevron Championship", "AIG Women’s Open", "Amundi Evian Championship"],
  Chess: ["World Chess Championship", "Candidates", "Tata Steel", "Norway Chess", "Sinquefield Cup", "Women’s World Championship", "Women’s Candidates"],
  Soccer: ["FIFA World Cup", "FIFA Club World Cup"],
};

function clean(value: string) {
  return (value || "").replace(/[\uFEFF\uFFFD]/g, "").trim();
}

function toNumber(raw: string) {
  const text = clean(raw);
  if (!text) return NaN;

  const rangeMatch = text.match(/(\d[\d,]*(?:\.\d+)?)\s*[–—-]\s*(\d[\d,]*(?:\.\d+)?)/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1].replace(/,/g, ""));
    const b = Number(rangeMatch[2].replace(/,/g, ""));
    if (Number.isFinite(a) && Number.isFinite(b)) return Math.max(a, b);
  }

  const withSuffix = text.match(/(\d[\d,]*(?:\.\d+)?)\s*([kKmMbB])\b/);
  if (withSuffix) {
    const base = Number(withSuffix[1].replace(/,/g, ""));
    const mult = withSuffix[2].toLowerCase() === "b" ? 1_000_000_000 : withSuffix[2].toLowerCase() === "m" ? 1_000_000 : 1_000;
    return Number.isFinite(base) ? base * mult : NaN;
  }

  const numeric = text.replace(/[^0-9.-]/g, "");
  const n = Number(numeric);
  return Number.isFinite(n) ? n : NaN;
}

function formatCompact(value: number) {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatDisplayWithCurrency(raw: string, amount: number) {
  const text = clean(raw);

  const currencyMatch = text.match(/\b(USD|EUR|GBP|INR|AUD|CAD|JPY|CNY|CHF|AED|SAR|PKR|BDT|NPR|ZAR|SGD|HKD|NZD|KRW)\b/i);
  const symbolMatch = text.match(/[\$€£₹¥₩]/);
  const currency = currencyMatch?.[1]?.toUpperCase() || symbolMatch?.[0] || "$";

  const formattedAmount = Number.isFinite(amount)
    ? Math.round(amount).toLocaleString("en-US")
    : "0";

  if (/^[\$€£₹¥₩]$/.test(currency)) {
    return `${currency}${formattedAmount}`;
  }

  return `${currency} ${formattedAmount}`;
}

function findBest(values: SportEventValue[]) {
  const candidates = values
    .map((v) => ({ ...v, amount: toNumber(v.raw) }))
    .filter((v) => Number.isFinite(v.amount));
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.amount - a.amount);
  return candidates[0];
}

function selectEventOrBest(values: SportEventValue[], selectedEvent?: string) {
  const scoped = selectedEvent && selectedEvent !== "All Events" ? values.filter((v) => v.event === selectedEvent) : values;
  return findBest(scoped);
}

function extractTennis(rows: string[][], position: Position, gender: GenderFilter, selectedEvent?: string): SportPoint | null {
  // Product rule: Grand Slam comparison should treat values as Men's reference.
  // So Women and All both use the same Grand Slam row values.
  const target = position === "Winner" ? "winner" : "runner";
  const row = rows.find((r) => clean(r[1] || "").toLowerCase().includes(target));
  if (!row) return null;

  const events = [
    { event: "Australian Open", raw: row[2] || "" },
    { event: "US Open", raw: row[3] || "" },
    { event: "French Open", raw: row[4] || "" },
    { event: "Wimbledon", raw: row[5] || "" },
  ];

  const best = selectEventOrBest(events, selectedEvent);
  if (!best) return null;
  return { sport: "Tennis", event: best.event, amount: best.amount, display: clean(best.raw) };
}

function extractBadminton(rows: string[][], position: Position, gender: GenderFilter, selectedEvent?: string): SportPoint | null {
  if (!rows.length) return null;
  const header = rows[0].map((h) => clean(h));
  const idxEvent = header.indexOf("Tournament/Event");
  const idxCategory = header.indexOf("Category");
  const idx = header.indexOf(position);
  if (idxEvent === -1 || idx === -1) return null;

  const events = rows
    .slice(1)
    .filter((r) => {
      if (idxCategory === -1) return gender !== "Women";
      const c = clean(r[idxCategory] || "").toLowerCase();
      if (gender === "Men") return c.includes("men");
      if (gender === "Women") return c.includes("women");
      return c.includes("men") || c.includes("women");
    })
    .map((r) => ({ event: clean(r[idxEvent] || ""), raw: clean(r[idx] || "") }))
    .filter((r) => r.event);
  const best = selectEventOrBest(events, selectedEvent);
  if (!best) return null;
  return { sport: "Badminton", event: best.event, amount: best.amount, display: best.raw };
}

function extractCricket(rows: string[][], position: Position, gender: GenderFilter, selectedEvent?: string): SportPoint | null {
  const key = position === "Winner" ? "winner" : "runner";

  const menStart = rows.findIndex((r) => clean(r[0] || "").toLowerCase().includes("men's"));
  const womenStart = rows.findIndex((r) => clean(r[0] || "").toLowerCase().includes("women's"));

  const menRows = menStart >= 0 ? rows.slice(menStart, womenStart >= 0 ? womenStart : undefined) : rows;
  const womenRows = womenStart >= 0 ? rows.slice(womenStart) : [];

  const menRow = menRows.find((r) => clean(r[0] || "").toLowerCase().includes(key));
  const womenRow = womenRows.find((r) => clean(r[0] || "").toLowerCase().includes(key));

  const menEvents = menRow
    ? [
        { event: "ODI World Cup", raw: menRow[1] || "" },
        { event: "Champions Trophy", raw: menRow[2] || "" },
        { event: "T20 World Cup", raw: menRow[3] || "" },
        { event: "WTC Final", raw: menRow[4] || "" },
      ]
    : [];

  const womenEvents = womenRow
    ? [
        { event: "Women’s T20 World Cup", raw: womenRow[1] || "" },
        { event: "Women’s ODI World Cup", raw: womenRow[2] || "" },
      ]
    : [];

  const events = gender === "Men" ? menEvents : gender === "Women" ? womenEvents : [...menEvents, ...womenEvents];
  const best = selectEventOrBest(events, selectedEvent);
  if (!best) return null;
  return { sport: "Cricket", event: best.event, amount: best.amount, display: clean(best.raw) };
}

function extractGolf(rows: string[][], position: Position, gender: GenderFilter, selectedEvent?: string): SportPoint | null {
  const menPlace = position === "Winner" ? "1" : "2";
  const menRow = rows.find((r) => clean(r[0] || "") === menPlace);

  const womenStart = rows.findIndex((r) => clean(r[0] || "").toLowerCase().includes("golf - majors women"));
  const womenPlace = position === "Winner" ? "1st" : "2nd";
  const womenRow = womenStart >= 0 ? rows.slice(womenStart).find((r) => clean(r[0] || "").toLowerCase() === womenPlace) : undefined;

  const menEvents = menRow
    ? [
        { event: "Masters", raw: menRow[1] || "" },
        { event: "U.S. Open", raw: menRow[2] || "" },
        { event: "PGA Championship", raw: menRow[3] || "" },
        { event: "The Open", raw: menRow[4] || "" },
      ]
    : [];

  const womenEvents = womenRow
    ? [
        { event: "U.S. Women’s Open", raw: womenRow[1] || "" },
        { event: "KPMG Women’s PGA", raw: womenRow[2] || "" },
        { event: "Chevron Championship", raw: womenRow[3] || "" },
        { event: "AIG Women’s Open", raw: womenRow[4] || "" },
        { event: "Amundi Evian Championship", raw: womenRow[5] || "" },
      ]
    : [];

  const events = gender === "Men" ? menEvents : gender === "Women" ? womenEvents : [...menEvents, ...womenEvents];
  const best = selectEventOrBest(events, selectedEvent);
  if (!best) return null;
  return { sport: "Golf", event: best.event, amount: best.amount, display: clean(best.raw) };
}

function extractChess(rows: string[][], position: Position, gender: GenderFilter, selectedEvent?: string): SportPoint | null {
  const key = position === "Winner" ? "winner" : "runner";
  const startIdx =
    gender === "Women"
      ? rows.findIndex((r) => clean(r[0] || "").toLowerCase().includes("women"))
      : rows.findIndex((r) => clean(r[0] || "").toLowerCase().includes("open"));

  const searchRows = startIdx >= 0 ? rows.slice(startIdx) : rows;
  const row = searchRows.find((r) => clean(r[0] || "").toLowerCase().includes(key));
  if (!row) return null;

  const events =
    gender === "Women"
      ? [
          { event: "Women’s World Championship", raw: row[1] || "" },
          { event: "Women’s Candidates", raw: row[2] || "" },
        ]
      : [
          { event: "World Chess Championship", raw: row[1] || "" },
          { event: "Candidates", raw: row[2] || "" },
          { event: "Tata Steel", raw: row[3] || "" },
          { event: "Norway Chess", raw: row[4] || "" },
          { event: "Sinquefield Cup", raw: row[5] || "" },
        ];
  const best = selectEventOrBest(events, selectedEvent);
  if (!best) return null;
  return { sport: "Chess", event: best.event, amount: best.amount, display: clean(best.raw) };
}

function extractSoccer(rows: string[][], position: Position, gender: GenderFilter, selectedEvent?: string): SportPoint | null {
  if (gender === "Women") return null;

  const key = position === "Winner" ? "champion" : "runner";
  const row = rows.find((r) => clean(r[1] || "").toLowerCase().includes(key));
  if (!row) return null;

  const events = [
    { event: "FIFA World Cup", raw: row[2] || "" },
    { event: "FIFA Club World Cup", raw: row[3] || "" },
  ];
  const best = selectEventOrBest(events, selectedEvent);
  if (!best) return null;
  return { sport: "Soccer", event: best.event, amount: best.amount, display: clean(best.raw) };
}

function extractForSport(sport: string, rows: string[][], position: Position, gender: GenderFilter, selectedEvent?: string): SportPoint | null {
  if (sport === "Tennis") return extractTennis(rows, position, gender, selectedEvent);
  if (sport === "Badminton") return extractBadminton(rows, position, gender, selectedEvent);
  if (sport === "Cricket") return extractCricket(rows, position, gender, selectedEvent);
  if (sport === "Golf") return extractGolf(rows, position, gender, selectedEvent);
  if (sport === "Chess") return extractChess(rows, position, gender, selectedEvent);
  if (sport === "Soccer") return extractSoccer(rows, position, gender, selectedEvent);
  return null;
}

export default function CompareSportsPage() {
  const [selectedPosition, setSelectedPosition] = useState<Position>("Winner");
  const [selectedGender, setSelectedGender] = useState<GenderFilter>("All");
  const [selectedSports, setSelectedSports] = useState<string[]>(sportSheets.map((s) => s.sport));
  const [selectedEventsBySport, setSelectedEventsBySport] = useState<Record<string, string>>({});
  const [rowsBySport, setRowsBySport] = useState<Record<string, string[][]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const fetched = await Promise.all(
          sportSheets.map(async ({ sport, sheet }) => {
            const res = await fetch(`/api/sheet-data?sheet=${encodeURIComponent(sheet)}`, { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || `Failed loading ${sport}`);
            return { sport, rows: Array.isArray(data.rows) ? data.rows : [] };
          })
        );

        if (cancelled) return;
        const map: Record<string, string[][]> = {};
        fetched.forEach((f) => {
          map[f.sport] = f.rows;
        });
        setRowsBySport(map);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const eventOptionsBySport = useMemo(() => {
    const map: Record<string, string[]> = {};

    sportSheets.forEach(({ sport }) => {
      if (sport === "Badminton") {
        const rows = rowsBySport[sport] || [];
        const header = rows[0]?.map((h) => clean(h)) || [];
        const idxEvent = header.indexOf("Tournament/Event");
        const dynamicEvents = idxEvent >= 0
          ? Array.from(new Set(rows.slice(1).map((r) => clean(r[idxEvent] || "")).filter(Boolean)))
          : [];
        map[sport] = dynamicEvents;
      } else {
        map[sport] = SPORT_EVENT_OPTIONS[sport] || [];
      }
    });

    return map;
  }, [rowsBySport]);

  const points = useMemo(() => {
    const parsed = sportSheets
      .filter(({ sport }) => selectedSports.includes(sport))
      .map(({ sport }) =>
        extractForSport(
          sport,
          rowsBySport[sport] || [],
          selectedPosition,
          selectedGender,
          selectedEventsBySport[sport]
        )
      )
      .filter(Boolean) as SportPoint[];

    return parsed.sort((a, b) => b.amount - a.amount);
  }, [rowsBySport, selectedPosition, selectedSports, selectedGender, selectedEventsBySport]);

  const maxValue = useMemo(() => Math.max(1, ...points.map((p) => p.amount)), [points]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1020_45%,_#05070f_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-6xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
          </Link>
          <Link href="/" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-sm text-amber-100 hover:border-amber-200/70">Home</Link>
        </div>

        <h1 className="mt-2 break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:text-4xl">Compare Sports Prize Money</h1>
        <p className="mt-2 text-sm text-amber-100/85 sm:text-base">Top-event comparison by finishing position (best available amount per sport).</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {positionOptions.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPosition(p)}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                selectedPosition === p
                  ? "border-amber-200/90 bg-amber-200/15 ring-2 ring-amber-300/35"
                  : "border-amber-200/30 bg-black/45 hover:border-amber-200/70"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {genderOptions.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                selectedGender === g
                  ? "border-amber-200/90 bg-amber-200/15 ring-2 ring-amber-300/35"
                  : "border-amber-200/30 bg-black/45 hover:border-amber-200/70"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <section className="mt-4 rounded-xl border border-amber-200/25 bg-black/35 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-amber-100">Select Sports</h3>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedSports(sportSheets.map((s) => s.sport))}
                className="rounded-md border border-amber-200/30 px-2 py-1 text-amber-100/85 hover:border-amber-200/70"
              >
                All
              </button>
              <button
                onClick={() => setSelectedSports([])}
                className="rounded-md border border-amber-200/30 px-2 py-1 text-amber-100/85 hover:border-amber-200/70"
              >
                None
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sportSheets.map(({ sport }) => {
              const checked = selectedSports.includes(sport);
              const options = eventOptionsBySport[sport] || [];
              const selectedEvent = selectedEventsBySport[sport] || "All Events";

              return (
                <div key={sport} className="rounded-lg border border-amber-200/20 px-2 py-2 text-sm text-amber-100/90 hover:border-amber-200/50">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSports((prev) => (prev.includes(sport) ? prev : [...prev, sport]));
                        } else {
                          setSelectedSports((prev) => prev.filter((s) => s !== sport));
                        }
                      }}
                    />
                    <span>{sport}</span>
                  </label>

                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEventsBySport((prev) => ({ ...prev, [sport]: e.target.value }))}
                    className="mt-2 w-full rounded-md border border-amber-200/30 bg-black/45 px-2 py-1 text-xs text-amber-100"
                  >
                    <option value="All Events">All Events</option>
                    {options.map((eventName) => (
                      <option key={eventName} value={eventName}>{eventName}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </section>

        {loading ? <p className="mt-5 text-sm text-amber-100/80">Loading comparison data...</p> : null}
        {error ? <p className="mt-5 text-sm text-rose-300">Error: {error}</p> : null}

        <section className="mt-7 rounded-2xl border border-amber-200/35 bg-black/55 p-4 sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-amber-100 sm:text-lg">{selectedPosition} Comparison • {selectedGender}</h2>

          <div className="space-y-3">
            {points.map((p) => (
              <div key={p.sport}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-amber-100">{p.sport}</span>
                    <span className="ml-2 text-amber-100/75">{p.event}</span>
                  </div>
                  <span className="font-semibold text-amber-50">{formatDisplayWithCurrency(p.display, p.amount)}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-amber-100/10">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-200"
                    style={{ width: `${Math.max(2, (p.amount / maxValue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!loading && !error && points.length === 0 ? (
            <p className="text-sm text-amber-100/80">
              {selectedSports.length === 0 ? "Select at least one sport to compare." : "No comparable rows found for selected sport(s)."}
            </p>
          ) : null}
        </section>

        <p className="mt-4 text-xs text-amber-100/70">
          Note: This MVP compares highest parsed payout for the selected position using currently available sheet data formats.
          Display enforces currency-first formatting for readability.
        </p>
      </main>
    </div>
  );
}

