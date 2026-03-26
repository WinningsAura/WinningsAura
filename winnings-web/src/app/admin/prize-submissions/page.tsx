"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Submission = {
  id: string;
  sport: string;
  event: string;
  category: string;
  position: string;
  prizeAmount: string;
  currency: string;
  prizeStructure: string;
  submitterName: string;
  submitterEmail: string;
  notes: string;
  status: "Pending" | "Approved" | "Rejected";
  adminComment: string;
  submittedAt: string;
  reviewedAt: string;
};

export default function PrizeSubmissionsAdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prize-submissions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load submissions");
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Submission["status"]) {
    const adminComment = window.prompt(`Optional admin comment for ${status}:`) || "";

    const res = await fetch("/api/prize-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminComment }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to update status");
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-7xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/submit-prize-structure" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Submission Form</Link>
            <button onClick={load} className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Refresh</button>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-amber-100 sm:text-4xl">Admin: Prize Submissions Review</h1>
        <p className="mb-4 text-sm text-amber-100/85">Approve or reject user-submitted sport/event prize structures. Approved records are ready to publish to the matching sport/category.</p>

        {loading ? <p className="mb-3 text-sm text-amber-100/80">Loading...</p> : null}
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

        <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
              <tr>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Sport</th>
                <th className="px-3 py-3">Event</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Position</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Structure</th>
                <th className="px-3 py-3">Submitter</th>
                <th className="px-3 py-3">Submitted</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45 align-top">
                  <td className="px-3 py-3 whitespace-nowrap">{s.status}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{s.sport}</td>
                  <td className="px-3 py-3">{s.event}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{s.category || "-"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{s.position || "-"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{s.currency} {s.prizeAmount || "-"}</td>
                  <td className="px-3 py-3 max-w-[280px]">{s.prizeStructure}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{s.submitterName}<br /><span className="text-xs text-amber-100/70">{s.submitterEmail}</span></td>
                  <td className="px-3 py-3 whitespace-nowrap">{s.submittedAt}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <button onClick={() => updateStatus(s.id, "Approved")} className="rounded-md border border-emerald-300/60 px-2 py-1 text-emerald-200 hover:bg-emerald-400/20">Approve</button>
                      <button onClick={() => updateStatus(s.id, "Rejected")} className="rounded-md border border-rose-300/60 px-2 py-1 text-rose-200 hover:bg-rose-400/20">Reject</button>
                      <button onClick={() => updateStatus(s.id, "Pending")} className="rounded-md border border-amber-300/60 px-2 py-1 text-amber-200 hover:bg-amber-400/20">Reset</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
