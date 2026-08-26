import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  // Who's logged in?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → send to login
  if (!user) {
    redirect("/login");
  }

  // Logged in but not an admin → send home
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Passed both checks — render the admin area with a sub-nav
  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          borderBottom: "1px solid #444",
          paddingBottom: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <strong>Admin</strong>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/bookings">Bookings</Link>
        <Link href="/admin/services">Services</Link>
        <Link href="/admin/hours">Hours</Link>
      </div>

      {children}
    </div>
  );
}