"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Working Hours</h1>

      {message && <p>{message}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "550px" }}>
        {hours.map((day) => (
          <div
            key={day.day_of_week}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              border: "1px solid #444",
              padding: "0.75rem",
            }}
          >
            <strong style={{ width: "90px" }}>{DAY_NAMES[day.day_of_week]}</strong>

            <label>
              <input
                type="checkbox"
                checked={day.is_open}
                onChange={(e) =>
                  updateDay(day.day_of_week, { is_open: e.target.checked })
                }
              />{" "}
              Open
            </label>

            <input
              type="time"
              value={toInputTime(day.open_time)}
              disabled={!day.is_open}
              onChange={(e) =>
                updateDay(day.day_of_week, { open_time: e.target.value })
              }
            />
            <span>to</span>
            <input
              type="time"
              value={toInputTime(day.close_time)}
              disabled={!day.is_open}
              onChange={(e) =>
                updateDay(day.day_of_week, { close_time: e.target.value })
              }
            />
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving} style={{ marginTop: "1rem" }}>
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
