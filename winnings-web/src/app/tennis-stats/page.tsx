"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const sheetNames = ["Tennis Grand Slams", "ATP and WTA"] as const;
type SheetName = (typeof sheetNames)[number];

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

export default function TennisStatsPage() {
  const [selectedSheet, setSelectedSheet] = useState<SheetName>("Tennis Grand Slams");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Singles");
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<number>(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedRound, setSelectedRound] = useState<string>("");

  useEffect(() => {
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
  }, [selectedSheet]);

  const processed = useMemo(() => {
    if (selectedSheet !== "Tennis Grand Slams") {
      const header = rows[0] ?? [];
      const body = rows.length > 1 ? rows.slice(1) : [];
      return { sectionHeader: selectedSheet, header, body };
    }

    const sectionRows = sliceCategoryRows(rows, selectedCategory);
    if (sectionRows.length === 0) return { sectionHeader: selectedCategory, header: [], body: [] as string[][] };

    const withoutCategoryColumn = dropFirstColumn(sectionRows);
    const header = withoutCategoryColumn[0] ?? [];
    const body = withoutCategoryColumn.length > 1 ? withoutCategoryColumn.slice(1) : [];

    return { sectionHeader: selectedCategory, header, body };
  }, [rows, selectedSheet, selectedCategory]);

  const sortedBody = useMemo(() => {
    const copy = [...processed.body];
    copy.sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";

      const an = toNumber(av);
      const bn = toNumber(bv);
      const bothNumeric = !Number.isNaN(an) && !Number.isNaN(bn);

      let cmp = 0;
      if (bothNumeric) cmp = an - bn;
      else cmp = av.localeCompare(bv);

      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [processed.body, sortCol, sortDir]);

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

  function onSort(colIdx: number) {
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

          <div className="mt-3">
            <a href="#prize-chart" className="text-sm text-amber-200 underline underline-offset-4 hover:text-amber-100">
              Jump to prize money chart
            </a>
          </div>

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

        <h2 className="mb-3 text-lg font-semibold text-amber-100 sm:text-xl">{processed.sectionHeader}</h2>

        <div className="hidden overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 shadow-[0_0_40px_rgba(245,185,59,0.08)] backdrop-blur-sm md:block">
          <table className="min-w-full text-left text-sm">
            {processed.header.length > 0 ? (
              <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                <tr>
                  {processed.header.map((cell, idx) => (
                    <th key={`${idx}-${cell}`} className="px-4 py-3 whitespace-nowrap font-semibold tracking-wide">
                      <button onClick={() => onSort(idx)} className="inline-flex items-center gap-1 hover:text-white">
                        {cell || `Column ${idx + 1}`}
                        {sortCol === idx ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {sortedBody.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45 hover:bg-amber-200/10">
                  {row.map((cell, cIdx) => (
                    <td key={`${rIdx}-${cIdx}`} className="px-4 py-3 whitespace-nowrap align-top text-amber-50/95">
                      {cell || "—"}
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
                  <p className="text-right text-sm text-amber-50/95">{row[cIdx] || "—"}</p>
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
              {rounds.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {chartData.map((d) => (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-amber-100/90">
                  <span>{d.label}</span>
                  <span>{d.raw || "—"}</span>
                </div>
                <div className="h-3 w-full rounded bg-amber-100/10">
                  <div className="h-3 rounded bg-gradient-to-r from-amber-400 to-yellow-200" style={{ width: `${(d.value / maxChart) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
