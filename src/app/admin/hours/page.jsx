"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import theme from "@/lib/theme";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Postgres "time" columns come back as "HH:MM:SS" — trim to "HH:MM" for <input type="time">
const toInputTime = (time) => (time ? time.slice(0, 5) : "");

export default function AdminHoursPage() {
  const supabase = createClient();

  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadHours = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("working_hours")
      .select("*")
      .order("day_of_week", { ascending: true });

    if (error) {
      setMessage("Could not load working hours: " + error.message);
    } else {
      setHours(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadHours();
  }, []);

  const updateDay = (dayOfWeek, changes) => {
    setHours((prev) =>
      prev.map((day) =>
        day.day_of_week === dayOfWeek ? { ...day, ...changes } : day
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    // The 7 rows are fixed (seeded once in SQL) — every save just updates them.
    const results = await Promise.all(
      hours.map((day) =>
        supabase
          .from("working_hours")
          .update({
            is_open: day.is_open,
            open_time: day.is_open ? day.open_time : null,
            close_time: day.is_open ? day.close_time : null,
          })
          .eq("day_of_week", day.day_of_week)
      )
    );

    setSaving(false);

    const failed = results.find((r) => r.error);
    if (failed) {
      setMessage("Could not save: " + failed.error.message);
      return;
    }

    setMessage("Hours saved.");
    loadHours();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: theme.spacing.xl }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "1.75rem", color: theme.colors.text, margin: "0 0 1.25rem" }}>
        Working Hours
      </h1>

      {message && (
        <p
          style={{
            background: message.startsWith("Hours saved") ? theme.colors.successBg : theme.colors.dangerBg,
            color: message.startsWith("Hours saved") ? theme.colors.success : theme.colors.danger,
            padding: "0.6rem 0.9rem",
            borderRadius: theme.radii.sm,
            fontSize: "0.9rem",
            marginBottom: theme.spacing.md,
          }}
        >
          {message}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, maxWidth: "560px" }}>
        {hours.map((day) => (
          <div
            key={day.day_of_week}
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.md,
              flexWrap: "wrap",
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md,
              padding: theme.spacing.sm,
            }}
          >
            <strong style={{ width: "90px", fontFamily: theme.fonts.heading, fontSize: "0.95rem" }}>
              {DAY_NAMES[day.day_of_week]}
            </strong>

            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem" }}>
              <input
                type="checkbox"
                checked={day.is_open}
                onChange={(e) =>
                  updateDay(day.day_of_week, { is_open: e.target.checked })
                }
              />
              Open
            </label>

            <Input
              type="time"
              value={toInputTime(day.open_time)}
              disabled={!day.is_open}
              onChange={(e) =>
                updateDay(day.day_of_week, { open_time: e.target.value })
              }
              style={{ width: "auto" }}
            />
            <span style={{ color: theme.colors.textMuted }}>to</span>
            <Input
              type="time"
              value={toInputTime(day.close_time)}
              disabled={!day.is_open}
              onChange={(e) =>
                updateDay(day.day_of_week, { close_time: e.target.value })
              }
              style={{ width: "auto" }}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} style={{ marginTop: theme.spacing.lg }}>
        {saving ? (
          <>
            <Spinner size={14} /> Saving...
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </div>
  );
}
