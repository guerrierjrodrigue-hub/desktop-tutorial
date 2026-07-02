import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./config";

let cached: Stripe | null = null;

/** Lazily-constructed Stripe client. Only call when Stripe is configured. */
export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(STRIPE_SECRET_KEY, {
      typescript: true,
      appInfo: { name: "Kingdom Athlete" },
    });
  }
  return cached;
}
