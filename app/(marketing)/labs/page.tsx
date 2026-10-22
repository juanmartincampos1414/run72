import type { Metadata } from "next";
import { GradientText } from "@/components/marketing/GradientText";
import { LABS_INDEX } from "@/lib/marketing/labs";
import { LabCards } from "@/components/marketing/labs/LabCards";
import "./labs.css";

export const metadata: Metadata = {
  title: LABS_INDEX.meta.title,
  description: LABS_INDEX.meta.description,
  alternates: { canonical: "/labs" },
  openGraph: {
    title: LABS_INDEX.meta.title,
    description: LABS_INDEX.meta.description,
    url: "/labs",
  },
};

export default function LabsPage() {
  return (
    <div className="lab-page">
      <div className="m-container">
        <header className="lab-head">
          <p className="m-eyebrow">{LABS_INDEX.eyebrow}</p>
          <h1 className="lab-h1">
            {`${LABS_INDEX.h1Lead} `}<GradientText>{LABS_INDEX.h1Accent}</GradientText>
          </h1>
          <p className="lab-lede">{LABS_INDEX.bajada}</p>
        </header>

        <LabCards />
      </div>
    </div>
  );
}
