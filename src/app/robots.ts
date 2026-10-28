import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

/** Every signed-in / private area. Public marketing pages stay crawlable. */
export const PRIVATE_ROUTES = [
  "/dashboard",
  "/fitness",
  "/nutrition",
  "/focus",
  "/journal",
  "/habits",
  "/spiritual",
  "/community",
  "/challenges",
  "/course",
  "/profile",
  "/admin",
  "/onboarding",
  "/join",
  "/api",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_ROUTES,
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
