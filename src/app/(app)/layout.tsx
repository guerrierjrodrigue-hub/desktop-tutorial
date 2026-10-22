import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { XpToaster } from "@/components/gamification/xp-toast";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isFreeMode } from "@/lib/flags";
import { getCurrentUser } from "@/lib/queries/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const [dict, user] = await Promise.all([getDictionary(locale), getCurrentUser()]);
  const freeMode = isFreeMode();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1400px]">
      <Sidebar dict={dict} freeMode={freeMode} primaryActivity={user.primaryActivity} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
      </div>
      <MobileNav dict={dict} />
      <XpToaster />
    </div>
  );
}
