import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { PostFeed } from "@/components/community/post-feed";
import { GroupsPanel } from "@/components/community/groups-panel";
import { getCommunityPosts, getGroups } from "@/lib/queries/community";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Community",
  description: "Groups, testimonies, progress shares, and prayer requests. Iron sharpens iron.",
};

export default async function CommunityPage() {
  const locale = await getLocale();
  const [posts, groups, dict] = await Promise.all([
    getCommunityPosts(),
    getGroups(),
    getDictionary(locale),
  ]);

  return (
    <>
      <Topbar title="Community" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader title={dict["community.title"]} subtitle={dict["community.subtitle"]} />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PostFeed initial={posts} dict={dict} />
          </div>

          <div className="space-y-5">
            <GroupsPanel initial={groups} dict={dict} />
          </div>
        </div>
      </main>
    </>
  );
}
