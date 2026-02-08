"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { categories, SportCategory, winningsByCategory } from "@/data/winnings";

const categoryImage: Record<SportCategory, string> = {
  Singles: "/card-singles.svg",
  Doubles: "/card-doubles.svg",
  "Mixed Doubles": "/card-mixed.svg",
};

const tournaments = [
  { key: "australianOpenAud", label: "Australian Open", short: "AO", icon: "🇦🇺" },
  { key: "usOpenUsd", label: "US Open", short: "USO", icon: "🇺🇸" },
  { key: "rolandGarrosEur", label: "Roland-Garros", short: "RG", icon: "🇫🇷" },
  { key: "wimbledonGbp", label: "Wimbledon", short: "WIM", icon: "🇬🇧" },
  { key: "torontoUsd", label: "Toronto", short: "TOR", icon: "🇨🇦" },
] as const;

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [category, setCategory] = useState<SportCategory>("Singles");

  const rows = useMemo(() => winningsByCategory[category], [category]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Image src="/hero-tennis.svg" alt="Sports hero background" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/65 to-slate-950/90" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <section className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Prize Money Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Player Winnings Viewer</h1>
          <p className="mt-3 max-w-3xl text-white/80">
            Select a category to view tournament prize money. Add a player name for presentation context.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`group overflow-hidden rounded-2xl border text-left transition ${
                category === c
                  ? "border-cyan-300/80 ring-2 ring-cyan-300/40"
                  : "border-white/20 hover:border-cyan-300/40"
              }`}
            >
              <div className="relative h-36 w-full">
                <Image src={categoryImage[c]} alt={`${c} category`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20" />
                <p className="absolute bottom-3 left-3 text-lg font-semibold">{c}</p>
              </div>
            </button>
          ))}
        </section>

        {playerName ? (
          <div className="mb-6 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm">
            Showing prize tiers for <span className="font-semibold text-cyan-200">{playerName}</span> in {category}.
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/25 backdrop-blur-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/15 text-cyan-100">
              <tr>
                <th className="px-4 py-3">Round</th>
                {tournaments.map((t) => (
                  <th key={t.key} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <div>
                        <div className="font-semibold leading-tight">{t.short}</div>
                        <div className="text-xs text-cyan-100/80">{t.label}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.round} className="border-t border-white/10 odd:bg-black/10 even:bg-black/20">
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
      </main>
    </div>
  );
}
