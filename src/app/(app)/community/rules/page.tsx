import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["meta.communityRules"] };
}

export default async function CommunityRulesPage() {
  const dict = await getDictionary(await getLocale());

  const rules = [
    { title: dict["communityRules.rule1Title"], body: dict["communityRules.rule1Body"] },
    { title: dict["communityRules.rule2Title"], body: dict["communityRules.rule2Body"] },
    { title: dict["communityRules.rule3Title"], body: dict["communityRules.rule3Body"] },
    { title: dict["communityRules.rule4Title"], body: dict["communityRules.rule4Body"] },
  ];

  return (
    <>
      <Topbar title={dict["communityRules.title"]} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/community"
          className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> {dict["community.title"]}
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-bright">
            <Shield className="size-5" />
          </span>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            {dict["communityRules.title"]}
          </h1>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{dict["communityRules.intro"]}</p>

        <div className="mt-5 space-y-3">
          {rules.map((rule, i) => (
            <Card key={i}>
              <h2 className="font-serif text-lg font-semibold leading-tight">
                {i + 1}. {rule.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">{rule.body}</p>
            </Card>
          ))}
        </div>

        <p className="mt-5 rounded-xl border border-border bg-surface-2 p-4 text-sm leading-relaxed text-muted">
          {dict["communityRules.enforcement"]}
        </p>
      </main>
    </>
  );
}
