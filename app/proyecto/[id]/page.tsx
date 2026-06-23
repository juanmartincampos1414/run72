import type { Metadata } from "next";
import { ProjectPreview } from "@/components/preview/ProjectPreview";

export const metadata: Metadata = {
  title: "Vista previa de tu proyecto",
  robots: { index: false, follow: false },
};

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectPreview leadId={id} />;
}
