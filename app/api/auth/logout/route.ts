import { NextResponse } from "next/server";

import { getAuthMode } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (getAuthMode() === "supabase") {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/login", request.url), 303);
}
