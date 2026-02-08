"use client";

import { useMemo, useState } from "react";
import { categories, SportCategory, winningsByCategory } from "@/data/winnings";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [category, setCategory] = useState<SportCategory>("Singles");

  const rows = useMemo(() => winningsByCategory[category], [category]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#3b82f6,_#0f172a_45%)] px-4 py-10 text-white sm:px-8">
      <main className="mx-auto w-full max-w-6xl rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Prize Money Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Player Winnings Viewer</h1>
          <p className="mt-3 max-w-3xl text-white/80">
            Select a category to view tournament prize money. You can type a player name for presentation/filter context.
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-cyan-100">Player Name</label>
            <input
              className="w-full rounded-xl border border-white/30 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-300"
              placeholder="e.g., Carlos Alcaraz"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-cyan-100">Category</label>
            <select
              className="w-full rounded-xl border border-white/30 bg-black/20 px-4 py-3 outline-none transition focus:border-cyan-300"
              value={category}
              onChange={(e) => setCategory(e.target.value as SportCategory)}
            >
              {categories.map((c) => (
                <option className="bg-slate-900" key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </section>

        {playerName ? (
          <div className="mb-6 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm">
            Showing prize tiers for <span className="font-semibold text-cyan-200">{playerName}</span> in {category}.
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-2xl border border-white/20">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/15 text-cyan-100">
              <tr>
                <th className="px-4 py-3">Round</th>
                <th className="px-4 py-3">Australian Open (AUD)</th>
                <th className="px-4 py-3">US Open (USD)</th>
                <th className="px-4 py-3">Roland-Garros (EUR)</th>
                <th className="px-4 py-3">Wimbledon (GBP)</th>
                <th className="px-4 py-3">Toronto (USD)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.round} className="border-t border-white/10 bg-black/10 odd:bg-black/20">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">{row.round}</td>
                  <td className="px-4 py-3">{row.australianOpenAud ?? "—"}</td>
                  <td className="px-4 py-3">{row.usOpenUsd ?? "—"}</td>
                  <td className="px-4 py-3">{row.rolandGarrosEur ?? "—"}</td>
                  <td className="px-4 py-3">{row.wimbledonGbp ?? "—"}</td>
                  <td className="px-4 py-3">{row.torontoUsd ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-xs text-white/70">
          Note: The uploaded sheet currently contains prize tiers by round/category (not per player history). If you share a player-level sheet,
          I can wire exact player winnings next.
        </p>
      </main>
    </div>
  );
}
