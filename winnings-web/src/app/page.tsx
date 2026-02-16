import Image from "next/image";
import Link from "next/link";

const sports = [
  {
    name: "Tennis",
    image: "/tennis-aura-max-2026.svg",
    href: "/tennis-stats",
    description: "Explore premium tennis prize money insights and category-level views.",
  },
  {
    name: "Cricket",
    image: "/cricket-aura-max-2026.svg",
    href: "/cricket-stats",
    description: "Discover cricket stats and winnings dashboards (expanding soon).",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#2a0a46_0%,#1f0d36_30%,#0b2842_65%,#130822_100%)] px-3 py-6 text-[#F5E6B3] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <Image src="/sports-legends-bg.svg" alt="Sports legends background" fill priority className="object-cover opacity-55" />
      <div className="absolute inset-0 bg-black/25" />
      <main className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="mb-6 rounded-2xl border border-amber-300/30 bg-black/55 p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:mb-8 sm:rounded-3xl sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/20 pb-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/sports-winnings-logo.svg" alt="Sports Winnings" className="h-8 w-auto sm:h-9" />
            </Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-3">
              <div className="group relative">
                <button type="button" className="rounded-lg border border-amber-200/30 px-3 py-1.5 text-amber-100 hover:border-amber-200/70">Menu</button>
                <div className="invisible absolute right-0 top-full z-20 w-52 rounded-xl border border-amber-200/30 bg-black/95 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                  <Link href="/about-us" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">About Us</Link>
                  <Link href="/tennis-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">Tennis</Link>
                  <Link href="/cricket-stats" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">Cricket</Link>
                  <Link href="/contact-us" className="block rounded-md px-3 py-2 text-amber-100 hover:bg-amber-200/10">Contact Us</Link>
                </div>
              </div>
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
                <Image
                  src={sport.image}
                  alt={`${sport.name} visual`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
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

