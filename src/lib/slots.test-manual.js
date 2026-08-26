import { getAvailableSlots } from "./slots.js";

// A day open 12:00-19:00 (e.g. any non-Monday).
const openDay = { is_open: true, open_time: "12:00", close_time: "19:00" };

// A closed day (e.g. Monday).
const closedDay = { is_open: false, open_time: null, close_time: null };

// Test 1: 30-min service, no existing bookings
console.log("Test 1 - 30min, empty day:");
console.log(getAvailableSlots(openDay, 30, []));

// Test 2: 90-min service, no bookings (fewer slots, must finish by 19:00)
console.log("\nTest 2 - 90min, empty day:");
console.log(getAvailableSlots(openDay, 90, []));

// Test 3: 30-min service, with an existing 14:00-15:30 booking
console.log("\nTest 3 - 30min, one booking 14:00-15:30:");
console.log(
  getAvailableSlots(openDay, 30, [{ start_time: "14:00", end_time: "15:30" }])
);

// Test 4: closed day - should be empty
console.log("\nTest 4 - closed day:");
console.log(getAvailableSlots(closedDay, 30, []));
