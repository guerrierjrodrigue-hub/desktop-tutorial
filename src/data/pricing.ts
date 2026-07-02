export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const plans: Plan[] = [
  {
    name: "Seeker",
    price: "Free",
    period: "",
    description: "Start the journey and build the habit.",
    features: [
      "3 starter programs",
      "Daily verse & devotional",
      "Basic habit tracking",
      "Community access",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Disciple",
    price: "$9",
    period: "/mo",
    description: "The full Kingdom Athlete experience.",
    features: [
      "All programs & content",
      "Barnabas AI coach (unlimited)",
      "Nutrition & macro tools",
      "Reading plans & memory verses",
      "Advanced insights & badges",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Legacy",
    price: "$79",
    period: "/yr",
    description: "Best value — commit for the year.",
    features: [
      "Everything in Disciple",
      "2 months free",
      "Early access to new programs",
      "Exclusive challenges",
    ],
    cta: "Go annual",
    highlighted: false,
  },
];
