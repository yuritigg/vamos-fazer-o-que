"use server";

import { revalidatePath } from "next/cache";
import { sendEventStatusEmail } from "@/lib/resend";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/supabase/authz";
import { ActionResult } from "@/types/actions";

export async function moderateEvent({
  eventId,
  status,
  rejectionReason,
}: {
  eventId: string;
  status: "aprovado" | "reprovado";
  rejectionReason?: string;
}) {
  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile || (!profile.is_admin && profile.role !== "admin")) {
    return { error: "Apenas administradores podem moderar eventos." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("id, title, organizers (users (id, email))")
    .eq("id", eventId)
    .single();

  if (eventError || !eventData) {
    return { error: "Evento não encontrado." };
  }

  const { error: updateError } = await supabase
    .from("events")
    .update({
      status,
      rejection_reason: status === "reprovado" ? rejectionReason ?? "Não informado." : null,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (updateError) {
    return { error: updateError.message };
  }

  const organizerRelation = Array.isArray(eventData.organizers) ? eventData.organizers[0] : null;
  const organizerUser = Array.isArray(organizerRelation?.users) ? organizerRelation.users[0] : null;
  const organizerUserId = organizerUser?.id;
  const organizerEmail = organizerUser?.email;
  if (organizerUserId) {
    await supabase.from("notifications").insert({
      user_id: organizerUserId,
      event_id: eventId,
      type: status === "aprovado" ? "evento_aprovado" : "evento_reprovado",
      title: `Evento ${status}`,
      body:
        status === "aprovado"
          ? `Seu evento "${eventData.title}" foi aprovado.`
          : `Seu evento "${eventData.title}" foi reprovado.`,
      sent_via_email: Boolean(organizerEmail),
    });

    if (organizerEmail) {
      await sendEventStatusEmail({
        to: organizerEmail,
        eventTitle: eventData.title,
        status,
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

export async function deleteEventAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile || (!profile.is_admin && profile.role !== "admin")) {
    return { ok: false, message: "Apenas administradores podem excluir eventos." };
  }

  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { ok: false, message: "ID do evento inválido." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Evento excluído com sucesso." };
}

export async function moderateEventFromForm(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const eventId = String(formData.get("eventId") ?? "");
  const status = String(formData.get("status") ?? "") as "aprovado" | "reprovado";

  if (!eventId || (status !== "aprovado" && status !== "reprovado")) {
    return { ok: false, message: "Dados inválidos para moderação." };
  }

  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();

  if (status === "reprovado" && !rejectionReason) {
    return { ok: false, message: "Informe o motivo da reprovação." };
  }

  const result = await moderateEvent({
    eventId,
    status,
    rejectionReason,
  });

  if ("error" in result && result.error) {
    return { ok: false, message: result.error };
  }

  return {
    ok: true,
    message: status === "aprovado" ? "Evento aprovado com sucesso." : "Evento reprovado com sucesso.",
  };
}
