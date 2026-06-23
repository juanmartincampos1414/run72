import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAdminUser } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Panel RUN72",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
