import { VIEW } from '../constants/rsvp.constants.js';
import { STRINGS } from '../strings/rsvp.strings.js';
import { fillTemplate, peopleText } from '../utils/rsvp.utils.js';

/**
 * "Dear {name}" and the reserved places, for personal links. Placed in the RSVP card for now; to show it
 * elsewhere, move this component and pass it the same `invitation`, `view` and `busy` from useInvitation().
 */
export default function GuestGreeting({ invitation, view, busy }) {
  if (view === VIEW.LOADING) {
    if (busy) return <p className="rsvp-lead" role="status">{STRINGS.busy}</p>;
    return invitation.id ? <p className="rsvp-lead" role="status">{STRINGS.loading}</p> : null;
  }
  const guest = invitation.guest;
  if (!guest) return null;
  return (
    <p className="rsvp-lead">
      {fillTemplate(STRINGS.greeting, { name: guest.name })}
      <br />
      {fillTemplate(STRINGS.reserved, { people: peopleText(guest.pax) })}
    </p>
  );
}
