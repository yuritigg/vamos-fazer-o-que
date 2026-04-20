import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isOrganizerRoute = pathname.startsWith("/cadastro-evento");

  if (!isAdminRoute && !isOrganizerRoute) {
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = Boolean(profile?.is_admin || profile?.role === "admin");
  const isOrganizer = Boolean(profile?.role === "organizador");

  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("erro", "acesso-negado");
    return NextResponse.redirect(url);
  }

  if (isOrganizerRoute && !(isOrganizer || isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("erro", "apenas-organizadores");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
