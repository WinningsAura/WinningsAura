import type { MetadataRoute } from "next";

const baseUrl = "https://winnings-aura.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tennis-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cricket-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/golf-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/chess-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact-us`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
}
