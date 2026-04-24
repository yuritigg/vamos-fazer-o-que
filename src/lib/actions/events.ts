"use server";

import { revalidatePath } from "next/cache";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
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

  const isAdmin = profile.is_admin || profile.role === "admin";

  if (profile.role !== "organizador" && !isAdmin) {
    return { ok: false, message: "Somente organizadores podem cadastrar eventos." };
  }

  let organizer = await getOrganizerByUserId(user.id);

  if (!organizer && isAdmin) {
    const supa = await createServerSupabaseClient();
    const { data } = await supa
      .from("organizers")
      .insert({ user_id: user.id, display_name: profile.full_name ?? "Administrador" })
      .select("id, display_name")
      .single();
    organizer = data;
  }

  if (!organizer) {
    return { ok: false, message: "Seu perfil ainda não possui cadastro de organizador." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const ageRating = String(formData.get("ageRating") ?? "Livre").trim();
  const eventDate = String(formData.get("eventDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const description = String(formData.get("description") ?? "").trim();

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

  const localNome = String(formData.get("localNome") ?? "").trim();
  const vinculo = String(formData.get("vinculo") ?? "").trim();
  const tipoPreco = String(formData.get("tipoPreco") ?? "gratuito");
  const precoRaw = String(formData.get("preco") ?? "").replace(",", ".");
  const preco = tipoPreco === "pago" && precoRaw ? parseFloat(precoRaw) : null;
  const outdoorIndoor = String(formData.get("outdoorIndoor") ?? "").trim();
  const modalidadeEsportiva = String(formData.get("modalidadeEsportiva") ?? "").trim();
  const nivelCompetitivo = String(formData.get("nivelCompetitivo") ?? "").trim();

  let servicos: string[] = [];
  try {
    servicos = JSON.parse(String(formData.get("servicos") ?? "[]"));
  } catch {
    servicos = [];
  }

  const file = formData.get("image");

  if (!title || !category || !ageRating || !eventDate || !startTime || !description || !street || !number || !neighborhood || !city || !state) {
    return { ok: false, message: "Preencha todos os campos obrigatórios." };
  }

  if (tipoPreco === "pago" && (!preco || preco <= 0)) {
    return { ok: false, message: "Informe um preço válido maior que zero." };
  }

  let coverImageUrl: string | null = null;
  let cloudinaryPublicId: string | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      const imageUpload = await uploadFileToCloudinary(file);
      coverImageUrl = imageUpload.secure_url;
      cloudinaryPublicId = imageUpload.public_id;
    } catch (err) {
      console.error("Falha no upload da imagem para o Cloudinary:", err);
    }
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
      cover_image_url: coverImageUrl,
      local_nome: localNome || null,
      vinculo: vinculo || null,
      preco: preco,
      outdoor_indoor: outdoorIndoor || null,
      modalidade_esportiva: modalidadeEsportiva || null,
      nivel_competitivo: nivelCompetitivo || null,
      servicos: servicos.length > 0 ? servicos : null,
    })
    .select("id")
    .single();

  if (eventError || !createdEvent) {
    return { ok: false, message: eventError?.message ?? "Não foi possível criar o evento." };
  }

  if (coverImageUrl && cloudinaryPublicId) {
    try {
      const adminSupabase = createAdminSupabaseClient();
      const { error: imgInsertError } = await adminSupabase.from("event_images").insert({
        event_id: createdEvent.id,
        image_url: coverImageUrl,
        cloudinary_public_id: cloudinaryPublicId,
        is_cover: true,
      });
      if (imgInsertError) console.error("Erro ao salvar event_images:", imgInsertError.message);
    } catch (err) {
      console.error("Erro ao salvar event_images (SUPABASE_SERVICE_ROLE_KEY configurada?):", err);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Evento enviado para aprovação! Nossa equipe irá analisar as informações e você será notificado em breve." };
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

export async function deleteReviewAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile) return { ok: false, message: "Não autorizado." };

  const isAdmin = profile.is_admin || profile.role === "admin";
  if (!isAdmin) return { ok: false, message: "Apenas admins podem excluir avaliações." };

  const reviewId = String(formData.get("reviewId") ?? "");
  const eventSlug = String(formData.get("eventSlug") ?? "");
  if (!reviewId) return { ok: false, message: "ID da avaliação não informado." };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) return { ok: false, message: error.message };

  if (eventSlug) revalidatePath(`/eventos/${eventSlug}`);
  return { ok: true, message: "Avaliação excluída." };
}

export async function deleteCommentAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile) return { ok: false, message: "Não autorizado." };

  const isAdmin = profile.is_admin || profile.role === "admin";
  if (!isAdmin) return { ok: false, message: "Apenas admins podem excluir comentários." };

  const commentId = String(formData.get("commentId") ?? "");
  const eventSlug = String(formData.get("eventSlug") ?? "");
  if (!commentId) return { ok: false, message: "ID do comentário não informado." };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("event_comments").delete().eq("id", commentId);

  if (error) return { ok: false, message: error.message };

  if (eventSlug) revalidatePath(`/eventos/${eventSlug}`);
  return { ok: true, message: "Comentário excluído." };
}
