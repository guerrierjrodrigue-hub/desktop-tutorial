import { APP_NAME, APP_SUPPORT_EMAIL } from "@/lib/constants";

/**
 * Single source of truth for the legal entity behind the app. Fill these in
 * before launch. Leave the "[À COMPLÉTER]" markers until you have the real
 * values: the public pages fall back to safe defaults and never render the
 * marker, so the placeholders stay visible here (as a to-do) and never leak.
 */
export const LEGAL = {
  /** Registered legal name of the operator (person or company). */
  legalName: "[À COMPLÉTER]",
  /** Mailing address of the operator. */
  address: "[À COMPLÉTER]",
  /** Email of the person responsible for the protection of personal information
   *  (Quebec Law 25 privacy officer). */
  privacyEmail: "[À COMPLÉTER]",
  /** Quebec enterprise number (NEQ). Optional; leave empty if none. */
  neq: "",
} as const;

const PLACEHOLDER = "[À COMPLÉTER]";

/** Whether a config value is still a placeholder (or empty). */
export function isPlaceholder(value: string): boolean {
  return !value || value.trim() === "" || value.includes(PLACEHOLDER);
}

export interface ResolvedLegal {
  legalName: string;
  address: string | null;
  privacyEmail: string;
  neq: string | null;
}

/**
 * Public-safe legal values: unfilled fields fall back so the "[À COMPLÉTER]"
 * marker is never shown to users (legal name -> app name, privacy email ->
 * support email, address / NEQ -> omitted).
 */
export function resolvedLegal(): ResolvedLegal {
  return {
    legalName: isPlaceholder(LEGAL.legalName) ? APP_NAME : LEGAL.legalName,
    address: isPlaceholder(LEGAL.address) ? null : LEGAL.address,
    privacyEmail: isPlaceholder(LEGAL.privacyEmail) ? APP_SUPPORT_EMAIL : LEGAL.privacyEmail,
    neq: isPlaceholder(LEGAL.neq) ? null : LEGAL.neq,
  };
}

/** Replace legal placeholders in a block of policy text with public-safe values. */
export function fillLegalPlaceholders(text: string): string {
  const legal = resolvedLegal();
  return text
    .replaceAll("{email}", APP_SUPPORT_EMAIL)
    .replaceAll("{privacyEmail}", legal.privacyEmail)
    .replaceAll("{legalName}", legal.legalName);
}
