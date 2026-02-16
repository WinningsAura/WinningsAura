"use client";

import { usePathname } from "next/navigation";

export default function BottomTicker() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t border-amber-200/30 bg-black/85 text-amber-100">
      <div className="ticker-track py-2 text-xs sm:text-sm">
        <div className="ticker-group whitespace-nowrap">
          <span className="mx-6">Notice: Winning amounts are officially published by tournament organizers but may not always be fully accurate.</span>
          <span className="mx-6">Notice: Winning amounts are officially published by tournament organizers but may not always be fully accurate.</span>
        </div>
        <div className="ticker-group whitespace-nowrap" aria-hidden>
          <span className="mx-6">Notice: Winning amounts are officially published by tournament organizers but may not always be fully accurate.</span>
          <span className="mx-6">Notice: Winning amounts are officially published by tournament organizers but may not always be fully accurate.</span>
        </div>
      </div>
    </div>
  );
}
