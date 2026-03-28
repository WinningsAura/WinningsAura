"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Password reset successful. You can now login." : data?.error || "Reset failed.");
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} placeholder="New password" className="w-full rounded border p-2" required />
        <button className="rounded border px-4 py-2">Reset Password</button>
      </form>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
    </main>
  );
}
