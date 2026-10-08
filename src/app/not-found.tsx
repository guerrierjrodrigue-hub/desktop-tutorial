import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const dict = await getDictionary(await getLocale());
  return (
    <div className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="font-serif text-7xl font-semibold text-gradient-gold">404</p>
        <h1 className="mt-4 font-serif text-2xl font-semibold">{dict["notFound.heading"]}</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">{dict["notFound.body"]}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/">
            <Button variant="secondary">{dict["notFound.goHome"]}</Button>
          </Link>
          <Link href="/dashboard">
            <Button>{dict["notFound.openDashboard"]}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
