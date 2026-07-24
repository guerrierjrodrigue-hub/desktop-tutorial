"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

/**
 * Route-segment error boundary. Reports the error to Sentry and shows a calm,
 * on-brand recovery screen instead of a raw crash. Covers render/data errors in
 * any route that doesn't declare its own closer boundary.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="font-serif text-6xl font-semibold text-gradient-gold">
          Take heart
        </p>
        <h1 className="mt-4 font-serif text-2xl font-semibold">
          Something went wrong on our end
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          “Be still, and know that I am God.” We hit an unexpected error — give it
          another try, or head back to steady ground.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/dashboard">
            <Button variant="secondary">Open dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
