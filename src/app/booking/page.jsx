"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getAvailableSlots } from "@/lib/slots";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import SlotButton from "@/components/SlotButton";
import Spinner from "@/components/Spinner";
import theme from "@/lib/theme";

export default function BookingPage() {
  const supabase = createClient();

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState("");

  // Contact details for this booking — prefilled from the customer's profile
  // (if set) but editable, since the salon needs a reliable name/phone per booking.
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Working hours per day of week, keyed by day_of_week (0-6). Just 7 rows,
  // so it's cheapest to fetch once and look up locally as the date changes.
  const [workingHours, setWorkingHours] = useState({});
  const [hoursLoaded, setHoursLoaded] = useState(false);

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

  // Load working hours once when the page mounts
  useEffect(() => {
    const loadWorkingHours = async () => {
      const { data } = await supabase.from("working_hours").select("*");

      const byDay = {};
      (data || []).forEach((row) => {
        byDay[row.day_of_week] = row;
      });

      setWorkingHours(byDay);
      setHoursLoaded(true);
    };
    loadWorkingHours();
  }, []);

  // Prefill contact details from the logged-in customer's profile, if set
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) setCustomerName(profile.full_name);
      if (profile?.phone) setCustomerPhone(profile.phone);
    };
    loadProfile();
  }, []);

  // The full service object for the selected id
  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Recalculate slots whenever service or date changes
  useEffect(() => {
    const calculateSlots = async () => {
      // Need a service, a date, and the working hours to have loaded
      if (!selectedServiceId || !selectedDate || !hoursLoaded) {
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
      const dayHours = workingHours[dateObj.getDay()];

      const available = getAvailableSlots(
        dayHours,
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
  }, [selectedServiceId, selectedDate, hoursLoaded]);

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

    if (!customerName.trim() || !customerPhone.trim()) {
      setMessage("Please enter your name and phone number.");
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
    const dayHours = workingHours[dateObj.getDay()];

    const stillAvailable = getAvailableSlots(
      dayHours,
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
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
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
      dayHours,
      selectedService.duration_minutes,
      [
        ...(currentBookings || []),
        { start_time: selectedSlot, end_time: endTime },
      ]
    );
    setSlots(refreshed);
  };

  return (
    <div style={{ padding: `${theme.spacing.xl} ${theme.spacing.lg}`, maxWidth: "560px", margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: theme.fonts.heading,
          fontSize: "2rem",
          color: theme.colors.text,
          textAlign: "center",
          margin: "0 0 1.75rem",
        }}
      >
        Book an Appointment
      </h1>

      <div
        style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.lg,
          boxShadow: theme.shadows.sm,
          padding: theme.spacing.lg,
        }}
      >
        {/* Step 1: choose a service */}
        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem" }}>
            Service
          </label>
          <Select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">-- Select a service --</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — {service.price} EGP ({service.duration_minutes} min)
              </option>
            ))}
          </Select>
        </div>

        {/* Preview of the selected service */}
        {selectedService && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.md,
              marginBottom: theme.spacing.md,
              padding: theme.spacing.sm,
              background: theme.colors.surfaceAlt,
              borderRadius: theme.radii.md,
            }}
          >
            {selectedService.image_url ? (
              <img
                src={selectedService.image_url}
                alt={selectedService.name}
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "cover",
                  borderRadius: theme.radii.sm,
                }}
              />
            ) : (
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.colors.border,
                  color: theme.colors.textMuted,
                  fontSize: "0.7rem",
                  textAlign: "center",
                  borderRadius: theme.radii.sm,
                  padding: "0.25rem",
                }}
              >
                No image
              </div>
            )}
            <div>
              <strong style={{ fontFamily: theme.fonts.heading, fontSize: "1.05rem" }}>
                {selectedService.name}
              </strong>
              <p style={{ margin: "0.2rem 0 0", color: theme.colors.textMuted, fontSize: "0.9rem" }}>
                {selectedService.price} EGP · {selectedService.duration_minutes} min
              </p>
            </div>
          </div>
        )}

        {/* Step 2: choose a date */}
        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem" }}>
            Date
          </label>
          <Input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {loadingSlots && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: theme.colors.textMuted }}>
            <Spinner /> Loading slots...
          </div>
        )}

        {message && (
          <p
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: theme.radii.sm,
              background: message.startsWith("Booked!") ? theme.colors.successBg : theme.colors.dangerBg,
              color: message.startsWith("Booked!") ? theme.colors.success : theme.colors.danger,
              fontSize: "0.9rem",
            }}
          >
            {message}
          </p>
        )}

        {slots.length > 0 && (
          <div>
            <h3 style={{ fontFamily: theme.fonts.heading, fontSize: "1.1rem", margin: "0 0 0.75rem" }}>
              Available times
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {slots.map((slot) => (
                <SlotButton
                  key={slot}
                  time={slot}
                  selected={selectedSlot === slot}
                  onClick={() => setSelectedSlot(slot)}
                />
              ))}
            </div>
          </div>
        )}

        {selectedSlot && (
          <div style={{ marginTop: theme.spacing.lg }}>
            <p style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
              {selectedService?.name} on {selectedDate} at {selectedSlot}
            </p>

            <h3 style={{ fontFamily: theme.fonts.heading, fontSize: "1.1rem", margin: "0 0 0.75rem" }}>
              Your Details
            </h3>

            <div style={{ marginBottom: theme.spacing.sm }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem" }}>
                Name
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem" }}>
                Phone number
              </label>
              <Input
                type="tel"
                placeholder="Your phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <Button onClick={handleBooking} fullWidth size="lg">
              Confirm booking
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}