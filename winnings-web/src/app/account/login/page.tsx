"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setStatus(data?.error || "Login failed.");
    router.push("/my-submissions");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded border p-2" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded border p-2" required />
        <button disabled={loading} className="rounded border px-4 py-2">{loading ? "Logging in..." : "Login"}</button>
      </form>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
      <div className="mt-4 space-y-1 text-sm">
        <p><Link className="underline" href="/account/forgot-password">Forgot Password?</Link></p>
        <p>No account? <Link className="underline" href="/account/register">Register</Link></p>
      </div>
    </main>
  );
}
