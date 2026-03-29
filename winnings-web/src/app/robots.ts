import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/api/", "/my-submissions"],
    },
    sitemap: "https://winningsaura.com/sitemap.xml",
    host: "https://winningsaura.com",
  };
}
