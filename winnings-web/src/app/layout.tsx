import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://winnings-aura.vercel.app";
const siteName = "WinningsAura";
const description =
  "WinningsAura tracks tennis, cricket, golf, chess, and badminton prize money insights with clean dashboards, historical context, and fast stats navigation.";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Sports Prize Money Insights`,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "sports prize money",
    "tennis prize money",
    "cricket stats",
    "golf prize money",
    "chess prize money",
    "badminton prize money",
    "sports analytics",
    "winnings dashboard",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} | Sports Prize Money Insights`,
    description,
    images: [
      {
        url: "/winnings-aura-logo-currency.svg",
        width: 1200,
        height: 630,
        alt: "WinningsAura",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Sports Prize Money Insights`,
    description,
    images: ["/winnings-aura-logo-currency.svg"],
  },
  verification: {
    google: googleSiteVerification,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/tennis-stats`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/winnings-aura-logo-currency.svg`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <footer className="border-t border-amber-200/20 bg-[#05070f] px-4 py-4 text-center text-sm text-amber-100/80">
          <div className="mx-auto max-w-6xl">
            <div className="mb-2">© {new Date().getFullYear()} WinningsAura</div>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm">
              <Link href="/about-us" className="underline underline-offset-4 hover:text-amber-100">
                About Us
              </Link>
              <Link href="/contact-us" className="underline underline-offset-4 hover:text-amber-100">
                Contact Us
              </Link>
              <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-amber-100">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-amber-100">
                Terms & Conditions
              </Link>
              <Link href="/cookie-policy" className="underline underline-offset-4 hover:text-amber-100">
                Cookie Policy
              </Link>
            </nav>
          </div>
        </footer>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
