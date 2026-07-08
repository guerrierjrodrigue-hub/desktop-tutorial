import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostFeed } from "@/components/community/post-feed";
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
            <Card>
              <CardHeader>
                <CardTitle>{dict["community.yourGroups"]}</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3"
                  >
                    <span className="grid size-10 place-items-center rounded-lg bg-elevated text-lg">
                      {g.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{g.name}</p>
                      <p className="text-xs text-faint">
                        {g.members.toLocaleString()} {dict["community.members"]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-4 w-full" size="sm">
                {dict["community.discoverGroups"]}
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
