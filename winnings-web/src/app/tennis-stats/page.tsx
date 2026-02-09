"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const sheetNames = ["Tennis Grand Slams", "ATP and WTA", "Cricket", "All Sports Match Total Times"] as const;
type SheetName = (typeof sheetNames)[number];

export default function TennisStatsPage() {
  const [selectedSheet, setSelectedSheet] = useState<SheetName>("Tennis Grand Slams");
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

  const header = useMemo(() => rows[0] ?? [], [rows]);
  const body = useMemo(() => (rows.length > 1 ? rows.slice(1) : []), [rows]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Image src="/hero-tennis.svg" alt="Sports hero background" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/65 to-slate-950/90" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <section className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Tennis Prize Money Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Tennis Stats</h1>
          <p className="mt-3 max-w-3xl text-white/80">Based on tournament selection, exact Excel sheet data is displayed below.</p>

          <div className="mt-6 max-w-md">
            <label className="mb-2 block text-sm font-semibold text-cyan-100">Tournament</label>
            <select
              className="w-full rounded-xl border border-white/30 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-300"
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value as SheetName)}
            >
              {sheetNames.map((name) => (
                <option className="bg-slate-900" key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? <p className="mb-4 text-sm text-cyan-100">Loading data...</p> : null}
        {error ? <p className="mb-4 text-sm text-rose-300">Error: {error}</p> : null}

        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/25 backdrop-blur-sm">
          <table className="min-w-full text-left text-sm">
            {header.length > 0 ? (
              <thead className="bg-white/15 text-cyan-100">
                <tr>
                  {header.map((cell, idx) => (
                    <th key={`${idx}-${cell}`} className="px-4 py-3 whitespace-nowrap">
                      {cell || `Column ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-white/10 odd:bg-black/10 even:bg-black/20">
                  {row.map((cell, cIdx) => (
                    <td key={`${rIdx}-${cIdx}`} className="px-4 py-3 whitespace-nowrap align-top">
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
