"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import Spinner from "@/components/Spinner";
import theme from "@/lib/theme";

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
      <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "1.75rem", color: theme.colors.text, margin: "0 0 1.25rem" }}>
        Manage Bookings
      </h1>

      <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "flex-end", flexWrap: "wrap", marginBottom: theme.spacing.lg }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
            Filter by date
          </label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ width: "auto" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
            Filter by status
          </label>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        {(filterDate || filterStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterDate("");
              setFilterStatus("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {message && (
        <p style={{ background: theme.colors.dangerBg, color: theme.colors.danger, padding: "0.6rem 0.9rem", borderRadius: theme.radii.sm, fontSize: "0.9rem" }}>
          {message}
        </p>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: theme.spacing.xl }}>
          <Spinner />
        </div>
      ) : bookings.length === 0 ? (
        <p style={{ color: theme.colors.textMuted }}>No bookings found.</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b.id}
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md,
              boxShadow: theme.shadows.sm,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.sm,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: theme.spacing.sm }}>
              <strong>
                {b.booking_date} · {b.start_time} – {b.end_time}
              </strong>
              <StatusBadge status={b.status} />
            </div>
            <p style={{ margin: "0.5rem 0 0.2rem", color: theme.colors.text }}>Service: {b.services?.name}</p>
            <p style={{ margin: "0 0 0.75rem", color: theme.colors.textMuted, fontSize: "0.9rem" }}>
              Customer: {b.profiles?.full_name || "Unknown"}
              {b.profiles?.phone ? ` · ${b.profiles.phone}` : ""}
            </p>
            <Select
              value={b.status}
              onChange={(e) => handleStatusChange(b.id, e.target.value)}
              style={{ width: "auto" }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        ))
      )}
    </div>
  );
}
