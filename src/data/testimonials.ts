export interface Testimonial {
  quote: string;
  name: string;
  /** e.g. "Member since 2026 · Lyon" */
  context?: string;
}

/**
 * Member testimonials shown on the landing page.
 *
 * Only add REAL quotes from real members, with their permission to publish
 * them. Never placeholder or invented ones: this is shown to prospects as
 * social proof. The section stays hidden while this list is empty.
 */
export const testimonials: Testimonial[] = [];
