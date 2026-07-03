import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { isStripeConfigured } from "@/lib/stripe/config";
import { getAuthedContext } from "@/lib/supabase/auth";
import { APP_URL } from "@/lib/constants";

/** Open the Stripe billing portal for the signed-in customer. */
export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ url: `${APP_URL}/profile` });
  }

  const ctx = await getAuthedContext();
  if (!ctx) return NextResponse.json({ url: `${APP_URL}/login` });

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", ctx.userId)
    .single();

  const customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return NextResponse.json({ url: `${APP_URL}/pricing` });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
