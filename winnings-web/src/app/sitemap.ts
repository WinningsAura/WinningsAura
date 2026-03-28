import type { MetadataRoute } from "next";

const baseUrl = "https://winningsaura.com";

function getLastModifiedDate(): Date {
  const gitDate = process.env.VERCEL_GIT_COMMIT_DATE;
  if (gitDate) return new Date(gitDate);
  return new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = getLastModifiedDate();

  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tennis-stats`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cricket-stats`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/golf-stats`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/chess-stats`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/badminton-stats`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/soccer-stats`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/compare-sports`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/submit-prize-structure`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact-us`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/cookie-policy`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/account/login`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/account/register`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/my-submissions`, lastModified, changeFrequency: "weekly", priority: 0.5 },
  ];
}
