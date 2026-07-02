import Link from "next/link";
import { Bell, Flame } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { getCurrentUser } from "@/lib/queries/profile";

export async function Topbar({ title }: { title?: string }) {
  const currentUser = await getCurrentUser();
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold-bright">
          <Flame className="size-4" />
          {currentUser.streak}
        </span>
        <button
          aria-label="Notifications"
          className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          <Bell className="size-5" />
        </button>
        <Link href="/profile" aria-label="Your profile">
          <Avatar name={currentUser.name} color="var(--color-green)" />
        </Link>
      </div>
    </header>
  );
}
