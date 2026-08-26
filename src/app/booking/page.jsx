"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getAvailableSlots } from "@/lib/slots";

export default function BookingPage() {
  const supabase = createClient();

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState("");

  // Load services once when the page mounts
  useEffect(() => {
    const loadServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      setServices(data || []);
    };
    loadServices();
  }, []);

  // The full service object for the selected id
  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Recalculate slots whenever service or date changes
  useEffect(() => {
    const calculateSlots = async () => {
      // Need both a service and a date
      if (!selectedServiceId || !selectedDate) {
        setSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSelectedSlot("");
      setMessage("");

      // Fetch bookings already made for this date
      const { data: existingBookings } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("booking_date", selectedDate)
        .neq("status", "cancelled"); // ignore cancelled ones

      // Parse the date string as a local date (avoid timezone drift)
      const [year, month, day] = selectedDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);

      const available = getAvailableSlots(
        dateObj,
        selectedService.duration_minutes,
        existingBookings || []
      );

      setSlots(available);
      setLoadingSlots(false);

      if (available.length === 0) {
        setMessage("No available slots for this day. Try another date.");
      }
    };

    calculateSlots();
  }, [selectedServiceId, selectedDate]);

  // Don't allow booking dates in the past
  const today = new Date().toISOString().split("T")[0];

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setMessage("");

    // Must be logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in to book an appointment.");
      return;
    }

    // Re-validate availability RIGHT NOW (the slot may have filled since load)
    const { data: currentBookings } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("booking_date", selectedDate)
      .neq("status", "cancelled");

    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    const stillAvailable = getAvailableSlots(
      dateObj,
      selectedService.duration_minutes,
      currentBookings || []
    );

    if (!stillAvailable.includes(selectedSlot)) {
      setMessage("Sorry, that slot was just taken. Please pick another.");
      // Refresh the slot list so they see current availability
      setSlots(stillAvailable);
      setSelectedSlot("");
      return;
    }

    // Compute end_time from start + duration
    const [h, m] = selectedSlot.split(":").map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + selectedService.duration_minutes;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
      endMinutes % 60
    ).padStart(2, "0")}`;

    // Insert the booking
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: selectedService.id,
      booking_date: selectedDate,
      start_time: selectedSlot,
      end_time: endTime,
      status: "confirmed",
    });

    if (error) {
      setMessage("Something went wrong: " + error.message);
      return;
    }

    // Success
    setMessage(
      `Booked! ${selectedService.name} on ${selectedDate} at ${selectedSlot}`
    );
    setSelectedSlot("");

    // Recalculate slots so the just-booked slot reflects the new count
    const refreshed = getAvailableSlots(
      dateObj,
      selectedService.duration_minutes,
      [
        ...(currentBookings || []),
        { start_time: selectedSlot, end_time: endTime },
      ]
    );
    setSlots(refreshed);
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "500px" }}>
      <h1>Book an Appointment</h1>

      {/* Step 1: choose a service */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Service</label>
        <br />
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
        >
          <option value="">-- Select a service --</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} — {service.price} EGP ({service.duration_minutes}{" "}
              min)
            </option>
          ))}
        </select>
      </div>

      {/* Preview of the selected service */}
      {selectedService && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          {selectedService.image_url ? (
            <img
              src={selectedService.image_url}
              alt={selectedService.name}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#2a2a2a",
                color: "#999",
                fontSize: "0.75rem",
                textAlign: "center",
                borderRadius: "6px",
                padding: "0.25rem",
              }}
            >
              No image
            </div>
          )}
          <div>
            <strong>{selectedService.name}</strong>
            <p style={{ margin: 0 }}>
              {selectedService.price} EGP · {selectedService.duration_minutes} min
            </p>
          </div>
        </div>
      )}

      {/* Step 2: choose a date */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Date</label>
        <br />
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loadingSlots && <p>Loading slots...</p>}

      {message && <p>{message}</p>}

      {slots.length > 0 && (
        <div>
          <h3>Available times</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  fontWeight: selectedSlot === slot ? "bold" : "normal",
                  padding: "0.5rem 1rem",
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            {selectedService?.name} on {selectedDate} at {selectedSlot}
          </p>
          <button onClick={handleBooking} style={{ padding: "0.5rem 1rem" }}>
            Confirm booking
          </button>
        </div>
      )}
    </div>
  );
}