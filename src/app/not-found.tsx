import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="font-serif text-7xl font-semibold text-gradient-gold">404</p>
        <h1 className="mt-4 font-serif text-2xl font-semibold">
          This path isn&apos;t on the map
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          “Trust in the Lord with all your heart… and He will make your paths
          straight.” Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/">
            <Button variant="secondary">Go home</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Open dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
