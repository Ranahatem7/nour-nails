import { WORKING_HOURS, SLOT_INTERVAL, CAPACITY } from "./config.js";

// Convert "14:30" -> 870 (minutes since midnight). Makes math easy.
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
 * Calculate available start times for a service on a given date.
 *
 * @param {Date} date - the day being booked
 * @param {number} serviceDuration - service length in minutes
 * @param {Array} existingBookings - [{ start_time, end_time }] already booked that day
 * @returns {string[]} available start times like ["12:00", "12:30", ...]
 */
export function getAvailableSlots(date, serviceDuration, existingBookings = []) {
  const dayOfWeek = date.getDay(); // 0 = Sunday ... 6 = Saturday
  const hours = WORKING_HOURS[dayOfWeek];

  // Closed that day
  if (!hours) {
    return [];
  }

  const openMinutes = timeToMinutes(hours.open);
  const closeMinutes = timeToMinutes(hours.close);

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