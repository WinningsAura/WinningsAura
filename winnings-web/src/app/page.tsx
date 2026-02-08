import Image from "next/image";
import Link from "next/link";

const sports = [
  {
    name: "Tennis",
    image: "/icon-tennis.svg",
    href: "/tennis-stats",
    description: "View tennis prize money stats by category and round.",
  },
  {
    name: "Cricket",
    image: "/icon-cricket.svg",
    href: "/cricket-stats",
    description: "Cricket stats module placeholder for next phase.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e3a8a,#020617_55%)] px-4 py-10 text-white sm:px-8">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Winnings App</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Sports Home</h1>
          <p className="mt-3 text-white/80">Select a sport to explore prize money and stats.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {sports.map((sport) => (
            <Link
              key={sport.name}
              href={sport.href}
              className="group overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm transition hover:border-cyan-300/70"
            >
              <div className="relative h-56 w-full">
                <Image src={sport.image} alt={`${sport.name} icon`} fill className="object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20" />
                <p className="absolute bottom-4 left-4 text-2xl font-bold">{sport.name}</p>
              </div>
              <div className="p-5 text-sm text-cyan-100/90">{sport.description}</div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
