import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCurrentUser } from "@/lib/queries/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Only pass serializable data across the server/client boundary — icons
  // (component references) are resolved client-side from `identities`.
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1400px]">
      <Sidebar identities={user.identities} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {children}
      </div>
      <MobileNav identities={user.identities} />
    </div>
  );
}
