import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CheckIcon, BoltIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Estado del pago",
  robots: { index: false, follow: false },
};

const COPY = {
  success: {
    icon: "check" as const,
    title: "¡Pago recibido!",
    text: "Confirmamos tu adelanto. Tu proyecto entra a producción y nos ponemos en marcha en las próximas horas.",
  },
  pending: {
    icon: "bolt" as const,
    title: "Pago en proceso",
    text: "Tu pago está siendo procesado. En cuanto se acredite, activamos tu proyecto automáticamente.",
  },
  failure: {
    icon: "bolt" as const,
    title: "No pudimos procesar el pago",
    text: "El pago no se completó. Podés intentarlo nuevamente o usar transferencia bancaria desde el cotizador.",
  },
};

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const key = (status === "success" || status === "pending" || status === "failure"
    ? status
    : "pending") as keyof typeof COPY;
  const c = COPY[key];

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN72 — inicio">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver al sitio
          </Link>
        </div>
      </header>

      <main className="container-x flex min-h-[70vh] items-center justify-center py-14">
        <div className="mx-auto max-w-md text-center">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              key === "success"
                ? "bg-gradient-to-br from-brand-cyan to-brand-violet text-ink glow-violet"
                : key === "failure"
                  ? "border border-red-500/40 text-red-300"
                  : "border border-line text-brand-cyan"
            }`}
          >
            {c.icon === "check" ? (
              <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
            ) : (
              <BoltIcon className="h-7 w-7" />
            )}
          </span>

          <h1 className="mt-6 text-balance font-display text-3xl font-semibold tracking-tight">
            {c.title}
          </h1>
          <p className="mt-3 text-pretty text-muted">{c.text}</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.02]"
            >
              Ir al inicio
            </Link>
            {key === "failure" && (
              <Link
                href="/cotizar"
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                Reintentar
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
