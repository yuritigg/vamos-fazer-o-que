"use server";

import { revalidatePath } from "next/cache";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getOrganizerByUserId } from "@/lib/supabase/authz";
import { ActionResult } from "@/types/actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createEventAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile) {
    return { ok: false, message: "Faça login para cadastrar um evento." };
  }

  if (profile.role !== "organizador" && !profile.is_admin) {
    return { ok: false, message: "Somente organizadores podem cadastrar eventos." };
  }

  const organizer = await getOrganizerByUserId(user.id);
  if (!organizer) {
    return { ok: false, message: "Seu perfil ainda não possui cadastro de organizador." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const ageRating = String(formData.get("ageRating") ?? "Livre").trim();
  const eventDate = String(formData.get("eventDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  // Address fields
  const street = String(formData.get("street") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const complement = String(formData.get("complement") ?? "").trim();
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const latitude = Number(formData.get("latitude") ?? 0);
  const longitude = Number(formData.get("longitude") ?? 0);

  const addressParts = [street, number, complement, neighborhood].filter(Boolean);
  const address = addressParts.join(", ");

  const file = formData.get("image");

  if (!title || !category || !ageRating || !eventDate || !startTime || !description || !street || !number || !neighborhood || !city || !state) {
    return { ok: false, message: "Preencha todos os campos obrigatórios." };
  }

  const supabase = await createServerSupabaseClient();
  const eventSlug = `${slugify(title)}-${Date.now().toString().slice(-5)}`;

  const { data: createdEvent, error: eventError } = await supabase
    .from("events")
    .insert({
      organizer_id: organizer.id,
      title,
      slug: eventSlug,
      description,
      category,
      age_rating: ageRating,
      event_date: eventDate,
      start_time: startTime,
      city,
      state,
      address,
      latitude: Number.isFinite(latitude) && latitude !== 0 ? latitude : null,
      longitude: Number.isFinite(longitude) && longitude !== 0 ? longitude : null,
      status: "pendente",
    })
    .select("id")
    .single();

  if (eventError || !createdEvent) {
    return { ok: false, message: eventError?.message ?? "Não foi possível criar o evento." };
  }

  if (file instanceof File && file.size > 0) {
    const imageUpload = await uploadFileToCloudinary(file);
    await supabase.from("event_images").insert({
      event_id: createdEvent.id,
      image_url: imageUpload.secure_url,
      cloudinary_public_id: imageUpload.public_id,
      is_cover: true,
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Evento enviado com sucesso! Nossa equipe irá analisar em breve." };
}

export async function createReviewAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user } = await getCurrentUserProfile();
  if (!user) return { ok: false, message: "Faça login para enviar avaliação." };

  const eventId = String(formData.get("eventId") ?? "");
  const eventSlug = String(formData.get("eventSlug") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!eventId || !rating || rating < 1 || rating > 5) {
    return { ok: false, message: "Dados de avaliação inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("reviews").upsert(
    { event_id: eventId, user_id: user.id, rating, comment },
    { onConflict: "event_id,user_id" },
  );

  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  if (eventSlug) revalidatePath(`/eventos/${eventSlug}`);
  return { ok: true, message: "Avaliação enviada com sucesso." };
}

export async function createCommentAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user } = await getCurrentUserProfile();
  if (!user) return { ok: false, message: "Faça login para comentar." };

  const eventId = String(formData.get("eventId") ?? "");
  const eventSlug = String(formData.get("eventSlug") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!eventId || !message) return { ok: false, message: "Comentário inválido." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("event_comments").insert({
    event_id: eventId,
    user_id: user.id,
    message,
  });

  if (error) return { ok: false, message: error.message };

  if (eventSlug) revalidatePath(`/eventos/${eventSlug}`);
  return { ok: true, message: "Comentário enviado com sucesso." };
}
