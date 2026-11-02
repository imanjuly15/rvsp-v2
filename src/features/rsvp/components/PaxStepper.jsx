import { LIMITS } from '../constants/rsvp.constants.js';
import { STRINGS } from '../strings/rsvp.strings.js';
import { fillTemplate } from '../utils/rsvp.utils.js';

/** Number of people, from 1 to max (max comes from the Sheet). */
export default function PaxStepper({ value, max, onChange, disabled }) {
  return (
    <div className="field">
      <span className="label" id="pax-label">{STRINGS.paxLabel}</span>
      <div className="stepper" role="group" aria-labelledby="pax-label">
        <button type="button" aria-label={STRINGS.paxFewer} disabled={disabled || value <= LIMITS.PAX_MIN} onClick={() => onChange(value - 1)}>&minus;</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={STRINGS.paxMore} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
      <p className="hint">{fillTemplate(STRINGS.paxHint, { max })}</p>
    </div>
  );
}
