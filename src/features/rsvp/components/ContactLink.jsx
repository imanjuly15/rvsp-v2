import { STRINGS } from '../strings/rsvp.strings.js';

/** "Contact the host" button. Hidden when the Sheet's contact_link is empty (the service only passes https links). */
export default function ContactLink({ url }) {
  if (!url) return null;
  return <a className="pill-link" href={url} target="_blank" rel="noopener noreferrer">{STRINGS.contactHost}</a>;
}
