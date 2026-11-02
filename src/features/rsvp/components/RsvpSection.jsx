import { useInvitation } from '../hooks/useInvitation.js';
import RsvpCard from './RsvpCard.jsx';

/**
 * Drop-in RSVP section: loads the invitation and shows the card. If another part of the page also needs
 * the guest's name, call useInvitation() once higher up and render <RsvpCard invitation={...} /> instead.
 */
export default function RsvpSection() {
  return <RsvpCard invitation={useInvitation()} />;
}
