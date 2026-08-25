// Salon working hours
// Days: 0 = Sunday, 1 = Monday, ... 6 = Saturday
// null means closed that day

export const WORKING_HOURS = {
  0: { open: "12:00", close: "19:00" }, // Sunday
  1: null, // Monday - closed
  2: { open: "12:00", close: "19:00" }, // Tuesday
  3: { open: "12:00", close: "19:00" }, // Wednesday
  4: { open: "12:00", close: "19:00" }, // Thursday
  5: { open: "12:00", close: "19:00" }, // Friday
  6: { open: "12:00", close: "19:00" }, // Saturday
};

// How many clients can be served at the same time (chairs / technicians)
export const CAPACITY = 2;

// How far apart slot start times are, in minutes
export const SLOT_INTERVAL = 30;