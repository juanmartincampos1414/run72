import type { Metadata } from "next";
import { LeadDetail } from "@/components/admin/LeadDetail";

export const metadata: Metadata = {
  title: "Detalle de lead · RUN72",
  robots: { index: false, follow: false },
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetail leadId={id} />;
}
