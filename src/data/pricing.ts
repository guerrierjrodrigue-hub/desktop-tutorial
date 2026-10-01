import type { DictionaryKey } from "@/i18n/dictionaries/en";

/** Plan structure; all display text lives in the i18n dictionaries. */
export interface Plan {
  plan: "free" | "monthly" | "annual";
  /** Price in USD, or null for the free tier. */
  priceUsd: number | null;
  nameKey: DictionaryKey;
  descriptionKey: DictionaryKey;
  featureKeys: DictionaryKey[];
  ctaKey: DictionaryKey;
  highlighted: boolean;
}

export const plans: Plan[] = [
  {
    plan: "free",
    priceUsd: null,
    nameKey: "mkt.plan.seeker.name",
    descriptionKey: "mkt.plan.seeker.description",
    featureKeys: [
      "mkt.plan.seeker.feature1",
      "mkt.plan.seeker.feature2",
      "mkt.plan.seeker.feature3",
      "mkt.plan.seeker.feature4",
    ],
    ctaKey: "mkt.plan.seeker.cta",
    highlighted: false,
  },
  {
    plan: "monthly",
    priceUsd: 9,
    nameKey: "mkt.plan.disciple.name",
    descriptionKey: "mkt.plan.disciple.description",
    featureKeys: [
      "mkt.plan.disciple.feature1",
      "mkt.plan.disciple.feature2",
      "mkt.plan.disciple.feature3",
      "mkt.plan.disciple.feature4",
      "mkt.plan.disciple.feature5",
    ],
    ctaKey: "mkt.plan.disciple.cta",
    highlighted: true,
  },
  {
    plan: "annual",
    priceUsd: 79,
    nameKey: "mkt.plan.legacy.name",
    descriptionKey: "mkt.plan.legacy.description",
    featureKeys: [
      "mkt.plan.legacy.feature1",
      "mkt.plan.legacy.feature2",
      "mkt.plan.legacy.feature3",
      "mkt.plan.legacy.feature4",
    ],
    ctaKey: "mkt.plan.legacy.cta",
    highlighted: false,
  },
];
