"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      const data = await r.json();
      if (!data?.authenticated) router.push("/account/login");
    });
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Password changed successfully." : data?.error || "Failed to change password.");
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Change Password</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded border p-2" required />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" minLength={8} className="w-full rounded border p-2" required />
        <button className="rounded border px-4 py-2">Update Password</button>
      </form>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
    </main>
  );
}
