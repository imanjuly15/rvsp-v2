import { ATTENDING } from '../constants/rsvp.constants.js';
import { STRINGS } from '../strings/rsvp.strings.js';

const OPTIONS = [[ATTENDING.YES, STRINGS.yes], [ATTENDING.NO, STRINGS.no]];

/** Yes / No as a radio group (the design styles radios, and a radio group is announced as one choice). */
export default function AttendanceChoice({ value, onChange, error, inputRef, disabled }) {
  return (
    <fieldset className="choice">
      <legend>{STRINGS.attendLegend}</legend>
      {OPTIONS.map(([option, label], i) => (
        <label className="choice-opt" key={option}>
          <input
            ref={i === 0 ? inputRef : null}
            type="radio"
            name="attending"
            checked={value === option}
            disabled={disabled}
            onChange={() => onChange(option)}
          />
          <span>{label}</span>
        </label>
      ))}
      {error && <p className="err" role="alert">{error}</p>}
    </fieldset>
  );
}
