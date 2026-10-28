"use client";

import Script from "next/script";

/**
 * Cloudflare Turnstile widget, rendered only when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set. The implicit-render script injects a hidden `cf-turnstile-response`
 * input into the surrounding <form>, which the server action verifies. When the
 * key is absent this renders nothing, so local and demo setups are unaffected.
 */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" />
    </>
  );
}
