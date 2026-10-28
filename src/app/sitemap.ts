import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";
import { blogPosts } from "@/data/blog";

/** Every public, indexable page. Private app routes are excluded (see robots). */
const PUBLIC_ROUTES = [
  "",
  "/pricing",
  "/about",
  "/help",
  "/contact",
  "/blog",
  "/privacy",
  "/terms",
  "/cookies",
  "/careers",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    ...PUBLIC_ROUTES,
    ...blogPosts.map((post) => `/blog/${post.slug}`),
  ];
  return routes.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route.startsWith("/blog/") ? 0.5 : 0.7,
  }));
}
