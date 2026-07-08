import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { blogPosts, getBlogPost } from "@/data/blog";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return { title: post?.title ?? "Blog", description: post?.excerpt };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-6 pb-24 pt-16">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
            >
              <ChevronLeft className="size-4" /> Back to blog
            </Link>

            <p className="mt-6 text-xs text-faint">
              {formatDate(post.date)} · {post.readMinutes} min read · {post.author}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
              {post.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
