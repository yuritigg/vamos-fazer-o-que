import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RegionalEvent } from "@/types/event";

type EventImageRow = { image_url: string; is_cover: boolean };
type NamedUserRow = { full_name: string | null };
type ReviewRow = { id: string; rating: number; comment: string | null; users: NamedUserRow[] | null };
type CommentRow = { id: string; message: string; created_at: string; users: NamedUserRow[] | null };
type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: RegionalEvent["category"];
  event_date: string;
  start_time: string;
  city: string;
  state: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: RegionalEvent["status"];
  organizers: { display_name: string | null }[] | null;
  event_images: EventImageRow[] | null;
  reviews: ReviewRow[] | null;
  event_comments?: CommentRow[] | null;
};

function toRegionalEvent(row: EventRow): RegionalEvent {
  const cover = row.event_images?.find((img) => img.is_cover) ?? row.event_images?.[0];
  const reviews = (row.reviews ?? []).map((review) => ({
    id: review.id,
    author: review.users?.[0]?.full_name ?? "Usuário",
    rating: review.rating,
    comment: review.comment ?? "",
  }));
  const comments = (row.event_comments ?? []).map((comment) => ({
    id: comment.id,
    author: comment.users?.[0]?.full_name ?? "Usuário",
    message: comment.message,
    createdAt: comment.created_at,
  }));
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) /
        reviews.length
      : 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    date: row.event_date,
    startTime: row.start_time,
    imageUrl: cover?.image_url ?? "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    organizerName: row.organizers?.[0]?.display_name ?? "Organizador",
    location: {
      cidade: row.city,
      estado: row.state,
      endereco: row.address,
      latitude: Number(row.latitude ?? 0),
      longitude: Number(row.longitude ?? 0),
    },
    status: row.status,
    averageRating,
    reviews,
    comments,
  };
}

export async function getApprovedEventsFromDb() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, slug, title, description, category, event_date, start_time, city, state, address, latitude, longitude, status,
      organizers (display_name),
      event_images (image_url, is_cover),
      reviews (id, rating, comment, users (full_name))
    `,
    )
    .eq("status", "aprovado")
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Erro ao buscar eventos aprovados:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as EventRow[]).map(toRegionalEvent);
}

export async function getEventBySlugFromDb(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, slug, title, description, category, event_date, start_time, city, state, address, latitude, longitude, status,
      organizers (display_name),
      event_images (image_url, is_cover),
      reviews (id, rating, comment, users (full_name)),
      event_comments (id, message, created_at, users (full_name))
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toRegionalEvent(data as unknown as EventRow);
}

export async function getPendingEventsFromDb() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, title, category, created_at, status,
      organizers (display_name, users (full_name))
    `,
    )
    .eq("status", "pendente")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pendentes:", error.message);
    return [];
  }

  return data ?? [];
}
