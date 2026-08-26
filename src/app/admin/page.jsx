import { createClient } from "@/lib/supabase-server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Today's date as YYYY-MM-DD (local)
  const today = new Date().toISOString().split("T")[0];

  // Today's bookings (with service info), earliest first
  const { data: todayBookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, status, services ( name, price )")
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

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem 0" }}>
        <div style={{ border: "1px solid #444", padding: "1rem", minWidth: "140px" }}>
          <p>Today's Appointments</p>
          <h2>{todayBookings?.length || 0}</h2>
        </div>

        <div style={{ border: "1px solid #444", padding: "1rem", minWidth: "140px" }}>
          <p>Upcoming Bookings</p>
          <h2>{upcomingCount || 0}</h2>
        </div>

        <div style={{ border: "1px solid #444", padding: "1rem", minWidth: "140px" }}>
          <p>Revenue (completed)</p>
          <h2>{revenue} EGP</h2>
        </div>
      </div>

      {/* Today's schedule */}
      <h2>Today's Schedule</h2>
      {!todayBookings || todayBookings.length === 0 ? (
        <p>No appointments today.</p>
      ) : (
        todayBookings.map((b) => (
          <div
            key={b.id}
            style={{ border: "1px solid #444", padding: "0.75rem", marginBottom: "0.5rem" }}
          >
            <strong>
              {b.start_time} – {b.end_time}
            </strong>
            <span> · {b.services?.name}</span>
            <span> · {b.status}</span>
          </div>
        ))
      )}
    </div>
  );
}