"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  sport: string;
  event: string;
  category: string;
  position: string;
  prizeAmount: string;
  currency: string;
  status: string;
  adminComment: string;
  submittedAt: string;
  reviewedAt: string;
};

export default function MySubmissionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me");
      const meData = await me.json();
      if (!meData?.authenticated) {
        router.push("/account/login");
        return;
      }
      setEmail(meData.email || "");

      const res = await fetch("/api/my-submissions", { cache: "no-store" });
      const data = await res.json();
      setRows(data?.submissions || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/account/login");
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <div className="flex items-center gap-3 text-sm">
          <span>{email}</span>
          <Link className="underline" href="/account/change-password">Change Password</Link>
          <button onClick={logout} className="rounded border px-3 py-1">Logout</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : null}
      {!loading && rows.length === 0 ? <p>No submissions found for this email.</p> : null}

      {!loading && rows.length > 0 ? (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Sport</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Prize</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Admin Comment</th>
                <th className="px-3 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.sport}</td>
                  <td className="px-3 py-2">{r.event}</td>
                  <td className="px-3 py-2">{r.category}</td>
                  <td className="px-3 py-2">{r.position}</td>
                  <td className="px-3 py-2">{r.prizeAmount} {r.currency}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.adminComment || "-"}</td>
                  <td className="px-3 py-2">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
