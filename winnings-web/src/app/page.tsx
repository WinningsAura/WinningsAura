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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a3900,#0b0b0b_45%,#000000_70%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-6 rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:mb-8 sm:rounded-3xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300/90 sm:text-sm">Winnings App</p>
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
                <Image src={sport.image} alt={`${sport.name} icon`} fill className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
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
