import type { MetadataRoute } from "next";

const SITE_URL = "https://www.originalpatosnici.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ks", "/al"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
