import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { STRIPE_WEBHOOK_SECRET, isStripeConfigured } from "@/lib/stripe/config";
import {
  createSupabaseAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";

/** Stripe webhook: keep `profiles` subscription state in sync with Stripe. */
export async function POST(req: Request) {
  if (!isStripeConfigured() || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true, skipped: "stripe-unconfigured" });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? "",
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!isAdminClientConfigured()) {
    // Verified the event but cannot persist without the service role.
    return NextResponse.json({ received: true, skipped: "no-service-role" });
  }
  const admin = createSupabaseAdminClient();

  async function syncByCustomer(
    customerId: string,
    fields: Record<string, unknown>,
  ) {
    await admin
      .from("profiles")
      .update(fields)
      .eq("stripe_customer_id", customerId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await applySubscription(syncByCustomer, sub);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      await applySubscription(syncByCustomer, event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await syncByCustomer(sub.customer as string, {
        is_premium: false,
        subscription_status: "canceled",
        stripe_subscription_id: null,
      });
      break;
    }
    default:
      break;
  }

  // Best-effort audit log (ignore duplicates via unique stripe_event_id).
  await admin
    .from("billing_events")
    .insert({ stripe_event_id: event.id, type: event.type });

  return NextResponse.json({ received: true });
}

type Syncer = (
  customerId: string,
  fields: Record<string, unknown>,
) => Promise<void>;

async function applySubscription(sync: Syncer, sub: Stripe.Subscription) {
  const active = sub.status === "active" || sub.status === "trialing";
  const item = sub.items.data[0];
  await sync(sub.customer as string, {
    is_premium: active,
    subscription_status: sub.status,
    stripe_subscription_id: sub.id,
    subscription_price_id: item?.price.id ?? null,
    current_period_end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  });
}
