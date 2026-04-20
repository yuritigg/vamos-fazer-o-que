"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/auth";

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail({
  email,
  password,
  fullName,
  role = "espectador",
}: {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}) {
  const supabase = await createServerSupabaseClient();
  const redirectBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${redirectBase}/api/auth/callback?role=${role}`,
      data: {
        full_name: fullName,
        role,
      },
    },
  });
}

export async function signInWithGoogle(role: UserRole = "espectador") {
  const supabase = await createServerSupabaseClient();
  const redirectBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${redirectBase}/api/auth/callback?role=${role}`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
}
