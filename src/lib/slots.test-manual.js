import { getAvailableSlots } from "./slots.js";

// A Tuesday (open 12:00-19:00). 2026-09-01 is a Tuesday.
const date = new Date("2026-09-01");

// Test 1: 30-min service, no existing bookings
console.log("Test 1 - 30min, empty day:");
console.log(getAvailableSlots(date, 30, []));

// Test 2: 90-min service, no bookings (fewer slots, must finish by 19:00)
console.log("\nTest 2 - 90min, empty day:");
console.log(getAvailableSlots(date, 90, []));

// Test 3: 30-min service, with an existing 14:00-15:30 booking
console.log("\nTest 3 - 30min, one booking 14:00-15:30:");
console.log(
  getAvailableSlots(date, 30, [{ start_time: "14:00", end_time: "15:30" }])
);

// Test 4: a Monday (closed) - should be empty. 2026-08-31 is a Monday.
console.log("\nTest 4 - Monday (closed):");
console.log(getAvailableSlots(new Date("2026-08-31"), 30, []));