"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type FormState = {
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
  website: string;
};

const initialState: FormState = {
  sport: "",
  event: "",
  category: "",
  position: "",
  prizeAmount: "",
  currency: "USD",
  prizeStructure: "",
  submitterName: "",
  submitterEmail: "",
  notes: "",
  website: "",
};

export default function SubmitPrizeStructurePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/prize-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");

      setStatus(`Thanks! Submission received (ID: ${data.id}). It will be reviewed by admin before publishing.`);
      setForm(initialState);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#14334a_0%,_#0b1522_45%,_#070b12_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="relative z-30 mx-auto w-full max-w-3xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
          </Link>
          <Link href="/" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Home</Link>
        </div>

        <h1 className="break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-amber-100 sm:text-4xl">Submit Prize Structure</h1>
        <p className="mt-2 text-amber-100/80">Share your sport/event prize details. Admin will review before publishing to the relevant sport/category page.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden="true" />

          <div>
            <label className="mb-1 block text-sm">Sport *</label>
            <input value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" required />
          </div>

          <div>
            <label className="mb-1 block text-sm">Event *</label>
            <input value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Men / Women / Open / Mixed" className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Position</label>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Winner / Runner-up / Semi-final" className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Prize Amount</label>
              <input value={form.prizeAmount} onChange={(e) => setForm({ ...form, prizeAmount: e.target.value })} placeholder="e.g. 2340000" className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Currency</label>
              <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} placeholder="USD" className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Prize Structure * (min 20 chars)</label>
            <textarea value={form.prizeStructure} onChange={(e) => setForm({ ...form, prizeStructure: e.target.value })} rows={5} className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Your Name *</label>
              <input value={form.submitterName} onChange={(e) => setForm({ ...form, submitterName: e.target.value })} className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" required />
            </div>
            <div>
              <label className="mb-1 block text-sm">Your Email *</label>
              <input type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })} className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Notes for Admin</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200" />
          </div>

          <button type="submit" disabled={loading} className="rounded-xl border border-amber-200/50 bg-amber-300/20 px-5 py-2.5 font-semibold text-amber-100 hover:bg-amber-300/30 disabled:opacity-60">
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </form>

        {status ? <p className="mt-4 text-sm text-amber-100">{status}</p> : null}
      </main>
    </div>
  );
}
