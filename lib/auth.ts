export const AUTH_COOKIE_NAME = "precon_auth";

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function getExpectedPassword() {
  return process.env.APP_PASSWORD ?? "";
}

export function isPasswordConfigured() {
  return getExpectedPassword().length > 0;
}

export function isPasswordValid(password: string) {
  const expectedPassword = getExpectedPassword();

  return expectedPassword.length > 0 && password === expectedPassword;
}

export function getAuthMode() {
  if (isPasswordConfigured() && isSupabaseConfigured()) {
    return "hybrid" as const;
  }

  if (isSupabaseConfigured()) {
    return "supabase" as const;
  }

  if (isPasswordConfigured()) {
    return "password" as const;
  }

  return "open" as const;
}
