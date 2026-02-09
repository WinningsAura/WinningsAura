import Image from "next/image";
import Link from "next/link";

const sports = [
  {
    name: "Tennis",
    image: "/icon-tennis.svg",
    href: "/tennis-stats",
    description: "Explore premium tennis prize money insights and category-level views.",
  },
  {
    name: "Cricket",
    image: "/icon-cricket.svg",
    href: "/cricket-stats",
    description: "Discover cricket stats and winnings dashboards (expanding soon).",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-4 py-10 text-[#F5E6B3] sm:px-8">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-8 rounded-3xl border border-amber-300/30 bg-black/55 p-6 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-300/90">Winnings App</p>
          <h1 className="mt-2 text-3xl font-bold text-amber-100 sm:text-5xl">Sports Home</h1>
          <p className="mt-3 text-amber-100/75">A classy black-gold experience for sports prize money analytics.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {sports.map((sport) => (
            <Link
              key={sport.name}
              href={sport.href}
              className="group overflow-hidden rounded-3xl border border-amber-300/30 bg-black/50 shadow-2xl backdrop-blur-sm transition hover:border-amber-200/80 hover:shadow-[0_0_50px_rgba(245,185,59,0.2)]"
            >
              <div className="relative h-56 w-full">
                <Image src={sport.image} alt={`${sport.name} icon`} fill className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <p className="absolute bottom-4 left-4 text-2xl font-bold text-amber-100">{sport.name}</p>
              </div>
              <div className="p-5 text-sm text-amber-100/85">{sport.description}</div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
