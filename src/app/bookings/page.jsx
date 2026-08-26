"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import Spinner from "@/components/Spinner";
import theme from "@/lib/theme";

export default function BookingsPage() {
  const supabase = createClient();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadBookings = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in to see your bookings.");
      setLoading(false);
      return;
    }

    // Join: pull the related service's name/price for each booking
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        start_time,
        end_time,
        status,
        services ( name, price )
      `
      )
      .order("booking_date", { ascending: false });

    if (error) {
      setMessage("Could not load bookings.");
    } else {
      setBookings(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      setMessage("Could not cancel: " + error.message);
      return;
    }

    // Refresh the list to show the new status
    loadBookings();
  };

  if (loading) {
    return (
      <div style={{ padding: theme.spacing.xl, display: "flex", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (message) {
    return <p style={{ padding: theme.spacing.xl, textAlign: "center", color: theme.colors.textMuted }}>{message}</p>;
  }

  return (
    <div style={{ padding: `${theme.spacing.xl} ${theme.spacing.lg}`, maxWidth: "650px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "2rem", color: theme.colors.text, margin: "0 0 1.5rem" }}>
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <p style={{ color: theme.colors.textMuted }}>You have no bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md,
              boxShadow: theme.shadows.sm,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.md,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.sm }}>
              <h3 style={{ fontFamily: theme.fonts.heading, margin: 0, fontSize: "1.15rem" }}>
                {booking.services?.name}
              </h3>
              <StatusBadge status={booking.status} />
            </div>

            <p style={{ color: theme.colors.textMuted, margin: "0.6rem 0 0.25rem" }}>
              {booking.booking_date} · {booking.start_time} – {booking.end_time}
            </p>
            <p style={{ color: theme.colors.primary, fontWeight: 600, margin: "0 0 0.9rem" }}>
              {booking.services?.price} EGP
            </p>

            {booking.status === "confirmed" && (
              <Button variant="danger" size="sm" onClick={() => handleCancel(booking.id)}>
                Cancel booking
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
