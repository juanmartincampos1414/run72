import { formatARS } from "./pricing";
import type { Lead } from "./types";

/**
 * Envío de emails vía Resend. Gated en RESEND_API_KEY: si no está configurada,
 * la función es un no-op (no rompe el flujo de pago).
 * Requiere verificar el dominio en Resend y setear RESEND_FROM (ej "RUN72 <hola@run72.app>").
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM ?? "RUN72 <hola@run72.app>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Email automático de inicio de proyecto (72 horas). */
export async function sendProjectStartedEmail(
  lead: Lead,
  startedAt: Date,
  deliveryAt?: Date,
): Promise<boolean> {
  if (!lead.email) return false;

  const fmt = (d: Date) =>
    d.toLocaleString("es-AR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Argentina/Buenos_Aires",
    });
  const when = fmt(startedAt);
  const delivery = fmt(deliveryAt ?? new Date(startedAt.getTime() + 72 * 60 * 60 * 1000));

  const html = `
  <div style="font-family:system-ui,sans-serif;background:#050505;color:#f5f6f8;padding:32px;border-radius:16px;max-width:560px;margin:auto">
    <h1 style="font-size:24px;margin:0 0 8px">Tu proyecto RUN72 ha comenzado 🚀</h1>
    <p style="color:#9aa0ad;line-height:1.6">
      ${lead.name ? lead.name.split(" ")[0] + ", c" : "C"}onfirmamos tu adelanto de
      <strong style="color:#f5f6f8">${formatARS(lead.deposit_ars)}</strong>.
    </p>
    <div style="background:#0d0d11;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:0 0 6px;color:#9aa0ad;font-size:13px">Proyecto</p>
      <p style="margin:0;font-weight:600">${lead.project_label ?? "Proyecto RUN72"}</p>
      <p style="margin:12px 0 6px;color:#9aa0ad;font-size:13px">Inicio</p>
      <p style="margin:0;font-weight:600">${when}</p>
      <p style="margin:12px 0 6px;color:#9aa0ad;font-size:13px">Entrega estimada (72 h)</p>
      <p style="margin:0;font-weight:600">${delivery}</p>
    </div>
    <p style="font-size:18px;font-weight:600;background:linear-gradient(110deg,#38bdf8,#a855f7);-webkit-background-clip:text;background-clip:text;color:transparent">
      Las 72 horas de ejecución han comenzado.
    </p>
    <p style="color:#6b7180;font-size:12px;margin-top:24px">RUN72 · run72.app</p>
  </div>`;

  return sendEmail({
    to: lead.email,
    subject: "Tu proyecto RUN72 ha comenzado",
    html,
  });
}
