import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { GradientButton } from "@/components/marketing/GradientButton";
import { SITE } from "@/lib/marketing/content";
import { ARTICLES, CATEGORY_LABEL, formatArticleDate, getArticle } from "@/lib/marketing/articles";
import "../blog.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: `/blog/${article.slug}`,
      publishedTime: article.dateISO,
      authors: [article.author],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${SITE.url}/blog/${article.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.summary,
      datePublished: article.dateISO,
      dateModified: article.dateISO,
      inLanguage: "es-AR",
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: article.author },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  return (
    <div className="blog-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="m-container">
        <article className="blog-article">
          <nav className="blog-crumbs" aria-label="Migas de pan">
            <ol>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>

          <header>
            <div className="blog-article-meta">
              <span>{CATEGORY_LABEL[article.category]}</span>
              <time dateTime={article.dateISO}>{formatArticleDate(article.dateISO)}</time>
              <span>{article.author}</span>
            </div>
            <h1 className="blog-article-h1">{article.title}</h1>
          </header>

          <div className="blog-body">
            {article.body.map((block, i) => {
              if (block.kind === "lead") return <p key={i} className="blog-lead">{block.text}</p>;
              if (block.kind === "h2") return <h2 key={i} className="blog-h2">{block.text}</h2>;
              return <p key={i} className="blog-p">{block.text}</p>;
            })}
          </div>

          <aside className="blog-close" aria-label="Seguir con este tema">
            <h2 className="blog-close-title">Seguir con este tema</h2>
            <p className="blog-p">{article.closing}</p>
            <div className="blog-close-links">
              <GradientButton href={article.related.solutionHref} variant="ghost">
                {article.related.solutionLabel} <AnimatedArrow />
              </GradientButton>
              <GradientButton href={article.related.demoHref} variant="ghost">
                {article.related.demoLabel} <AnimatedArrow />
              </GradientButton>
              <GradientButton href="/contacto">
                Contacto <AnimatedArrow />
              </GradientButton>
            </div>
          </aside>

          <Link href="/blog" className="blog-back">
            Volver al blog
          </Link>
        </article>
      </div>
    </div>
  );
}
