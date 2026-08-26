"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const STATUS_OPTIONS = ["confirmed", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const supabase = createClient();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setMessage("");

    let query = supabase
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        start_time,
        end_time,
        status,
        services ( name, price ),
        profiles ( full_name, phone )
      `
      )
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (filterDate) query = query.eq("booking_date", filterDate);
    if (filterStatus) query = query.eq("status", filterStatus);

    const { data, error } = await query;

    if (error) {
      setMessage("Could not load bookings: " + error.message);
    } else {
      setBookings(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterStatus]);

  const handleStatusChange = async (bookingId, newStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      setMessage("Could not update status: " + error.message);
      return;
    }

    loadBookings();
  };

  return (
    <div>
      <h1>Manage Bookings</h1>

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", margin: "1rem 0" }}>
        <div>
          <label>Filter by date</label>
          <br />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div>
          <label>Filter by status</label>
          <br />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {(filterDate || filterStatus) && (
          <button
            onClick={() => {
              setFilterDate("");
              setFilterStatus("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {message && <p>{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #444",
              padding: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <p>
              <strong>
                {b.booking_date} · {b.start_time} – {b.end_time}
              </strong>
            </p>
            <p>Service: {b.services?.name}</p>
            <p>
              Customer: {b.profiles?.full_name || "Unknown"}
              {b.profiles?.phone ? ` · ${b.profiles.phone}` : ""}
            </p>
            <p>
              Status:{" "}
              <select
                value={b.status}
                onChange={(e) => handleStatusChange(b.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </p>
          </div>
        ))
      )}
    </div>
  );
}
