import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const supabase = await createClient();

  // Get the currently logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, fetch their profile for the name
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, is_admin")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      <Link href="/">Nour Nails</Link>
      <Link href="/services">Services</Link>

      {user ? (
        <>
          <Link href="/bookings">My Bookings</Link>
          {profile?.is_admin && <Link href="/admin">Admin</Link>}
          <span>Hi, {profile?.full_name || "there"}</span>
          <LogoutButton />
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}