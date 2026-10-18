import type { Metadata } from "next";
import { IntegrationDemo } from "@/components/labs/IntegrationDemo";
import { DetailBreadcrumbs } from "@/components/marketing/DetailBreadcrumbs";
import { LAB_PAGES } from "@/lib/marketing/labs";
import "../labs.css";

const PAGE = LAB_PAGES.integraciones;

export const metadata: Metadata = {
  title: PAGE.meta.title,
  description: PAGE.meta.description,
  alternates: { canonical: "/labs/integraciones" },
  openGraph: {
    title: PAGE.meta.title,
    description: PAGE.meta.description,
    url: "/labs/integraciones",
  },
};

export default function Page() {
  return (
    <div className="lab-page lab-page--detail">
      <DetailBreadcrumbs
        items={[{ label: "Labs", href: "/labs" }, { label: PAGE.crumb }]}
      />
      <div className="m-container">
        <header className="lab-head">
          <p className="m-eyebrow">Demo · Datos ficticios</p>
          <h1 className="lab-h1">{PAGE.title}</h1>
          <p className="lab-lede">{PAGE.subtitle}</p>
        </header>
        <div className="lab-demo-wrap">
          <IntegrationDemo />
        </div>
      </div>
    </div>
  );
}
