import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import robots, { PRIVATE_ROUTES } from "@/app/robots";
import { blogPosts } from "@/data/blog";
import en from "@/i18n/dictionaries/en";
import fr from "@/i18n/dictionaries/fr";
import { APP_URL } from "@/lib/constants";

const PUBLIC_PATHS = [
  "", "/pricing", "/about", "/help", "/contact", "/blog",
  "/privacy", "/terms", "/cookies", "/careers",
];

// Page file (relative to src/app) -> its canonical path.
const PUBLIC_PAGES: Record<string, string> = {
  "page.tsx": "/",
  "pricing/page.tsx": "/pricing",
  "about/page.tsx": "/about",
  "help/page.tsx": "/help",
  "contact/page.tsx": "/contact",
  "blog/page.tsx": "/blog",
  "blog/[slug]/page.tsx": "/blog/",
  "privacy/page.tsx": "/privacy",
  "terms/page.tsx": "/terms",
  "cookies/page.tsx": "/cookies",
  "careers/page.tsx": "/careers",
};

const DESCRIPTION_KEYS = [
  "mkt.pricingPage.metaDescription",
  "mkt.about.metaDescription",
  "mkt.help.metaDescription",
  "mkt.contact.metaDescription",
  "mkt.privacy.metaDescription",
  "mkt.terms.metaDescription",
  "mkt.cookies.metaDescription",
  "mkt.careers.metaDescription",
  "mkt.blog.metaDescription",
] as const;

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("lists every public page", () => {
    for (const path of PUBLIC_PATHS) {
      expect(urls, `missing ${path}`).toContain(`${APP_URL}${path}`);
    }
  });

  it("lists every blog article", () => {
    for (const post of blogPosts) {
      expect(urls, `missing /blog/${post.slug}`).toContain(`${APP_URL}/blog/${post.slug}`);
    }
  });

  it("does not expose any private route", () => {
    for (const url of urls) {
      for (const priv of PRIVATE_ROUTES) {
        expect(url.startsWith(`${APP_URL}${priv}`)).toBe(false);
      }
    }
  });
});

describe("robots", () => {
  const rules = robots().rules as { disallow?: string[] };

  it("blocks every private area", () => {
    const expected = [
      "/dashboard", "/fitness", "/nutrition", "/focus", "/journal", "/habits",
      "/spiritual", "/community", "/challenges", "/course", "/profile",
      "/admin", "/onboarding", "/join", "/api",
    ];
    for (const route of expected) {
      expect(rules.disallow, `robots must block ${route}`).toContain(route);
    }
  });
});

describe("meta descriptions are 120-155 chars (home <= 160)", () => {
  for (const key of DESCRIPTION_KEYS) {
    it(`${key} (en + fr)`, () => {
      for (const [label, dict] of [["en", en], ["fr", fr]] as const) {
        const v = (dict as Record<string, string>)[key];
        expect(v, `${label} ${key} missing`).toBeTruthy();
        expect(v.length, `${label} ${key} = ${v.length}`).toBeGreaterThanOrEqual(120);
        expect(v.length, `${label} ${key} = ${v.length}`).toBeLessThanOrEqual(155);
      }
    });
  }

  it("home description is within 120-160", () => {
    for (const dict of [en, fr] as const) {
      const v = (dict as Record<string, string>)["mkt.meta.homeDescription"];
      expect(v.length).toBeGreaterThanOrEqual(120);
      expect(v.length).toBeLessThanOrEqual(160);
    }
  });
});

describe("every public page sets a canonical link", () => {
  const appDir = join(process.cwd(), "src", "app");
  for (const [file, canonical] of Object.entries(PUBLIC_PAGES)) {
    it(`${file} -> ${canonical}`, () => {
      const src = readFileSync(join(appDir, file), "utf8");
      expect(src.includes("canonical"), `${file} has no canonical`).toBe(true);
    });
  }
});
