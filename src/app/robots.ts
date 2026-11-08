import type { MetadataRoute } from "next";

const SITE_URL = "https://www.originalpatosnici.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ks", "/al"],
      /* The admin panel and the JSON api are not content. Letting crawlers walk
         them wastes CDN requests on pages no visitor ever comes from, and puts
         the admin in search results. */
      disallow: ["/admin", "/admin-app", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
