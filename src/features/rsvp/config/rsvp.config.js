/*
 * Per-deployment RSVP settings. The values come from environment variables (see .env.example), so
 * switching from the mock to the live Sheet needs no code change:
 *   VITE_RSVP_USE_MOCK=false
 *   VITE_RSVP_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 * The script URL is public by design (every guest's browser calls it), so it is not a secret.
 * Event details (date, venue) stay in src/event.js; the deadline, caps and contact link come from the Sheet.
 */

// import.meta.env exists in Vite builds; the fallback lets the unit tests import this file under plain Node.
const env = import.meta.env || {};

export const RSVP_CONFIG = {
  scriptUrl: (env.VITE_RSVP_SCRIPT_URL || '').trim(),

  // Only the exact text "true" turns the mock on, so a missing variable can never ship fake RSVPs to guests.
  useMock: env.VITE_RSVP_USE_MOCK === 'true',

  // Values the offline mock pretends the Sheet holds. Ignored when useMock is false.
  mock: {
    deadline: '2026-12-31',
    sharedMaxPax: 4,
    contactUrl: 'https://wa.me/60120000000',
    delayMs: 500,
  },
};
