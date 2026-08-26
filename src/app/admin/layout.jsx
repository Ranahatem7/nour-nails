import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import NavLink from "@/components/NavLink";
import theme from "@/lib/theme";

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
    <div style={{ padding: `${theme.spacing.lg} ${theme.spacing.lg}`, maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: theme.spacing.lg,
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}
      >
        <strong style={{ fontFamily: theme.fonts.heading, color: theme.colors.primary, fontSize: "1.1rem" }}>
          Admin
        </strong>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/bookings">Bookings</NavLink>
        <NavLink href="/admin/services">Services</NavLink>
        <NavLink href="/admin/hours">Hours</NavLink>
      </div>

      {children}
    </div>
  );
}
