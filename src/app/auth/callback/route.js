import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Supabase email confirmation links redirect here with a `code` param.
// Exchanging it for a session is what actually logs the user in — without
// this route, clicking "confirm" just lands on the site with no session.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/services";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
