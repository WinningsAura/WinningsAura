"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
  website: string; // honeypot
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

export default function ContactUsPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");

      setStatus("Thanks! Your message has been submitted.");
      setForm(initialState);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300/90 sm:text-sm">Winnings App</p>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <Link href="/" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Home</Link>
            <div className="group relative">
              <button type="button" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Menu</button>
              <div className="invisible absolute right-0 top-full z-20 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <Link href="/about-us" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">About Us</Link>
                <Link href="/tennis-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">Tennis</Link>
                <Link href="/cricket-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">Cricket</Link>
              </div>
            </div>
          </nav>
        </div>
        <h1 className="text-2xl font-bold text-amber-100 sm:text-4xl">Contact Us</h1>
        <p className="mt-2 text-amber-100/80">Share your details and message. We will save it in our contact submissions file.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="hidden"
            aria-hidden="true"
          />

          <div>
            <label className="mb-1 block text-sm">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Message * (min 10 chars)</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="w-full rounded-xl border border-amber-200/40 bg-black/60 px-4 py-3 text-amber-100 outline-none focus:border-amber-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-amber-200/50 bg-amber-300/20 px-5 py-2.5 font-semibold text-amber-100 hover:bg-amber-300/30 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {status ? <p className="mt-4 text-sm text-amber-100">{status}</p> : null}

        <Link href="/" className="mt-6 inline-block rounded-xl border border-amber-200/40 px-4 py-2 text-sm text-amber-100 hover:border-amber-200">
          ← Back to Sports Home
        </Link>
      </main>
    </div>
  );
}

