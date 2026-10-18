import type { Metadata } from "next";
import { OperationDemo } from "@/components/labs/OperationDemo";
import { DetailBreadcrumbs } from "@/components/marketing/DetailBreadcrumbs";
import { LAB_PAGES } from "@/lib/marketing/labs";
import "../labs.css";

const PAGE = LAB_PAGES.operacion;

export const metadata: Metadata = {
  title: PAGE.meta.title,
  description: PAGE.meta.description,
  alternates: { canonical: "/labs/operacion" },
  openGraph: {
    title: PAGE.meta.title,
    description: PAGE.meta.description,
    url: "/labs/operacion",
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
          <OperationDemo />
        </div>
      </div>
    </div>
  );
}
