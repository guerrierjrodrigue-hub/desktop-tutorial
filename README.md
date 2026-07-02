# Kingdom Athlete

**Strengthen Your Body. Grow Your Faith.**

A premium Progressive Web App that unites fitness, nutrition, and faith into one
daily rhythm — guided training, Scripture, prayer, and **Barnabas**, an AI faith
& fitness coach.

> This repository contains a fully working, production-grade **frontend
> foundation**. Every screen runs today on a typed mock-data layer, architected
> so real backends (Supabase, Stripe, OpenAI) drop in behind clean interfaces
> without touching the UI.

---

## ✨ What's built

| Area | Status | Notes |
|------|--------|-------|
| Design system | ✅ | Dark-by-default brand (black / gold / deep-green / bronze), Fraunces + Inter, glass surfaces, ambient glow, reduced-motion support |
| UI primitives | ✅ | Button, Card, Badge, Progress, Ring, Avatar, Icon, Reveal |
| Marketing landing | ✅ | Animated hero, features, Barnabas section, testimonial, pricing, CTA |
| Auth screens | ✅ | Login / signup with Google + Apple + email (UI; wire to Supabase Auth) |
| Dashboard | ✅ | Verse & prayer of the day, today's workout, interactive habits, activity rings, XP/level/streak, badges, active challenge |
| Fitness | ✅ | Program catalog + program detail (weeks, days, exercises, sets/reps/rest) |
| Nutrition | ✅ | Calorie ring, macro bars, hydration tracker, recipe library |
| Spiritual | ✅ | Devotional, reading plans, verse memorization, prayer journal |
| Barnabas AI coach | ✅ | Live chat via `/api/coach` — real OpenAI when a key is set, warm in-voice offline fallback otherwise |
| Gamification | ✅ | XP curve, levels, badges, streaks, challenges, leaderboard |
| Community | ✅ | Feed with testimonies / progress / prayer, likes, groups |
| Profile | ✅ | Stats, level progress, details, achievements, premium upsell |
| PWA / SEO | ✅ | Web manifest, icons, metadata, Open Graph, sitemap, robots |

Verified: `npm run build` (25 routes, all prerendered), `npm run lint`, and a
runtime smoke test of every route + the coach API all pass.

---

## 🧱 Tech stack

- **Next.js 16** (App Router, React 19, Server Components) + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first `@theme` tokens)
- **Framer Motion** — entrance & micro-interactions
- **Lucide** — icons
- `class-variance-authority`, `clsx`, `tailwind-merge` — component variants

## 📁 Architecture

```
src/
├─ app/
│  ├─ (auth)/            # login, signup — split-screen brand layout
│  ├─ (app)/             # authenticated shell: sidebar + mobile nav
│  │  ├─ dashboard/  fitness/[programId]/  nutrition/
│  │  ├─ spiritual/  coach/  community/  challenges/  profile/
│  │  └─ loading.tsx     # skeleton for the app section
│  ├─ api/coach/         # Barnabas endpoint (OpenAI or offline fallback)
│  ├─ page.tsx           # marketing landing
│  ├─ pricing/           # standalone pricing + FAQ
│  ├─ manifest.ts  sitemap.ts  robots.ts  not-found.tsx
│  └─ layout.tsx  globals.css   # fonts, metadata, design tokens
├─ components/
│  ├─ ui/                # atomic primitives
│  ├─ brand/  layout/  marketing/  dashboard/  fitness/
│  ├─ community/  coach/  auth/
├─ data/                 # typed mock data (swap for Supabase queries)
├─ lib/                  # utils, constants, nav config, Barnabas persona
└─ types/                # domain model — the contract between UI and backend
```

**Separation of concerns:** components render; `data/` provides content; `lib/`
holds logic; `types/` is the single source of truth for shapes. Replacing mock
data with Supabase means changing `data/` and the API routes only.

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # optional — app runs without any keys
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`

### Barnabas AI coach
Set `OPENAI_API_KEY` in `.env.local` to enable real responses. Without it, the
`/api/coach` route returns thoughtful, on-brand fallback replies so the coach
always works in demos. The persona and guardrails live in `src/lib/barnabas.ts`.

---

## 🗺️ Integration roadmap (next phases)

The UI is intentionally decoupled so these slot in cleanly:

1. **Supabase** — Auth (Google/Apple/email), Postgres schema with RLS for the
   domain in `src/types`, Storage for avatars/media, Edge Functions. Replace the
   `src/data/*` modules with typed queries.
2. **Stripe** — subscriptions (Seeker / Disciple / Legacy from `src/data/pricing.ts`),
   checkout + webhook to flip `UserProfile.isPremium`, gate premium programs.
3. **OpenAI** — already wired in `/api/coach`; add streaming responses.
4. **Firebase** — push notifications for streak reminders & prayer prompts.
5. **Resend** — transactional & devotional emails.
6. **PostHog + Sentry** — analytics and error monitoring.
7. **Testing** — Vitest (unit) + Playwright (E2E; Chromium is preinstalled here).
8. **Content** — real Bible API, program videos, expanded reading plans.

---

## 🎨 Design principles

Power, discipline, and peace. Dark by default. Every screen has motion, loading
skeletons, empty/answered states, and accessible, keyboard-friendly controls.

*Discipline of body, steadiness of soul.*
