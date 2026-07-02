export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** Map internal plan ids to Stripe Price IDs (set in env). */
export const STRIPE_PRICES: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
  annual: process.env.STRIPE_PRICE_ANNUAL ?? "",
};

export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_SECRET_KEY);
}

/** Which internal plan a Stripe price id corresponds to (for display). */
export function planForPrice(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  const entry = Object.entries(STRIPE_PRICES).find(([, id]) => id === priceId);
  return entry ? entry[0] : null;
}
