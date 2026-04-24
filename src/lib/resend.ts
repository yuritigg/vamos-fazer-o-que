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
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Eventos <no-reply@seu-dominio.com>";

  console.log("[sendEventStatusEmail] RESEND_API_KEY presente:", Boolean(apiKey));
  console.log("[sendEventStatusEmail] RESEND_FROM_EMAIL:", fromEmail);
  console.log("[sendEventStatusEmail] Destinatário:", to, "| status:", status);

  if (!apiKey) {
    console.error("[sendEventStatusEmail] RESEND_API_KEY não configurada — e-mail não enviado.");
    return null;
  }

  const resend = new Resend(apiKey);
  const payload = {
    from: fromEmail,
    to: [to],
    subject: `Seu evento foi ${status}: ${eventTitle}`,
    html: `<p>Olá! O evento <strong>${eventTitle}</strong> foi <strong>${status}</strong> pela moderação.</p>`,
  };

  console.log("[sendEventStatusEmail] Payload:", JSON.stringify({ ...payload, to: payload.to }));

  const result = await resend.emails.send(payload);

  if (result.error) {
    console.error("[sendEventStatusEmail] Erro retornado pelo Resend:", JSON.stringify(result.error));
    throw new Error(`Resend error: ${result.error.message}`);
  }

  console.log("[sendEventStatusEmail] Resposta do Resend:", JSON.stringify(result.data));
  return result;
}
