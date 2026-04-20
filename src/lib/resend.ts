import { Resend } from "resend";

export async function sendEventStatusEmail({
  to,
  eventTitle,
  status,
}: {
  to: string;
  eventTitle: string;
  status: "aprovado" | "reprovado";
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Eventos <no-reply@seu-dominio.com>",
    to: [to],
    subject: `Seu evento foi ${status}: ${eventTitle}`,
    html: `<p>Olá! O evento <strong>${eventTitle}</strong> foi <strong>${status}</strong> pela moderação.</p>`,
  });
}
