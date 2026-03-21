"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "wa_cookie_consent_v1";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const saveChoice = (choice: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
      localStorage.setItem(`${STORAGE_KEY}_at`, new Date().toISOString());
    } catch {
      // no-op
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[9999] mx-auto max-w-4xl rounded-xl border border-amber-200/40 bg-black/95 p-4 text-amber-100 shadow-2xl backdrop-blur-sm sm:inset-x-6">
      <p className="text-sm leading-6">
        We use cookies for core site functionality, analytics, and ad personalization (where applicable).
        By clicking <span className="font-semibold">Accept</span>, you consent to this use. Read our
        <Link href="/privacy-policy" className="ml-1 underline underline-offset-4">Privacy Policy</Link>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => saveChoice("accepted")}
          className="rounded-md border border-amber-200/70 bg-amber-300/20 px-3 py-1.5 text-sm font-semibold text-amber-50 hover:bg-amber-300/30"
        >
          Accept
        </button>
        <button
          onClick={() => saveChoice("rejected")}
          className="rounded-md border border-amber-200/40 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-200/10"
        >
          Reject non-essential
        </button>
      </div>
    </div>
  );
}
