"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Submission = {
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
};

export default function ContactSubmissionsAdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact");
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

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-6xl rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/sports-winnings-logo.svg" alt="Sports Winnings" className="h-8 w-auto sm:h-9" />
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            
            <div className="group relative">
              <button type="button" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Menu</button>
              <div className="invisible absolute right-0 top-full z-20 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <Link href="/about-us" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">{"\uD83D\uDC65"} About Us</Link>
                <Link href="/tennis-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">{"\uD83C\uDFBE"} Tennis</Link>
                <Link href="/cricket-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">{"\uD83C\uDFCF"} Cricket</Link>
                <Link href="/golf-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">? Golf</Link>
                <Link href="/contact-us" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">{"\u2709\uFE0F"} Contact Us</Link>
              </div>
            </div>
            <Link href="/admin/contact-submissions" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Admin</Link>
          </nav>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-amber-100 sm:text-4xl">Admin: Contact Submissions</h1>
          <button onClick={load} className="rounded-xl border border-amber-200/40 px-4 py-2 text-sm hover:border-amber-200">
            Refresh
          </button>
        </div>

        {loading ? <p className="mb-3 text-sm text-amber-100/80">Loading...</p> : null}
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

        <div className="overflow-x-auto rounded-2xl border border-amber-200/35 bg-black/55 backdrop-blur-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-amber-300/20 to-yellow-100/10 text-amber-100">
              <tr>
                <th className="px-4 py-3">Submitted At</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, idx) => (
                <tr key={idx} className="border-t border-amber-200/20 odd:bg-black/25 even:bg-black/45">
                  <td className="px-4 py-3 whitespace-nowrap">{s.submittedAt || "â€”"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{s.name || "â€”"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{s.email || "â€”"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{s.phone || "â€”"}</td>
                  <td className="px-4 py-3">{s.message || "â€”"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link href="/" className="mt-6 inline-block rounded-xl border border-amber-200/40 px-4 py-2 text-sm text-amber-100 hover:border-amber-200">
          â† Back to Sports Home
        </Link>
      </main>
    </div>
  );
}


