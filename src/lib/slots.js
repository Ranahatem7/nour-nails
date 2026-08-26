import { SLOT_INTERVAL, CAPACITY } from "./config.js";

// Convert "14:30" (or "14:30:00") -> 870 (minutes since midnight). Makes math easy.
function timeToMinutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

// Convert 870 -> "14:30"
function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Two time ranges overlap if one starts before the other ends, and vice versa.
function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Calculate available start times for a service, given the day's working hours.
 *
 * @param {{is_open: boolean, open_time: string, close_time: string}|null} dayHours -
 *   the working_hours row for the day being booked (or null/is_open:false if closed).
 *   Callers look this up from the DB by day-of-week before calling.
 * @param {number} serviceDuration - service length in minutes
 * @param {Array} existingBookings - [{ start_time, end_time }] already booked that day
 * @returns {string[]} available start times like ["12:00", "12:30", ...]
 */
export function getAvailableSlots(dayHours, serviceDuration, existingBookings = []) {
  // Closed that day
  if (!dayHours || !dayHours.is_open) {
    return [];
  }

  const openMinutes = timeToMinutes(dayHours.open_time);
  const closeMinutes = timeToMinutes(dayHours.close_time);

  const bookedRanges = existingBookings.map((b) => ({
    start: timeToMinutes(b.start_time),
    end: timeToMinutes(b.end_time),
  }));

  const available = [];

  for (
    let slotStart = openMinutes;
    slotStart + serviceDuration <= closeMinutes;
    slotStart += SLOT_INTERVAL
  ) {
    const slotEnd = slotStart + serviceDuration;

    // Count how many existing bookings overlap this slot
    const overlappingCount = bookedRanges.filter((booked) =>
      overlaps(slotStart, slotEnd, booked.start, booked.end)
    ).length;

    // Slot is available only if there's a free chair
    if (overlappingCount < CAPACITY) {
      available.push(minutesToTime(slotStart));
    }
  }

  return available;
}
