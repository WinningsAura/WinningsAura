import Link from "next/link";

export default function GolfStatsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-5xl rounded-2xl border border-amber-300/30 bg-black/55 p-6 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-10">
        <h1 className="text-2xl font-bold text-amber-100 sm:text-4xl">Golf Stats</h1>
        <p className="mt-3 text-amber-100/85">Golf winnings dashboard is coming soon.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl border border-amber-200/40 px-4 py-2 text-sm text-amber-100 hover:border-amber-200">
          Back to Sports Home
        </Link>
      </main>
    </div>
  );
}
