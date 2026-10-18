import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { ARTICLES, CATEGORY_LABEL, FEATURED_SLUG, formatArticleDate, type Article } from "@/lib/marketing/articles";
import "./blog.css";

const LEDE = "Guías para evaluar software a medida, agentes e integraciones antes de comprometer un desarrollo.";

export const metadata: Metadata = {
  title: "Blog",
  description: LEDE,
  alternates: { canonical: "/blog" },
};

function Card({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className={`blog-card m-arrow-host${featured ? " blog-card--featured" : ""}`}
    >
      <div className="blog-card-meta">
        <span>{CATEGORY_LABEL[article.category]}</span>
        <time dateTime={article.dateISO}>{formatArticleDate(article.dateISO)}</time>
      </div>
      <h2 className="blog-card-title">{article.title}</h2>
      <p className="blog-card-summary">{article.summary}</p>
      <span className="blog-card-cta">
        Leer guía <AnimatedArrow />
      </span>
    </Link>
  );
}

export default function BlogIndexPage() {
  const featured = ARTICLES.find((a) => a.slug === FEATURED_SLUG) ?? ARTICLES[0];
  const rest = ARTICLES.filter((a) => a.slug !== featured.slug);

  return (
    <div className="blog-page">
      <div className="m-container">
        <header className="blog-head">
          <p className="m-eyebrow">Blog</p>
          <h1 className="blog-h1">Criterios para decidir qué construir.</h1>
          <p className="blog-lede">{LEDE}</p>
        </header>

        <div className="blog-index">
          <Card article={featured} featured />
          <ul className="blog-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {rest.map((a) => (
              <li key={a.slug} style={{ display: "flex" }}>
                <Card article={a} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
