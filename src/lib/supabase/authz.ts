import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUserProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, role, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function getOrganizerByUserId(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("organizers").select("id, display_name").eq("user_id", userId).maybeSingle();
  return data;
}
