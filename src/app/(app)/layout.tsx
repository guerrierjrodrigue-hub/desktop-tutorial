import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCurrentUser } from "@/lib/queries/profile";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isFreeMode } from "@/lib/flags";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const dict = await getDictionary(locale);
  const freeMode = isFreeMode();

  // Only pass serializable data across the server/client boundary — icons
  // (component references) are resolved client-side from `identities`.
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1400px]">
      <Sidebar identities={user.identities} dict={dict} freeMode={freeMode} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
      </div>
      <MobileNav identities={user.identities} dict={dict} />
    </div>
  );
}
