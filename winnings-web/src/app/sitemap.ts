import type { MetadataRoute } from "next";

const baseUrl = "https://winnings-aura.vercel.app";

export const revalidate = 60 * 60; // 1 hour

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tennis-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cricket-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/golf-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/chess-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/badminton-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/soccer-stats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/compare-sports`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/submit-prize-structure`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact-us`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/cookie-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}

