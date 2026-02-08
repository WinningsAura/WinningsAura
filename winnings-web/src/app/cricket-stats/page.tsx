import Link from "next/link";

export default function CricketStatsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#065f46,#020617_55%)] px-4 py-10 text-white sm:px-8">
      <main className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-bold">Cricket Stats</h1>
        <p className="mt-3 text-white/80">This section is ready and can be connected to cricket data next.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl border border-white/30 px-4 py-2 text-sm hover:border-cyan-300">
          ← Back to Sports Home
        </Link>
      </main>
    </div>
  );
}
