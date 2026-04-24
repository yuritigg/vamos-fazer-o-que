import { Resend } from "resend";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildApprovalHtml(eventTitle: string, eventUrl: string): string {
  const title = escapeHtml(eventTitle);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background-color:#2563EB;padding:28px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Vamos Fazer O Que?</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:26px;font-weight:700;color:#0F172A;line-height:1.3;">
                Parabéns! Seu evento foi aprovado! 🎉
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#475569;line-height:1.7;">
                Ficamos muito felizes em contar que o evento
                <strong style="color:#0F172A;">&ldquo;${title}&rdquo;</strong>
                foi <strong style="color:#16A34A;">aprovado</strong> pela nossa equipe e já está publicado na plataforma para todo mundo ver!
              </p>
              <p style="margin:0 0 32px;font-size:16px;color:#475569;line-height:1.7;">
                Agora qualquer pessoa pode descobrir, se empolgar e se planejar para participar do seu evento. Que comecem as inscrições! 🚀
              </p>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#2563EB;border-radius:8px;">
                    <a href="${eventUrl}"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Ver meu evento publicado &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:#475569;line-height:1.7;">
                Obrigado por escolher o <strong style="color:#0F172A;">Vamos Fazer O Que?</strong> para divulgar seu evento.
                Estamos aqui para conectar pessoas a experiências incríveis — e o seu evento faz parte disso. 💙
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#F1F5F9;padding:20px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;">
                Com carinho,<br>
                <strong style="color:#64748B;">Equipe Vamos Fazer O Que?</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildRejectionHtml(eventTitle: string, rejectionReason: string): string {
  const title = escapeHtml(eventTitle);
  const reason = escapeHtml(rejectionReason);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background-color:#2563EB;padding:28px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Vamos Fazer O Que?</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:24px;font-weight:700;color:#0F172A;line-height:1.3;">
                Uma atualização sobre seu evento
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#475569;line-height:1.7;">
                Olá! Agradecemos muito por submeter o evento
                <strong style="color:#0F172A;">&ldquo;${title}&rdquo;</strong>
                na nossa plataforma. Levamos cada submissão a sério e analisamos com atenção. 💙
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.7;">
                Desta vez, nossa equipe precisou reprovar a publicação — mas isso não significa que seu evento não pode acontecer!
                Você pode ajustar as informações e reenviar a qualquer momento.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#FFFBEB;border-left:4px solid #D97706;border-radius:0 8px 8px 0;padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.6px;">
                      Motivo da reprovação
                    </p>
                    <p style="margin:0;font-size:15px;color:#78350F;line-height:1.6;">${reason}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0F172A;">Como proceder:</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
                <tr>
                  <td style="padding:4px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width:24px;vertical-align:top;color:#2563EB;font-weight:700;font-size:15px;">1.</td>
                        <td style="font-size:15px;color:#475569;line-height:1.6;padding-left:4px;">Revise as informações do evento com base no motivo indicado acima.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width:24px;vertical-align:top;color:#2563EB;font-weight:700;font-size:15px;">2.</td>
                        <td style="font-size:15px;color:#475569;line-height:1.6;padding-left:4px;">Acesse a plataforma e submeta o evento novamente.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width:24px;vertical-align:top;color:#2563EB;font-weight:700;font-size:15px;">3.</td>
                        <td style="font-size:15px;color:#475569;line-height:1.6;padding-left:4px;">Nossa equipe analisará a nova submissão em breve.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:#475569;line-height:1.7;">
                Estamos torcendo para que seu evento aconteça! Se tiver qualquer dúvida, pode entrar em contato conosco. 🤝
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#F1F5F9;padding:20px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;">
                Com carinho,<br>
                <strong style="color:#64748B;">Equipe Vamos Fazer O Que?</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEventStatusEmail({
  to,
  eventTitle,
  eventSlug,
  status,
  rejectionReason,
}: {
  to: string;
  eventTitle: string;
  eventSlug?: string;
  status: "aprovado" | "reprovado";
  rejectionReason?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Eventos <no-reply@seu-dominio.com>";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const eventUrl = eventSlug ? `${siteUrl}/eventos/${eventSlug}` : siteUrl;

  console.log("[sendEventStatusEmail] RESEND_API_KEY presente:", Boolean(apiKey));
  console.log("[sendEventStatusEmail] RESEND_FROM_EMAIL:", fromEmail);
  console.log("[sendEventStatusEmail] Destinatário:", to, "| status:", status);

  if (!apiKey) {
    console.error("[sendEventStatusEmail] RESEND_API_KEY não configurada — e-mail não enviado.");
    return null;
  }

  const isApproved = status === "aprovado";
  const subject = isApproved
    ? `🎉 Seu evento foi aprovado: ${eventTitle}`
    : `Atualização sobre seu evento: ${eventTitle}`;
  const html = isApproved
    ? buildApprovalHtml(eventTitle, eventUrl)
    : buildRejectionHtml(eventTitle, rejectionReason ?? "Não informado.");

  const resend = new Resend(apiKey);
  const payload = { from: fromEmail, to: [to], subject, html };

  console.log("[sendEventStatusEmail] Enviando | subject:", subject, "| eventUrl:", eventUrl);

  const result = await resend.emails.send(payload);

  if (result.error) {
    console.error("[sendEventStatusEmail] Erro retornado pelo Resend:", JSON.stringify(result.error));
    throw new Error(`Resend error: ${result.error.message}`);
  }

  console.log("[sendEventStatusEmail] Resposta do Resend:", JSON.stringify(result.data));
  return result;
}
