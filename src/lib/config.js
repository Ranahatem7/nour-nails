// Salon-wide booking settings.
// Working hours themselves live in the working_hours DB table (admin-editable) —
// see src/app/admin/hours/page.jsx and src/lib/slots.js.

// How many clients can be served at the same time (chairs / technicians)
export const CAPACITY = 2;

// How far apart slot start times are, in minutes
export const SLOT_INTERVAL = 30;
