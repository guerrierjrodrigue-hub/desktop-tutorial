import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Reflections on training, discipline, and faith from the Kingdom Athlete team.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">The blog</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Training notes for body and soul
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              Practical reflections on discipline, nutrition, and faith from
              the team building Kingdom Athlete.
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="space-y-5">
            {blogPosts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.05}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <article className="glass rounded-2xl border border-border p-6 transition hover:border-gold/30 sm:p-8">
                    <p className="text-xs text-faint">
                      {formatDate(post.date)} · {post.readMinutes} min read · {post.author}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-semibold transition group-hover:text-gold-bright">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-bright">
                      Read more
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
