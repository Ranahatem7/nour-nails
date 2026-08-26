import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";
import NavLink from "./NavLink";
import theme from "@/lib/theme";

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
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: theme.spacing.md,
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <Image src="/logo.png" alt="Nour Nails" width={40} height={40} priority style={{ objectFit: "contain" }} />
        <span
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: "1.3rem",
            fontWeight: 600,
            color: theme.colors.primary,
          }}
        >
          Nour Nails
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: theme.spacing.lg }}>
        <NavLink href="/services">Services</NavLink>

        {user ? (
          <>
            <NavLink href="/bookings">My Bookings</NavLink>
            {profile?.is_admin && <NavLink href="/admin">Admin</NavLink>}
            <span style={{ color: theme.colors.textMuted, fontSize: "0.9rem" }}>
              Hi, {profile?.full_name || "there"}
            </span>
            <LogoutButton />
          </>
        ) : (
          <NavLink href="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
}
