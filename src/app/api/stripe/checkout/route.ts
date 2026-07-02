import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { STRIPE_PRICES, isStripeConfigured } from "@/lib/stripe/config";
import { getAuthedContext } from "@/lib/supabase/auth";
import { APP_URL } from "@/lib/constants";

/** Create a Stripe Checkout session for a subscription plan. */
export async function POST(req: Request) {
  const { plan } = (await req.json().catch(() => ({}))) as { plan?: string };
  const priceId = STRIPE_PRICES[plan ?? "monthly"];

  // Demo mode: no Stripe configured → send the user to the app as if upgraded.
  if (!isStripeConfigured() || !priceId) {
    return NextResponse.json({ url: `${APP_URL}/dashboard?upgraded=demo` });
  }

  const ctx = await getAuthedContext();
  if (!ctx) {
    return NextResponse.json({ url: `${APP_URL}/login?redirect=/pricing` });
  }

  const stripe = getStripe();

  // Reuse an existing Stripe customer if we have one on the profile.
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", ctx.userId)
    .single();

  let customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? undefined,
      metadata: { user_id: ctx.userId },
    });
    customerId = customer.id;
    await ctx.supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", ctx.userId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    allow_promotion_codes: true,
    success_url: `${APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${APP_URL}/pricing?canceled=1`,
    metadata: { user_id: ctx.userId },
  });

  return NextResponse.json({ url: session.url });
}
