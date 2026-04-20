import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = (requestUrl.searchParams.get("role") as UserRole | null) ?? "espectador";

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("users")
        .upsert({
          id: user.id,
          full_name: user.user_metadata.full_name ?? user.email ?? "Usuário",
          email: user.email,
          role,
        });

      if (role === "organizador") {
        await supabase.from("organizers").upsert({
          user_id: user.id,
          display_name: user.user_metadata.full_name ?? user.email ?? "Organizador",
        });
      }
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
