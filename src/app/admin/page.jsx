import { createClient } from "@/lib/supabase-server";
import StatusBadge from "@/components/StatusBadge";
import theme from "@/lib/theme";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Today's date as YYYY-MM-DD (local)
  const today = new Date().toISOString().split("T")[0];

  // Today's bookings (with service info), earliest first
  const { data: todayBookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, status, customer_name, customer_phone, services ( name, price )")
    .eq("booking_date", today)
    .neq("status", "cancelled")
    .order("start_time", { ascending: true });

  // Count of upcoming bookings (today and later, not cancelled)
  const { count: upcomingCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .gte("booking_date", today)
    .neq("status", "cancelled");

  // Completed bookings, to sum revenue
  const { data: completed } = await supabase
    .from("bookings")
    .select("services ( price )")
    .eq("status", "completed");

  const revenue = (completed || []).reduce(
    (sum, b) => sum + (b.services?.price || 0),
    0
  );

  const stats = [
    { label: "Today's Appointments", value: todayBookings?.length || 0 },
    { label: "Upcoming Bookings", value: upcomingCount || 0 },
    { label: "Revenue (completed)", value: `${revenue} EGP` },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "1.75rem", color: theme.colors.text, margin: "0 0 1.25rem" }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: theme.spacing.md, flexWrap: "wrap", marginBottom: theme.spacing.xl }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md,
              boxShadow: theme.shadows.sm,
              padding: theme.spacing.lg,
              minWidth: "160px",
              flex: "1 1 160px",
            }}
          >
            <p style={{ color: theme.colors.textMuted, margin: "0 0 0.4rem", fontSize: "0.85rem" }}>{stat.label}</p>
            <h2 style={{ fontFamily: theme.fonts.heading, color: theme.colors.primary, margin: 0, fontSize: "1.75rem" }}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <h2 style={{ fontFamily: theme.fonts.heading, fontSize: "1.25rem", color: theme.colors.text, margin: "0 0 0.75rem" }}>
        Today's Schedule
      </h2>
      {!todayBookings || todayBookings.length === 0 ? (
        <p style={{ color: theme.colors.textMuted }}>No appointments today.</p>
      ) : (
        todayBookings.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: theme.spacing.sm,
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.sm,
              padding: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
            }}
          >
            <strong style={{ minWidth: "110px" }}>
              {b.start_time} – {b.end_time}
            </strong>
            <span style={{ color: theme.colors.textMuted }}>{b.services?.name}</span>
            <span style={{ color: theme.colors.textMuted }}>
              · {b.customer_name || "Unknown"}
              {b.customer_phone ? ` · ${b.customer_phone}` : ""}
            </span>
            <StatusBadge status={b.status} />
          </div>
        ))
      )}
    </div>
  );
}
