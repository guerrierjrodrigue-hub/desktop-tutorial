import Link from "next/link";
import { Flame } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { getCurrentUser } from "@/lib/queries/profile";
import { getNotifications } from "@/lib/queries/notifications";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function Topbar({ title }: { title?: string }) {
  const locale = await getLocale();
  const [currentUser, notifications, dict] = await Promise.all([
    getCurrentUser(),
    getNotifications(),
    getDictionary(locale),
  ]);
  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <Logo showText={false} />
        </div>
        {title && (
          <h1 className="font-serif text-xl font-semibold tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-ember/25 bg-ember/10 px-3 py-1.5 text-sm font-semibold text-ember"
          aria-label={dict["topbar.streakAria"]}
        >
          <Flame className="size-4" />
          {currentUser.streak}
        </span>
        <NotificationsBell initial={notifications} dict={dict} />
        <Link href="/profile" aria-label={dict["topbar.profileAria"]}>
          <Avatar name={currentUser.name} color="var(--color-green)" />
        </Link>
      </div>
    </header>
  );
}
