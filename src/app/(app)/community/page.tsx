import type { Metadata } from "next";
import { PenSquare } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostFeed } from "@/components/community/post-feed";
import { groups } from "@/data/community";

export const metadata: Metadata = {
  title: "Community",
  description: "Groups, testimonies, progress shares, and prayer requests. Iron sharpens iron.",
};

export default function CommunityPage() {
  return (
    <>
      <Topbar title="Community" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title="Community"
          subtitle="Encourage and be encouraged. As iron sharpens iron."
        >
          <Button size="sm">
            <PenSquare className="size-4" /> Share
          </Button>
        </PageHeader>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PostFeed />
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Your groups</CardTitle>
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
                        {g.members.toLocaleString()} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-4 w-full" size="sm">
                Discover groups
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
