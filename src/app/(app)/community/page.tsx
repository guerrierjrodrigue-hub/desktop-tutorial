import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { PostFeed } from "@/components/community/post-feed";
import { GroupsPanel } from "@/components/community/groups-panel";
import { getCommunityPosts, getGroups } from "@/lib/queries/community";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { timed } from "@/lib/perf";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.community"],
    description: "Groups, testimonies, progress shares, and prayer requests. Iron sharpens iron.",
  };
}

export default async function CommunityPage() {
  const locale = await getLocale();
  const [posts, groups, dict] = await timed("community", () =>
    Promise.all([getCommunityPosts(), getGroups(), getDictionary(locale)]),
  );

  return (
    <>
      <Topbar title="Community" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <PageHeader title={dict["community.title"]} subtitle={dict["community.subtitle"]} />
          <Link
            href="/community/rules"
            className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-accent/30 hover:text-foreground"
          >
            <Shield className="size-3.5" /> {dict["community.rulesLink"]}
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PostFeed initial={posts} dict={dict} />
          </div>

          <div className="space-y-5">
            <GroupsPanel initial={groups} dict={dict} locale={locale} />
          </div>
        </div>
      </main>
    </>
  );
}
