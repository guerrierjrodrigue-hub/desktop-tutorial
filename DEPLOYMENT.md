# Deploying Kingdom Athlete

This takes a demo-mode app to a live product. Budget ~30 minutes. Nothing here
is required to run locally — the app works with zero configuration; these steps
only activate the real backends.

Order matters: **Supabase → Stripe → OpenAI → Vercel**.

---

## 0. Prerequisites

- A GitHub repo with this code (already pushed).
- Accounts: [Supabase](https://supabase.com), [Stripe](https://stripe.com),
  [OpenAI](https://platform.openai.com), [Vercel](https://vercel.com).
- The [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`).

---

## 1. Supabase — database & auth

1. **Create a project** at supabase.com. Note the project ref.
2. **Apply schema, RLS, and seed data:**
   ```bash
   supabase link --project-ref <your-ref>
   supabase db push          # applies supabase/migrations/*
   supabase db execute --file supabase/seed.sql
   ```
   (Or paste each file into the SQL editor in order: `0001` → `0002` → `0003`
   → `seed.sql`.)
3. **Auth providers** — Authentication → Providers:
   - Enable **Email**.
   - Enable **Google** and **Apple** (add each provider's client id/secret).
   - Authentication → URL Configuration → **Redirect URLs**: add
     `https://<your-domain>/auth/callback` (and
     `http://localhost:3000/auth/callback` for local testing).
4. **Grab keys** — Project Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by the
     Stripe webhook — never expose to the client)
5. **Make yourself an admin** (for `/admin`): after signing up once, run in the
   SQL editor:
   ```sql
   update profiles set is_admin = true where email = 'you@example.com';
   ```
6. **Regenerate types** (recommended, replaces the hand-written stub):
   ```bash
   supabase gen types typescript --linked > src/types/database.ts
   ```

---

## 2. Stripe — subscriptions

1. **Create two recurring Prices** (Products → Add product):
   - Disciple — $9 / month → copy the price id → `STRIPE_PRICE_MONTHLY`
   - Legacy — $79 / year → copy the price id → `STRIPE_PRICE_ANNUAL`
2. **API key** — Developers → API keys → Secret key → `STRIPE_SECRET_KEY`.
   Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. **Webhook** — Developers → Webhooks → Add endpoint:
   - URL: `https://<your-domain>/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.
4. **Billing portal** — Settings → Billing → Customer portal → enable it.

Local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 3. Anthropic — Barnabas coach

Create an API key at [console.anthropic.com](https://console.anthropic.com) →
`ANTHROPIC_API_KEY`. Without it, `/api/coach` falls back to warm offline
replies — the coach still works, just scripted.

---

## 4. Vercel — deploy

1. **Import** the GitHub repo into Vercel. Framework autodetects as Next.js
   (see `vercel.json`).
2. **Environment variables** — add all of the below (Production + Preview):

   | Variable | Source |
   |----------|--------|
   | `NEXT_PUBLIC_APP_URL` | your production URL, e.g. `https://kingdomathlete.app` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (secret) |
   | `ANTHROPIC_API_KEY` | Anthropic |
   | `STRIPE_SECRET_KEY` | Stripe |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
   | `STRIPE_PRICE_MONTHLY` | Stripe price id |
   | `STRIPE_PRICE_ANNUAL` | Stripe price id |
   | `NEXT_PUBLIC_POSTHOG_KEY` | optional (analytics) |
   | `NEXT_PUBLIC_POSTHOG_HOST` | optional, e.g. `https://us.i.posthog.com` |
   | `NEXT_PUBLIC_SENTRY_DSN` | optional (monitoring) |
   | `RESEND_API_KEY` | optional (email) |

3. **Deploy.** Then update:
   - Supabase redirect URL → your real Vercel domain + `/auth/callback`
   - Stripe webhook URL → your real domain + `/api/stripe/webhook`

---

## 5. Post-deploy smoke test

- [ ] Sign up with email, confirm a profile row appears in `profiles`.
- [ ] Google/Apple sign-in round-trips through `/auth/callback`.
- [ ] Log a habit / prayer / post → row appears in Supabase (RLS-scoped).
- [ ] Start checkout → Stripe test card `4242 4242 4242 4242` → webhook flips
      `is_premium = true` → premium program unlocks.
- [ ] Billing portal opens from the profile.
- [ ] `/admin` is reachable for your admin user, redirects others.
- [ ] Barnabas returns live responses.

---

## CI

`.github/workflows/ci.yml` runs lint, typecheck, unit tests, and a production
build on every push and PR — in demo mode, so no secrets are needed in CI.
