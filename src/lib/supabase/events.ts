import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AgeRating, RegionalEvent } from "@/types/event";

type EventImageRow = { image_url: string; is_cover: boolean };
type NamedUserRow = { full_name: string | null };
type ReviewRow = { id: string; rating: number; comment: string | null; users: NamedUserRow[] | null };
type CommentRow = { id: string; message: string; created_at: string; users: NamedUserRow[] | null };
type OrganizerRow = { id: string; display_name: string | null };
type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: RegionalEvent["category"];
  age_rating: string | null;
  cover_image_url: string | null;
  event_date: string;
  start_time: string;
  city: string;
  state: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: RegionalEvent["status"];
  organizers: OrganizerRow[] | null;
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
      ? reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviews.length
      : 0;

  const coverUrl =
    row.cover_image_url ??
    cover?.image_url ??
    null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    ageRating: (row.age_rating as AgeRating) ?? "Livre",
    date: row.event_date,
    startTime: row.start_time,
    imageUrl:
      coverUrl ??
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
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

const EVENT_SELECT = `
  id, slug, title, description, category, age_rating, cover_image_url, event_date, start_time,
  city, state, address, latitude, longitude, status,
  organizers (id, display_name),
  event_images (image_url, is_cover),
  reviews (id, rating, comment, users (full_name))
`;

interface SearchOptions {
  category?: string;
  q?: string;
}

export async function getApprovedEventsFromDb(options?: SearchOptions) {
  const supabase = await createServerSupabaseClient();
  const { category, q } = options ?? {};

  let query = supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "aprovado")
    .order("event_date", { ascending: true });

  if (category && category !== "") {
    query = query.eq("category", category);
  }

  if (q && q.trim()) {
    const safe = q.trim().replace(/[%_\\]/g, "\\$&");

    const { data: matchingOrgs } = await supabase
      .from("organizers")
      .select("id")
      .ilike("display_name", `%${safe}%`);

    const orgIds = ((matchingOrgs ?? []) as { id: string }[]).map((o) => o.id);

    let orFilter = `title.ilike.%${safe}%,category.ilike.%${safe}%`;
    if (orgIds.length > 0) {
      orFilter += `,organizer_id.in.(${orgIds.join(",")})`;
    }

    query = query.or(orFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar eventos:", error.message);
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
      id, slug, title, description, category, age_rating, cover_image_url, event_date, start_time,
      city, state, address, latitude, longitude, status,
      organizers (id, display_name),
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

export type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  age_rating: string | null;
  cover_image_url: string | null;
  event_date: string;
  start_time: string;
  city: string;
  state: string;
  address: string;
  status: "pendente" | "aprovado" | "reprovado";
  created_at: string;
  organizerName: string;
};

export async function getAdminEventsFromDb(): Promise<AdminEvent[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, slug, title, description, category, age_rating, cover_image_url,
      event_date, start_time, city, state, address, status, created_at,
      organizers (display_name, users (full_name))
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar eventos admin:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as Array<{
    id: string; slug: string; title: string; description: string; category: string;
    age_rating: string | null; cover_image_url: string | null;
    event_date: string; start_time: string; city: string; state: string; address: string;
    status: "pendente" | "aprovado" | "reprovado"; created_at: string;
    organizers: Array<{ display_name: string | null; users: Array<{ full_name: string | null }> | null }> | null;
  }>).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    age_rating: row.age_rating,
    cover_image_url: row.cover_image_url,
    event_date: row.event_date,
    start_time: row.start_time,
    city: row.city,
    state: row.state,
    address: row.address,
    status: row.status,
    created_at: row.created_at,
    organizerName:
      row.organizers?.[0]?.display_name ??
      row.organizers?.[0]?.users?.[0]?.full_name ??
      "Organizador",
  }));
}
