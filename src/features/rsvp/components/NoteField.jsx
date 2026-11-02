import { LIMITS } from '../constants/rsvp.constants.js';
import { STRINGS } from '../strings/rsvp.strings.js';
import { fillTemplate } from '../utils/rsvp.utils.js';

/** Optional message, with a characters-left counter. */
export default function NoteField({ value, onChange, disabled }) {
  return (
    <div className="field">
      <label htmlFor="message">{STRINGS.noteLabel} <span className="opt">{STRINGS.optional}</span></label>
      <textarea
        id="message"
        rows={4}
        maxLength={LIMITS.NOTE_MAX}
        value={value}
        disabled={disabled}
        aria-describedby="hint-message count-message"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="hint" id="hint-message">{STRINGS.noteHint}</p>
      <p className="hint" id="count-message">{fillTemplate(STRINGS.noteCount, { n: LIMITS.NOTE_MAX - value.length })}</p>
    </div>
  );
}
