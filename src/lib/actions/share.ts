"use server";

import { signShareParams } from "@/lib/share-signature";

/**
 * Build a signed /api/share-image URL. Signing happens on the server (the key
 * never reaches the client), so only the app can mint shareable brand images.
 */
export async function signedShareImageUrl(input: {
  type: "streak" | "badge" | "verse";
  value: string;
  label?: string;
  text?: string;
}): Promise<string> {
  const params: Record<string, string> = {
    type: input.type,
    value: input.value,
    label: input.label ?? "",
    text: input.text ?? "",
  };
  const sig = signShareParams(params);
  const qs = new URLSearchParams(params);
  if (sig) qs.set("sig", sig);
  return `/api/share-image?${qs.toString()}`;
}

/** Build a signed /api/verse-image URL (ref + verse text). */
export async function signedVerseImageUrl(input: {
  ref: string;
  text: string;
}): Promise<string> {
  const params: Record<string, string> = { ref: input.ref, text: input.text };
  const sig = signShareParams(params);
  const qs = new URLSearchParams(params);
  if (sig) qs.set("sig", sig);
  return `/api/verse-image?${qs.toString()}`;
}
