"use client";

import { FormEvent, useState } from "react";

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });

      const data = (await res.json()) as { ok?: boolean; alreadySubscribed?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "Unable to subscribe right now. Please try again.");
        return;
      }

      if (data.alreadySubscribed) {
        setStatus("exists");
        setMessage("You're already subscribed for the latest updates.");
      } else {
        setStatus("success");
        setMessage("Subscribed! You'll receive the latest updates.");
      }

      setEmail("");
      setCompany("");
    } catch {
      setStatus("error");
      setMessage("Network issue. Please try again in a moment.");
    }
  }

  return (
    <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-amber-200/20 bg-black/35 p-4 text-left">
      <p className="text-sm font-semibold text-amber-100">Subscribe for latest updates</p>
      <p className="mt-1 text-xs text-amber-100/75">Get notified when new sports prize data is added.</p>

      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-lg border border-amber-200/35 bg-black/40 px-3 py-2 text-sm text-amber-100 placeholder:text-amber-100/40 focus:border-amber-200/70 focus:outline-none"
        />

        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg border border-amber-200/60 bg-amber-300/20 px-3.5 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-2 text-xs ${
            status === "error" ? "text-red-300" : status === "exists" ? "text-amber-200" : "text-emerald-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
