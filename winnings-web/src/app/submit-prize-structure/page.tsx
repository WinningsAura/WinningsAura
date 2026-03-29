"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type PrizeItem = {
  position: string;
  prizeAmount: string;
  currency: string;
};

type PrizeCategory = {
  name: string;
  items: PrizeItem[];
};

type FormState = {
  sport: string;
  event: string;
  country: string;
  province: string;
  city: string;
  categories: PrizeCategory[];
  submitterName: string;
  submitterEmail: string;
  notes: string;
  website: string;
};

const SPORT_OPTIONS = ["Tennis", "Cricket", "Golf", "Chess", "Badminton", "Soccer", "Others"];
const CATEGORY_OPTIONS = ["Men", "Women", "Open", "Mixed", "Singles", "Doubles", "Team", "Other"];
const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY", "CHF", "AED", "SGD", "NZD"];

const SPORT_CATEGORY_OPTIONS: Record<string, string[]> = {
  Tennis: ["Men", "Women", "Singles", "Doubles", "Mixed"],
  Cricket: ["Men", "Women", "Team", "Open"],
  Golf: ["Men", "Women", "Open"],
  Chess: ["Open", "Women", "Mixed", "Team"],
  Badminton: ["Men", "Women", "Singles", "Doubles", "Mixed"],
  Soccer: ["Men", "Women", "Team"],
  "Compare Sports": ["Open", "Men", "Women", "Mixed"],
};

const SPORT_POSITION_OPTIONS: Record<string, string[]> = {
  Tennis: ["Winner", "Runner-up", "Semi-finalist", "Quarter-finalist", "Round of 16", "Round of 32"],
  Cricket: ["Winner", "Runner-up", "Semi-finalist", "Player of the Match", "Player of the Series"],
  Golf: ["Winner", "2nd", "3rd", "Top 5", "Top 10", "Top 20"],
  Chess: ["1st", "2nd", "3rd", "Top 10", "Best Woman", "Best Junior"],
  Badminton: ["Winner", "Runner-up", "Semi-finalist", "Quarter-finalist"],
  Soccer: ["Winner", "Runner-up", "Semi-finalist", "Quarter-finalist", "Golden Boot", "Golden Ball"],
  "Compare Sports": ["Winner", "Runner-up", "Top 4", "Top 8"],
};

const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "India",
  "United Kingdom",
  "Australia",
  "Pakistan",
  "South Africa",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Brazil",
  "Japan",
  "China",
  "Other",
];

const emptyItem = (): PrizeItem => ({ position: "", prizeAmount: "", currency: "USD" });
const emptyCategory = (): PrizeCategory => ({ name: "", items: [emptyItem()] });

const initialState: FormState = {
  sport: "",
  event: "",
  country: "",
  province: "",
  city: "",
  categories: [emptyCategory()],
  submitterName: "",
  submitterEmail: "",
  notes: "",
  website: "",
};

export default function SubmitPrizeStructurePage() {
  const seoStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Submit Prize Structure",
    url: "https://winningsaura.com/submit-prize-structure",
    description:
      "Submit tournament prize money details to help improve WinningsAura sports payouts data quality.",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://winningsaura.com/" },
        { "@type": "ListItem", position: 2, name: "Submit Prize Structure", item: "https://winningsaura.com/submit-prize-structure" },
      ],
    },
  };

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const currentCategoryOptions = SPORT_CATEGORY_OPTIONS[form.sport] || CATEGORY_OPTIONS;
  const currentPositionOptions = SPORT_POSITION_OPTIONS[form.sport] || ["Winner", "Runner-up", "Semi-finalist", "Quarter-finalist", "Top 8", "Top 16"];

  function handleSportChange(sport: string) {
    const allowedCategories = SPORT_CATEGORY_OPTIONS[sport] || CATEGORY_OPTIONS;
    const allowedPositions = SPORT_POSITION_OPTIONS[sport] || ["Winner", "Runner-up", "Semi-finalist", "Quarter-finalist", "Top 8", "Top 16"];

    const categories = form.categories.map((category) => ({
      ...category,
      name: allowedCategories.includes(category.name) ? category.name : "",
      items: category.items.map((item) => ({
        ...item,
        position: allowedPositions.includes(item.position) ? item.position : "",
      })),
    }));

    setForm({ ...form, sport, categories });
  }

  function updateCategoryName(index: number, name: string) {
    const categories = [...form.categories];
    categories[index] = { ...categories[index], name };
    setForm({ ...form, categories });
  }

  function updateItem(index: number, itemIndex: number, key: keyof PrizeItem, value: string) {
    const categories = [...form.categories];
    const items = [...categories[index].items];
    items[itemIndex] = {
      ...items[itemIndex],
      [key]: key === "currency" ? value.toUpperCase() : value,
    };
    categories[index] = { ...categories[index], items };
    setForm({ ...form, categories });
  }

  function addCategory() {
    setForm({ ...form, categories: [...form.categories, emptyCategory()] });
  }

  function removeCategory(index: number) {
    if (form.categories.length <= 1) return;
    setForm({ ...form, categories: form.categories.filter((_, i) => i !== index) });
  }

  function addItem(index: number) {
    const categories = [...form.categories];
    categories[index] = { ...categories[index], items: [...categories[index].items, emptyItem()] };
    setForm({ ...form, categories });
  }

  function removeItem(index: number, itemIndex: number) {
    const categories = [...form.categories];
    if (categories[index].items.length <= 1) return;
    categories[index] = { ...categories[index], items: categories[index].items.filter((_, i) => i !== itemIndex) };
    setForm({ ...form, categories });
  }

  // File upload removed per request.

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/prize-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");

      setStatus(`Thanks! Submission received (ID: ${data.id}). It will be reviewed by admin before publishing.`);
      setForm(initialState);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-3 py-6 text-black sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoStructuredData) }}
      />
      <main className="relative z-30 mx-auto w-full max-w-4xl rounded-2xl border border-black bg-white p-4 shadow-[0_0_60px_rgba(245,185,59,0.12)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black pb-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/winnings-aura-logo-currency.svg" alt="WinningsAura" className="h-8 w-auto sm:h-9" />
          </Link>
          <details className="group relative">
            <summary className="list-none cursor-pointer rounded-lg border border-black px-3 py-1.5 text-black hover:bg-gray-100">Menu</summary>
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-black bg-white p-2 shadow-2xl">
              <Link href="/" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Home</Link>
              <Link href="/about-us" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">About Us</Link>
              <Link href="/tennis-stats" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Tennis</Link>
              <Link href="/cricket-stats" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Cricket</Link>
              <Link href="/golf-stats" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Golf</Link>
              <Link href="/chess-stats" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Chess</Link>
              <Link href="/badminton-stats" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Badminton</Link>
              <Link href="/soccer-stats" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Soccer</Link>
              <Link href="/compare-sports" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Compare Sports</Link>
              <Link href="/contact-us" className="block rounded-md px-3 py-2 text-black hover:bg-gray-100">Contact Us</Link>
            </div>
          </details>
        </div>

        <h1 className="break-words text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-black sm:text-4xl">Submit Prize Structure</h1>
        <p className="mt-2 text-black/80">Add event and prize details. You can add/remove categories and entries under each category.</p>
        <p className="mt-2 text-xs text-black/70">
          Need a reference first? See current payouts in <Link href="/tennis-stats" className="underline underline-offset-4">Tennis</Link>, <Link href="/cricket-stats" className="underline underline-offset-4">Cricket</Link>, <Link href="/golf-stats" className="underline underline-offset-4">Golf</Link>, and <Link href="/compare-sports" className="underline underline-offset-4">Compare Sports</Link>.
        </p>
        <div className="mt-3 rounded-xl border border-black/30 bg-gray-50 p-3 text-xs sm:text-sm">
          <p className="font-semibold">Submission is free of cost.</p>
          <p className="mt-1 text-black/80">
            You can submit prize structures from all levels: school, college, regional, provincial, country, and international competitions.
          </p>
        </div>
        {/* status links removed */}

        <form onSubmit={onSubmit} className="mt-6 space-y-4 [&_label]:text-black [&_input]:bg-white [&_input]:text-black [&_input]:border-black [&_select]:bg-white [&_select]:text-black [&_select]:border-black [&_textarea]:bg-white [&_textarea]:text-black [&_textarea]:border-black [&_button]:text-black [&_button]:border-black">
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden="true" />

          {/* File upload removed */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Sport *</label>
              <select value={form.sport} onChange={(e) => handleSportChange(e.target.value)} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" required>
                <option value="">Select sport</option>
                {SPORT_OPTIONS.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Event *</label>
              <input value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm">Country *</label>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" required>
                <option value="">Select country</option>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Province / State (optional)</label>
              <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" />
            </div>
            <div>
              <label className="mb-1 block text-sm">City (optional)</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" />
            </div>
          </div>

          <div className="rounded-xl border border-black bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-black">Prize Categories</h2>
              <button type="button" onClick={addCategory} className="rounded-md border border-black px-3 py-1.5 text-sm hover:bg-gray-100">+ Add Category</button>
            </div>

            <div className="space-y-4">
              {form.categories.map((category, index) => (
                <div key={index} className="rounded-lg border border-black bg-white p-3">
                  <div className="mb-3 flex items-end gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm">Category Name</label>
                      <select value={category.name} onChange={(e) => updateCategoryName(index, e.target.value)} className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black">
                        <option value="">Select category</option>
                        {currentCategoryOptions.map((categoryOption) => (
                          <option key={categoryOption} value={categoryOption}>{categoryOption}</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" onClick={() => removeCategory(index)} disabled={form.categories.length <= 1} className="rounded-md border border-black px-3 py-2 text-sm disabled:opacity-50">Remove Category</button>
                  </div>

                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="grid gap-2 sm:grid-cols-[1.4fr_1fr_0.8fr_auto] sm:items-end">
                        <div>
                          <label className="mb-1 block text-xs">Position</label>
                          <select value={item.position} onChange={(e) => updateItem(index, itemIndex, "position", e.target.value)} className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black">
                            <option value="">Select position</option>
                            {currentPositionOptions.map((positionOption) => (
                              <option key={positionOption} value={positionOption}>{positionOption}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs">Prize Amount</label>
                          <input value={item.prizeAmount} onChange={(e) => updateItem(index, itemIndex, "prizeAmount", e.target.value)} placeholder="e.g. 250000" className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs">Currency</label>
                          <select value={item.currency} onChange={(e) => updateItem(index, itemIndex, "currency", e.target.value)} className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black">
                            {CURRENCY_OPTIONS.map((currencyOption) => (
                              <option key={currencyOption} value={currencyOption}>{currencyOption}</option>
                            ))}
                          </select>
                        </div>
                        <button type="button" onClick={() => removeItem(index, itemIndex)} disabled={category.items.length <= 1} className="rounded-md border border-black px-2 py-2 text-xs disabled:opacity-50">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem(index)} className="rounded-md border border-black px-3 py-1.5 text-xs hover:bg-gray-100">+ Add Position</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Your Name *</label>
              <input value={form.submitterName} onChange={(e) => setForm({ ...form, submitterName: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" required />
            </div>
            <div>
              <label className="mb-1 block text-sm">Your Email *</label>
              <input type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Notes for Admin</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" />
          </div>

          <button type="submit" disabled={loading} className="rounded-xl border border-black bg-white px-5 py-2.5 font-semibold hover:bg-gray-100 disabled:opacity-60">
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </form>

        {status ? <p className="mt-4 text-sm text-black">{status}</p> : null}
      </main>
    </div>
  );
}

