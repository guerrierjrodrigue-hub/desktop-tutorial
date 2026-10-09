# Kingdom Athlete

**Fortifie ton corps. Grandis dans la foi.**

A production Progressive Web App that unites fitness, nutrition, and faith into
one daily rhythm — guided training, Scripture, prayer, and **Barnabas**, an AI
faith & fitness coach. Bilingual (English / French, with a warm _tutoiement_
voice in French).

It runs on a real backend — **Supabase Auth + Postgres (with row-level
security)**, **Stripe** subscriptions, and the **Anthropic** API for Barnabas —
and still boots with **zero configuration**: with no environment variables it
falls back to a typed mock-data "demo mode" so you can run and explore every
screen locally without any keys.

---

## ✨ Features

- **Auth & accounts** — Supabase Auth (email + Google), session middleware, a
  mandatory 16+/Terms/Privacy consent on sign-up (Québec Law 25).
- **Dashboard** — greeting, verse of the day, today's workout (rest-day aware),
  interactive habits, activity rings, XP / level / streak, badges, daily quests,
  a recommended "7-day plan", and an honest "active vs. recommended" challenge card.
- **Fitness** — program catalog + detail (weeks, days, exercises, sets/reps/rest),
  guided sessions, a weekly plan derived from the user's level / equipment / goals.
- **Nutrition** — computed calorie & macro targets (Mifflin–St Jeor, "estimate,
  not medical advice"), hydration, and a recipe library including local
  Caribbean/Haitian & Québécois dishes (clearly marked as estimates).
- **Spiritual** — a Bible reader (translations, in-chapter search, per-verse
  bookmarks & highlights, "memorize this verse", verse share images), reading
  plans with real day-by-day passages ("Lire aujourd'hui" → mark as read),
  devotionals, verse memorization, and a prayer journal.
- **Barnabas AI coach** — `/api/coach`, real Anthropic responses when a key is
  set and a warm in-voice offline fallback otherwise. Server-built user context,
  per-user conversation memory, a persistent daily message limit, and a crisis
  safety protocol (self-harm / eating disorder / medical → stops coaching and
  points to help; Canada 988 / 911).
- **Community & gamification** — feed (testimonies / progress / prayer), likes,
  groups, XP curve, levels, badges, streaks, leaderboard, and **cohort
  challenges** with a common start date, an invite link (`/join/<code>`) with a
  referral counter, and Web Share story images.
- **Privacy (Law 25)** — from Profile → Confidentialité, **export all your data**
  as JSON (`/api/account/export`) and **delete your account** (type `SUPPRIMER`
  to confirm) — the server action removes the Auth user and all data (ON DELETE
  CASCADE), best-effort deletes the Stripe customer, signs out and redirects home.
- **Payments** — Stripe subscriptions (checkout + trial), webhook → `is_premium`,
  billing portal, premium gating. `APP_FREE_MODE` runs a free-beta where everyone
  is premium and `/pricing` shows a free banner.
- **Admin** — `is_admin`-gated console (KPIs, users, content, payments, logs).
- **Security** — strict response headers + a Content-Security-Policy with a
  violation-report endpoint (`/api/csp-report`); see "Security" below.
- **Observability** — PostHog analytics and Sentry monitoring (both no-op when
  unconfigured).

---

## 🧱 Tech stack

- **Next.js 16** (App Router, React Server Components) + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first `@theme` tokens)
- **Supabase** (`@supabase/ssr`) — Auth + Postgres + RLS
- **Stripe** — subscriptions · **Anthropic** — Barnabas · **Resend** — email
- **PostHog** — analytics · **Sentry** — monitoring · **web-push** — reminders
- **Vitest** (unit) + **Playwright** (E2E)

---

## 🌐 Internationalization

UI language is chosen by the `ka_locale` cookie (`fr` default) and served by
`getLocale()` / `getDictionary()`. `src/i18n/dictionaries/en.ts` is the source of
truth for keys; `fr.ts` must expose exactly the same keys. Two guard tests keep
it honest: key parity + "no French value identical to English" (proper-noun
allowlist), and "no hardcoded `metadata.title` in a page".

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # optional — the app runs with no keys (demo mode)
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint` ·
`npm test` · `npm run e2e`

### Testing
- **Unit** — Vitest (`npm test`): pure helpers (XP/level math, nutrition targets,
  week plan & rest-day streaks, quests, coach safety, cohort dates, reading-plan
  passages, i18n guards, …).
- **E2E** — Playwright (`npm run e2e`): marketing, auth, dashboard, the Barnabas
  coach, a protected-route → `/login` redirect, the `/pricing` free banner, the
  EN/FR toggle, and the 7-day plan. Runs two servers from one build (a demo
  server and a "Supabase-configured-but-unreachable" server for the auth guard);
  specs set an explicit `ka_locale=en` cookie.

---

## 🔌 Backend (Supabase Auth + Postgres)

With no Supabase env vars the app runs on mock data and auth is a demo redirect,
so nothing is required locally. To go live:

```bash
# 1. Create a project at supabase.com, then set in .env.local:
#    NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# 2. Apply the schema, RLS, and seed data:
supabase db reset            # runs supabase/migrations/* then supabase/seed.sql
# 3. In Supabase Auth settings add the redirect URL <site>/auth/callback
#    and enable the Google provider if desired.
```

Migrations live in `supabase/migrations/` (initial schema + RLS through the
latest additive migrations: coach messages, training profile, Bible
bookmarks/highlights, cohorts, local recipes). All user-data tables use
owner-only RLS and FK `ON DELETE CASCADE`, which is what makes account deletion
clean. Regenerate types after schema changes:
`supabase gen types typescript --local > src/types/database.ts`.

---

## 🔒 Security

Security headers are set in `next.config.ts` for every route:
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`,
`Permissions-Policy`, HSTS, and a **Content-Security-Policy** allowlisting the
origins the app uses (Supabase, Stripe, PostHog, Sentry, `bible.helloao.org`,
exercise images). Violations are reported to **`/api/csp-report`** via the
`report-to` / `report-uri` directives.

The CSP ships in **Report-Only** by default and switches to **enforcing** when
`CSP_ENFORCE=1` (reversible by unsetting it). In production this is set to `1`.

---

## 📁 Architecture

```
src/
├─ app/
│  ├─ (auth)/              # login, signup, password reset
│  ├─ (app)/               # authenticated shell: dashboard, fitness, nutrition,
│  │                       # spiritual (+ bible), coach, community, challenges,
│  │                       # habits, journal, focus, profile
│  ├─ (admin)/admin/       # is_admin-gated console
│  ├─ api/                 # coach, stripe/*, account/export, csp-report,
│  │                       # verse-image, share-image
│  ├─ join/[code]/         # cohort invite landing
│  ├─ blog/  pricing/  privacy/  terms/  …   # marketing + legal
│  └─ layout.tsx  globals.css
├─ components/             # ui primitives + feature components
├─ data/                   # typed seed/mock data (demo mode)
├─ i18n/                   # dictionaries (en/fr) + helpers + guard tests
├─ lib/                    # pure helpers, queries (data-access), supabase clients
└─ types/                  # domain model + generated database types
```

Pure logic lives in `lib/*` (unit-tested, no server imports); `lib/queries/*`
is the typed data-access layer with a mock fallback when Supabase is
unconfigured.

---

## 🚢 Deployment

Deployed on Vercel (see `DEPLOYMENT.md` and `vercel.json`). CI runs on GitHub
Actions: **Lint · Typecheck · Test · Build** and **E2E (Playwright)**.

---

*Discipline of body, steadiness of soul.*
