import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";

interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="neutral">Legal</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-faint">Last updated {updated}</p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Reveal className="glass rounded-2xl border border-gold/20 bg-gold/5 p-5 text-sm text-muted">
            This is placeholder legal content written for demo purposes. Replace
            it with policies reviewed by a qualified lawyer before using this
            for real users.
          </Reveal>

          <Reveal delay={0.05} className="mt-6 text-sm leading-relaxed text-muted">
            <p>{intro}</p>
          </Reveal>

          <div className="mt-8 space-y-8">
            {sections.map((s, i) => (
              <Reveal key={s.heading} delay={0.05 + i * 0.03}>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  {s.heading}
                </h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
