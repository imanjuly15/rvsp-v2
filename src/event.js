/* Everything the family may need to change lives here. Edit, then run "npm run build" and upload dist again. */
export const EVENT = {
  ceremony_name: 'Memorial Luncheon',

  // Malaysia time. Use '2026-11-07' while the time is unconfirmed, or '2026-11-07T10:30' once it is known.
  ceremony_datetime: '2026-11-07T12:00',
  ceremony_end: '15:00', // Optional finishing time, in 24-hour form.

  venue_name: 'India Gate Signature Restaurant',
  venue_address: 'Tropicana Golf & Country Resort, Tropicana, 47410 Petaling Jaya, Selangor',
  map_url: '', // Optional Google Maps link. Without one, directions are built from the venue name and address.
  dress_code: '',
  rsvp_deadline: '', // Not used any more: the RSVP deadline is read from the Google Sheet's Config tab.
  note: '',

  // Not used any more: RSVP answers go to the Google Sheet set in .env (see docs/rsvp-host-guide.md).
  rsvp_endpoint: '',
};
