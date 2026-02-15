import Link from "next/link";

const sports = [
  {
    name: "Tennis",
    media: "/tennis-playing.mp4",
    href: "/tennis-stats",
    description: "Explore premium tennis prize money insights and category-level views.",
  },
  {
    name: "Cricket",
    media: "/cricket-playing.mp4",
    href: "/cricket-stats",
    description: "Discover cricket stats and winnings dashboards (expanding soon).",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,rgba(255,0,128,0.55),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(0,200,255,0.5),transparent_35%),radial-gradient(circle_at_20%_85%,rgba(130,255,0,0.35),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(255,170,0,0.42),transparent_36%),linear-gradient(135deg,#1a0033_0%,#12001f_30%,#001a2e_65%,#0a0014_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-6 rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:mb-8 sm:rounded-3xl sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/90 sm:text-sm">Winnings App</p>
            <nav className="flex items-center gap-2 text-sm sm:gap-3">
              <Link href="/" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Home</Link>
              <Link href="/about-us" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">About Us</Link>
              <Link href="/contact-us" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Contact Us</Link>
              <Link href="/admin/contact-submissions" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Admin</Link>
            </nav>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-amber-100 sm:text-4xl lg:text-5xl">Sports Home</h1>
          <p className="mt-2 text-sm text-amber-100/75 sm:mt-3 sm:text-base">A classy black-gold experience for sports prize money analytics.</p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {sports.map((sport) => (
            <Link
              key={sport.name}
              href={sport.href}
              className="group overflow-hidden rounded-2xl border border-amber-300/30 bg-black/50 shadow-2xl backdrop-blur-sm transition hover:border-amber-200/80 hover:shadow-[0_0_50px_rgba(245,185,59,0.2)] sm:rounded-3xl"
            >
              <div className="relative h-44 w-full sm:h-52 lg:h-56">
                <video
                  src={sport.media}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                <p className="absolute bottom-3 left-3 text-xl font-bold text-amber-100 sm:bottom-4 sm:left-4 sm:text-2xl">{sport.name}</p>
              </div>
              <div className="p-4 text-sm text-amber-100/85 sm:p-5">{sport.description}</div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
