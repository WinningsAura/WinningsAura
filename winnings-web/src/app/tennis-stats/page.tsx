"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const sheetNames = ["Tennis Grand Slams", "ATP and WTA", "Cricket", "All Sports Match Total Times"] as const;
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

export default function TennisStatsPage() {
  const [selectedSheet, setSelectedSheet] = useState<SheetName>("Tennis Grand Slams");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Singles");
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] text-[#F5E6B3]">
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <section className="mb-6 rounded-3xl border border-amber-300/30 bg-black/55 p-6 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300/90">Tennis Prize Money Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-amber-100 sm:text-5xl">Tennis Stats</h1>

          <div className="mt-6 max-w-md">
            <label className="mb-2 block text-sm font-semibold text-amber-100/90">Tournament</label>
            <select
              className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none transition focus:border-amber-200"
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

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`group overflow-hidden rounded-2xl border text-left transition ${
                  selectedCategory === c
                    ? "border-amber-200/90 ring-2 ring-amber-300/35"
                    : "border-amber-200/30 hover:border-amber-200/70"
                }`}
              >
                <div className="relative h-28 w-full">
                  <Image src={categoryImage[c]} alt={`${c} category`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30" />
                  <p className="absolute bottom-2 left-3 text-base font-semibold text-amber-100">{c}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {loading ? <p className="mb-4 text-sm text-amber-100/80">Loading data...</p> : null}
        {error ? <p className="mb-4 text-sm text-rose-300">Error: {error}</p> : null}

        <h2 className="mb-3 text-xl font-semibold text-amber-100">{processed.sectionHeader}</h2>

        <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 shadow-[0_0_40px_rgba(245,185,59,0.08)] backdrop-blur-sm">
          <table className="min-w-full text-left text-sm">
            {processed.header.length > 0 ? (
              <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
                <tr>
                  {processed.header.map((cell, idx) => (
                    <th key={`${idx}-${cell}`} className="px-4 py-3 whitespace-nowrap font-semibold tracking-wide">
                      {cell || `Column ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {processed.body.map((row, rIdx) => (
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
      </main>
    </div>
  );
}
