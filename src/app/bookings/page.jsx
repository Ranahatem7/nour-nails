"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

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

  if (loading) return <p style={{ padding: "1rem" }}>Loading...</p>;
  if (message) return <p style={{ padding: "1rem" }}>{message}</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px" }}>
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              border: "1px solid #444",
              padding: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <h3>{booking.services?.name}</h3>
            <p>
              {booking.booking_date} · {booking.start_time} – {booking.end_time}
            </p>
            <p>{booking.services?.price} EGP</p>
            <p>Status: {booking.status}</p>

            {booking.status === "confirmed" && (
              <button onClick={() => handleCancel(booking.id)}>
                Cancel booking
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}