"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setStatus(data?.error || "Registration failed.");
    router.push("/my-submissions");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <p className="mt-1 text-sm text-black/70">Use the same email you use for submissions.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded border p-2" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 chars)" className="w-full rounded border p-2" minLength={8} required />
        <button disabled={loading} className="rounded border px-4 py-2">{loading ? "Creating..." : "Create Account"}</button>
      </form>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
      <p className="mt-4 text-sm">Already have an account? <Link className="underline" href="/account/login">Login</Link></p>
    </main>
  );
}
